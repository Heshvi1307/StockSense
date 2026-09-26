import jwt from 'jsonwebtoken'; import bcrypt from 'bcryptjs'; import {Request,Response,NextFunction} from 'express';
const secret=process.env.JWT_SECRET||'dev-secret-change-me';
export const hash=(s:string)=>bcrypt.hashSync(s,10); export const verify=(s:string,h:string)=>bcrypt.compareSync(s,h);
export const sign=(id:number)=>jwt.sign({id},secret,{expiresIn:'8h'});
export function requireAuth(req:Request,res:Response,next:NextFunction){const t=req.cookies?.token; if(!t)return res.status(401).json({error:'Authentication required'}); try{(req as any).user=jwt.verify(t,secret); next()}catch{return res.status(401).json({error:'Session expired'})}}
