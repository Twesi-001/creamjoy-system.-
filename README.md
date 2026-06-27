1. PROJECT OVERVIEW
1.1 Background
CreamJoy Yoghurt is a food manufacturing startup operating from Nakawa Industrial Area, Kampala, Uganda. The business produces fresh yoghurt in eight flavours, packaged in four sizes. Previously, all operations were managed using handwritten notebooks.

1.2 Problem Statement
No centralized data management

Manual tracking of production batches

Handwritten customer records

No real-time inventory tracking

Credit accounts managed on paper

No revenue tracking or reporting

1.3 Solution
A full-stack web application that digitizes all operations:

Production batch management

Customer order processing

Delivery tracking

Inventory management

Credit account management

User authentication with role-based access

2. SYSTEM ARCHITECTURE
2.1 Technology Stack
Backend
Component	Technology	Version
Framework	Flask (Python)	2.3.2
Database	MySQL	8.0+
Authentication	JWT (PyJWT)	2.8.0
Password Hashing	Werkzeug	2.3.6
CORS	Flask-CORS	4.0.0
Deployment	Render	-
Frontend
Component	Technology	Version
Framework	React	18.2.0
Language	TypeScript	5.3.0
Build Tool	Vite	5.0.0
Routing	React Router	6.20.0
Charts	Chart.js	4.4.0
HTTP Client	Axios	1.6.0
Styling	CSS Modules	-
Deployment	Vercel	-
Database (Aiven MySQL)
Host: mysql-190b90da-creamjoy52-76ff.h.aivencloud.com


 DATABASE DESIGN
3.1 Entity Relationship Diagram
The database consists of 15+ normalized tables with proper relationships.

3.2 Core Tables
Table	Description	Key Fields
staff	User accounts and roles	staff_id (PK), name, email, role, password_hash
customers	Customer information	customer_id (PK), name, location, phone, type
flavours	Yoghurt flavours	flavour_id (PK), flavour_name (ENUM)
pack_sizes	Package sizes	size_id (PK), size_name (ENUM)
products	Product variants	product_id (PK), flavour_id (FK), size_id (FK)
batches	Production batches	batch_id (PK), batch_number, date, status
batch_products	Junction: batches ↔ products	batch_id (FK), product_id (FK), quantity
orders	Customer orders	order_id (PK), customer_id (FK), payment_status
order_lines	Junction: orders ↔ products	order_id (FK), product_id (FK), quantity
deliveries	Delivery records	delivery_id (PK), order_id (FK), staff_id (FK), status
delivery_audit	Audit trail	audit_id (PK), delivery_id (FK), old_status, new_status
raw_materials	Inventory items	material_id (PK), name, unit, current_stock, min_stock
suppliers	Material suppliers	supplier_id (PK), name, contact, location
batch_materials	Junction: batches ↔ materials	batch_id (FK), material_id (FK), quantity_used
credit_accounts	Amabanja records	credit_id (PK), customer_id (FK), amount, status
expenditures	Business expenses	expenditure_id (PK), category, amount


Authentication Endpoints
Method	Endpoint	Description	Request Body
POST	/auth/login	User login	{"email": "admin@creamjoy.com", "password": "admin123"}
POST	/auth/register	User registration	{"name": "John", "email": "...", "password": "...", "role": "delivery"}
GET	/auth/me	Get current user	Requires token
Business Endpoints
Method	Endpoint	Description	Access
GET	/batches	Get all batches	All users
GET	/batches/:id	Get single batch	All users
POST	/batches	Create batch	Supervisor, Production
PUT	/batches/:id/status	Update batch status	Supervisor, Production
GET	/products	Get all products	All users
GET	/orders	Get all orders	All users
POST	/orders	Create order	All users
PUT	/orders/:id/status	Update order status	Supervisor, Delivery
GET	/deliveries	Get all deliveries	All users
PUT	/deliveries/:id/status	Update delivery status	Supervisor, Delivery
GET	/customers	Get all customers	All users
GET	/raw-materials	Get raw materials	All users
PUT	/raw-materials/:id/stock	Update stock	Supervisor, Production
GET	/suppliers	Get suppliers	All users
GET	/credit-accounts	Get credit accounts	Supervisor, Sales
4.4 Admin Endpoints
Method	Endpoint	Description
GET	/admin/users	Get all users
POST	/admin/users	Create user
PUT	/admin/users/:id	Update user
DELETE	/admin/users/:id	Delete user
GET	/admin/stats	System statistics

