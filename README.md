# StockSense

> Smart inventory management for modern warehouse operations.

StockSense is a full-stack inventory management platform designed to help inventory managers and warehouse staff manage products, stock levels, warehouse operations, transfers, adjustments, and inventory history from one connected workspace.

The goal is simple: make inventory easier to understand, easier to operate, and easier to trace.

---

## Features

### Smart Dashboard
- Inventory overview and key metrics
- Stock health indicators
- Operational activity
- Urgent inventory actions
- Dashboard filtering
  - Document type
  - Status
  - Warehouse/location
  - Product category

### Product Management
- Create and manage products
- SKU/code tracking
- Product categories
- Units of measure
- Stock by warehouse
- Reorder rules
- Product search

### Receipts
- Track incoming inventory
- Receipt status management
- Quantity and discrepancy tracking
- Receiving workflows
- Create new receipts

### Deliveries
- Monitor outgoing deliveries
- Delivery status tracking
- Operational visibility
- Delivery records

### Transfers
- Move inventory between warehouse locations
- Track transfer status
- Monitor inventory movement
- Support warehouse-to-warehouse workflows

### Adjustments
- Record stock adjustments
- Before/after quantities
- Adjustment reasons
- Inventory correction history

### Barcode / QR Scanner
- Camera-based SKU scanning
- Barcode/QR detection when supported by the browser
- Camera switching
- Torch support where available
- Manual SKU lookup
- Scanner fallback for unsupported devices

### Inventory Intelligence
- Reorder insights
- Inventory anomalies
- Stock movement analysis
- Dead-stock visibility
- Action-oriented inventory information

### Stock Ledger
- Complete inventory movement history
- Before/after quantities
- User/activity tracking
- Traceability of inventory changes

### Notifications
- Inventory alerts
- Operational notifications
- Notification panel
- Important events surfaced directly in the application

### Role-Based Access
StockSense supports different experiences for:

**Inventory Managers**
- Inventory oversight
- Product management
- Warehouse visibility
- Operational management
- Inventory intelligence

**Warehouse Staff**
- Warehouse operations
- Transfers
- Picking/shelving workflows
- Counting and inventory operations

> Permission details are implemented by StockSense and may evolve as the application moves toward production authentication and authorization.

### Authentication
- Login
- Signup
- Logout
- Protected application session
- Password recovery
- OTP-based recovery flow
- Role-aware access

### Modern UI
- Responsive design
- Desktop, tablet, and mobile layouts
- Collapsible sidebar
- Mobile hamburger navigation
- Dark mode
- Notification dropdown
- Keyboard shortcuts
- Responsive modals and forms

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- CSS

### Backend

- Node.js
- Express
- SQLite
- better-sqlite3

### Browser APIs

- MediaDevices API
- BarcodeDetector API where supported

### Planned / In Progress

- Supabase Authentication
- Supabase PostgreSQL
- Row Level Security (RLS)

---

## Project Structure

```text
StockSense/
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── style.css
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── server.ts
│   │   ├── seed.ts
│   │   └── ...
│   ├── stocksense.db
│   └── package.json
│
├── .gitignore
└── README.md
