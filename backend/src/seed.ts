import {db} from './db.js';
import {hash} from './auth.js';

const now=new Date().toISOString();
const run=(s:string,...p:any[])=>db.prepare(s).run(...p);
const one=(s:string,...p:any[])=>db.prepare(s).get(...p) as any;

// Idempotent demo dataset: safe to run repeatedly in a competition/demo environment.
let user=one('SELECT id FROM users WHERE email=?','demo@stocksense.app');
if(!user){
  user={id:Number(run('INSERT INTO users(email,name,password_hash,role,created_at) VALUES(?,?,?,?,?)','demo@stocksense.app','Avery Morgan',hash('Demo@12345'),'manager',now).lastInsertRowid)};
}
const uid=Number(user.id);
let staff=one('SELECT id FROM users WHERE email=?','staff@stocksense.app');
if(!staff){staff={id:Number(run('INSERT INTO users(email,name,password_hash,role,created_at) VALUES(?,?,?,?,?)','staff@stocksense.app','Jordan Lee',hash('Staff@12345'),'warehouse_staff',now).lastInsertRowid)}}
const staffUid=Number(staff.id);

const warehouseData=[
  ['Main Warehouse','WH-MAIN'],
  ['Production Floor','WH-PROD'],
  ['Store 2','WH-STORE2'],
  ['Returns Hub','WH-RET']
];
for(const [name,code] of warehouseData)run('INSERT OR IGNORE INTO warehouses(name,code) VALUES(?,?)',name,code);
const warehouse=(code:string)=>Number(one('SELECT id FROM warehouses WHERE code=?',code).id);
const wMain=warehouse('WH-MAIN'),wProd=warehouse('WH-PROD'),wStore=warehouse('WH-STORE2'),wRet=warehouse('WH-RET');

const products=[
  ['Steel Rods','STL-001','Raw Materials','kg',50,120,7],
  ['Packaging Tape','PKG-TAP-48','Packaging','rolls',80,320,3],
  ['Aluminum Sheets','ALU-SHT-08','Raw Materials','sheets',150,480,14],
  ['Brake Pad Set','BRK-PAD-22','Finished Goods','sets',30,100,10],
  ['M8 Hex Bolts','BLT-M8-500','Hardware','boxes',40,160,5],
  ['Safety Helmets','HLM-007','Safety','pcs',25,100,7],
  ['Office Chairs','CHR-101','Finished Goods','pcs',30,120,7],
  ['Copper Wire','CPR-040','Raw Materials','m',150,600,10],
  ['Pallet Wrap','PAL-WRP-20','Packaging','rolls',25,100,4],
  ['Work Gloves','GLV-009','Safety','pairs',40,180,5]
];
for(const p of products)run('INSERT OR IGNORE INTO products(name,sku,category,uom,reorder_point,reorder_qty,lead_time_days,created_at) VALUES(?,?,?,?,?,?,?,?)',...p,now);
const pid=(sku:string)=>Number(one('SELECT id FROM products WHERE sku=?',sku).id);
const stockMap:[string,number,number][]= [
  ['STL-001',wMain,38],['STL-001',wProd,12],['STL-001',wStore,4],
  ['PKG-TAP-48',wMain,245],['PKG-TAP-48',wStore,48],
  ['ALU-SHT-08',wMain,620],['ALU-SHT-08',wProd,0],
  ['BRK-PAD-22',wMain,72],['BRK-PAD-22',wStore,16],
  ['BLT-M8-500',wMain,94],['BLT-M8-500',wProd,22],
  ['HLM-007',wMain,18],['HLM-007',wStore,12],
  ['CHR-101',wMain,86],['CHR-101',wStore,24],
  ['CPR-040',wMain,410],['CPR-040',wProd,90],
  ['PAL-WRP-20',wMain,19],['PAL-WRP-20',wStore,7],
  ['GLV-009',wMain,112],['GLV-009',wProd,18]
];
for(const [sku,w,q] of stockMap){
  const p=pid(sku);run('INSERT INTO stock(product_id,warehouse_id,quantity) VALUES(?,?,?) ON CONFLICT(product_id,warehouse_id) DO UPDATE SET quantity=excluded.quantity',p,w,q);
}

const makeDocIfMissing=(type:string,status:string,warehouse:number,partner:string,reference:string,product:string,qty:number)=>{
  if(one('SELECT id FROM documents WHERE reference=?',reference)) return Number(one('SELECT id FROM documents WHERE reference=?',reference).id);
  const id=Number(run('INSERT INTO documents(type,status,warehouse_id,partner,reference,created_by,created_at,completed_at) VALUES(?,?,?,?,?,?,?,?)',type,status,warehouse,partner,reference,uid,now,status==='done'?now:null).lastInsertRowid);
  run('INSERT INTO document_lines(document_id,product_id,quantity) VALUES(?,?,?)',id,pid(product),qty);
  return id;
};