Routes
Path	Component	Description
/login	Login	Login page
/	Dashboard	Main dashboard
/batches	BatchList	View all batches
/batches/new	BatchForm	Create new batch
/products	ProductList	View all products
/orders	OrderList	View all orders
/orders/new	OrderForm	Create new order
/deliveries	DeliveryList	View all deliveries
/inventory	InventoryList	View inventory
/customers	CustomerList	View customers
/credit	CreditList	View credit accounts
/admin	AdminDashboard	Admin dashboard
5.3 Role-Based Access
Role	Visible Menu Items
Admin	Dashboard, Batches, Products, Orders, Deliveries, Inventory, Customers, Credit, Admin
Supervisor	Dashboard, Batches, Products, Orders, Deliveries, Inventory, Customers, Credit
Production	Dashboard, Batches, Products, Inventory
Delivery	Dashboard, Orders, Deliveries
Sales	Dashboard, Orders, Customers, Credit
6. DEPLOYMENT
6.1 Database (Aiven)
Service Details:

Host: mysql-190b90da-creamjoy52-76ff.h.aivencloud.com

Port: 22517

Database: defaultdb

User: avnadmin

SSL Mode: REQUIRED

6.2 Backend (Render)
Configuration:

text
Build Command: pip install -r requirements.txt
Start Command: gunicorn run:app
Environment Variables:

text
MYSQL_HOST=mysql-190b90da-creamjoy52-76ff.h.aivencloud.com
MYSQL_USER=avnadmin
MYSQL_PASSWORD=
MYSQL_DB=defaultdb
MYSQL_PORT=22517
JWT_SECRET_KEY={generated}
6.3 Frontend (Vercel)
Configuration:

text
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Environment Variables:

text
VITE_API_URL=https://creamjoy-system.onrender.com/api
7. USER GUIDE
7.1 Login
Navigate to https://creamjoy-frontend.vercel.app

Enter email and password

Click "Login"

You'll be redirected to the dashboard

7.2 Dashboard
View key metrics: Today's Batches, Pending Deliveries, Low Stock Alerts, Credit Outstanding

View production activity chart

View recent batches

7.3 Managing Batches
Go to Batches

Click + New Batch

Fill in:

Batch Number

Batch Date

Supervisor

Products (flavour + size + quantity)

Click Create Batch

7.4 Managing Orders
Go to Orders

Click + New Order

Fill in:

Customer

Order Date

Delivery Date

Payment Method

Products (flavour + size + quantity)

Click Create Order

7.5 Managing Inventory
Go to Inventory

View all raw materials with current stock levels

Low stock items are highlighted in red

Click + or - buttons to adjust stock

7.6 Managing Customers
Go to Customers

View all customers

Click + Add Customer to add new

Fill in customer details

Click Save

7.7 Managing Credit Accounts
Go to Credit Accounts

View all active credit accounts

Customers with high balances are highlighted

Click + Add Credit to create new credit entry

7.8 Admin Functions (Supervisor/Admin only)
Go to Admin

View system statistics

Manage users:

View all users

Add new user

Edit user role

Delete user

8. TECHNICAL SPECIFICATIONS
8.1 System Requirements
Development Environment:

OS: Windows/Mac/Linux

Python 3.11+

Node.js 18+

MySQL 8.0+

Git

Production Environment:

Render (Backend)

Vercel (Frontend)

Aiven (Database)

8.2 Performance Metrics
Metric	Value
Page Load Time	< 2 seconds
API Response Time	< 500ms
Concurrent Users	50+
Database Connections	10
8.3 Security
JWT authentication with 24-hour expiry

Password hashing using Werkzeug (scrypt)

Role-based access control

CORS configured for frontend only

All passwords hashed, never stored in plain text

Environment variables for sensitive data

9. TROUBLESHOOTING
9.1 Common Issues
Issue	Solution
Login fails	Check email/password, ensure database connection
404 Not Found	Check URL path, ensure backend is running
CORS error	Add frontend URL to CORS origins
Database connection	Check environment variables
Build fails	Check dependencies, clear node_modules
Blank page	Check console errors, ensure routing is correct
9.2 Logging
Backend Logs: Render Dashboard → Logs
Frontend Logs: Browser Console (F12)
Database Logs: Aiven Console

10. CONTACT & SUPPORT
Project: CreamJoy Yoghurt Management System
Organization: Avodah Innovations
Location: Mbarara, Uganda
Repository: https://github.com/Twesi-001/creamjoy-system

11. APPENDIX
11.1 Sample Data
Staff:

staff_id	name	role
13	System Admin	admin
17	Supervisor User	supervisor
14	Production Manager	production
15	Delivery Staff	delivery
16	Sales Staff	sales
Customers: 90+ customers with various types
Products: 28 variants (8 flavours × 4 sizes)
Batches: 195+ production records
Deliveries: 344+ delivery records

11.2 Useful Commands
Backend:

bash
python run.py                    # Start Flask server
pip install -r requirements.txt  # Install dependencies
Frontend:

bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npx vercel --prod    # Deploy to Vercel
Database:

bash
mysqldump -u root -p creamjoy_db > creamjoy_db.sql
mysql -h {host} -u {user} -p {db} < creamjoy_db.sql
📄 Document Information
Property	Value
Document Title	CreamJoy Management System Documentation
Version	1.0.0
Date	June 28, 2026
Author	Twesigye Tonny
Status	Complete
Port: 22517

Database: defaultdb