// Rich demo queue: every document type has multiple lifecycle states so filters and operation pages are never empty.
[
  ['receipt','waiting',wMain,'Meridian Metals','RCV-1042','STL-001',50],
  ['receipt','ready',wStore,'PackRight Supplies','RCV-1041','PKG-TAP-48',120],
  ['receipt','done',wMain,'Bolt & Nut Co.','RCV-1040','BLT-M8-500',100],
  ['receipt','draft',wProd,'Northline Components','RCV-1043','CPR-040',60],
  ['receipt','canceled',wRet,'Apex Industrial','RCV-1044','ALU-SHT-08',80],
  ['delivery','ready',wMain,'Customer Order #1042','DEL-2208','BRK-PAD-22',20],
  ['delivery','done',wStore,'Customer Order #1041','DEL-2207','HLM-007',8],
  ['delivery','canceled',wProd,'Customer Order #1040','DEL-2206','GLV-009',12],
  ['delivery','draft',wMain,'Customer Order #1043','DEL-2209','CHR-101',6],
  ['delivery','waiting',wStore,'Customer Order #1044','DEL-2210','PAL-WRP-20',5],
  ['transfer','waiting',wMain,'Internal request · Main → Production','TRF-302','ALU-SHT-08',15],
  ['transfer','done',wMain,'Internal · Main → Production','TRF-301','STL-001',20],
  ['transfer','ready',wProd,'Internal request · Production → Store 2','TRF-303','BLT-M8-500',10],
  ['transfer','canceled',wStore,'Internal request · Store 2 → Returns','TRF-304','HLM-007',4],
  ['transfer','draft',wMain,'Internal request · Main → Store 2','TRF-305','PKG-TAP-48',30],
  ['adjustment','done',wStore,'Cycle Count','ADJ-091','BRK-PAD-22',-4],
  ['adjustment','done',wMain,'Damaged stock','ADJ-092','PAL-WRP-20',-3],
  ['adjustment','draft',wProd,'Cycle Count pending approval','ADJ-093','CPR-040',8],
  ['adjustment','canceled',wRet,'Data correction canceled','ADJ-094','GLV-009',-2],
  ['adjustment','waiting',wStore,'Physical count review','ADJ-095','CHR-101',3]
].forEach((d:any[])=>makeDocIfMissing(d[0],d[1],d[2],d[3],d[4],d[5],d[6]));

if(Number(one('SELECT COUNT(*) n FROM ledger').n)===0){
  const entries:[string,string,number,number,string,string][]=[
    ['STL-001','RCV-1042',wMain,88,'receipt','Vendor receipt'],
    ['STL-001','TRF-301',wMain,-20,'transfer','Internal transfer out'],
    ['STL-001','TRF-301',wProd,20,'transfer','Internal transfer in'],
    ['PKG-TAP-48','RCV-1040',wMain,100,'receipt','Vendor receipt'],
    ['BRK-PAD-22','DEL-2208',wMain,-20,'delivery','Customer shipment'],
    ['BRK-PAD-22','ADJ-091',wStore,-4,'adjustment','Damaged'],
    ['HLM-007','DEL-2207',wStore,-8,'delivery','Customer shipment'],
    ['BLT-M8-500','RCV-1040',wMain,100,'receipt','Vendor receipt']
  ];
  for(const [sku,source,w,delta,sourceType,reason] of entries){
    const product=one('SELECT id FROM products WHERE sku=?',sku);const after=Number(one('SELECT quantity FROM stock WHERE product_id=? AND warehouse_id=?',product.id,w)?.quantity||0);const before=after-delta;run('INSERT INTO ledger(product_id,warehouse_id,delta,before_qty,after_qty,source_type,source_id,reason,created_by,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)',product.id,w,delta,before,after,sourceType,0,reason,uid,now);
  }
}

if(Number(one('SELECT COUNT(*) n FROM notifications').n)===0){
  run('INSERT INTO notifications(user_id,type,title,message,action,created_at) VALUES(?,?,?,?,?,?)',uid,'warning','Steel Rods need replenishment','Steel Rods are below the critical reorder point. Open the reorder radar to review coverage.','intelligence',now);
  run('INSERT INTO notifications(user_id,type,title,message,action,created_at) VALUES(?,?,?,?,?,?)',uid,'warning','Receipt discrepancy detected','RCV-1042 expected 50 kg; 40 kg received. 10 kg remain pending.','receipts',now);
  run('INSERT INTO notifications(user_id,type,title,message,action,created_at) VALUES(?,?,?,?,?,?)',uid,'info','Camera scanner ready','Scan QR and barcodes from the command header or any operation screen.','products',now);
}

console.log('StockSense demo data ready. Login: demo@stocksense.app / Demo@12345');
