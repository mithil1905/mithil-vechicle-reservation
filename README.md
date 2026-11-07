# 🚗 Mithil Vehicle Reservation System
**A Dark-Themed Full-Stack Vehicle Service & Reservation Management System tailored for Indian Roads**

---

## 🇮🇳 Project Overview
The **Mithil Vehicle Reservation System** is an end-to-end full-stack web application built to streamline automotive workshops, servicing bays, and customer bookings in India. It supports full **CRUD operations (Create, Read, Update, Delete)** across customers, vehicles, services, and payments.

### 🌟 Key Highlights
- **Indian Automotive Ecosystem**: Built-in support for Indian vehicle brands (Tata Motors, Mahindra, Maruti Suzuki, Royal Enfield, Bajaj, TVS), Indian state registration plates (e.g., `KA-01-MJ-2024`, `DL-03-CC-8899`), Indian cities (Bengaluru, Chennai, Ahmedabad, Delhi, Mumbai), and Indian festive service packages (Monsoon Safety Check, Ayudha Pooja Deep Clean, EV Battery Balancing).
- **Payment & Invoicing in ₹ INR**: Record payments via UPI (Google Pay, PhonePe, Paytm, BHIM), Cash, Cards, and print official Indian GST service receipts.
- **Dark Luxe Aesthetic**: Dark obsidian UI (`#0a0e17`) with Indian Saffron (`#ff9933`), Gold, and Emerald accents, smooth modals, and responsive layout.
- **Embedded Automotive Imagery**: High-definition automotive workshop imagery embedded in every single HTML page with fallback mechanisms.

---

## 🗄️ Database Architecture (MySQL)
- **Database Name**: `mithil_vehicle_db`
- **Username**: `root`
- **Password**: `mithil`
- **Port**: `3306`

### 4 Core Tables:
1. `customers`: Customer ID, Name, Phone (+91 format), Email, City, State, Address, Created Date.
2. `vehicles`: Vehicle ID, Customer ID (FK), Indian Registration Plate Number, Vehicle Category (2-Wheeler, 4-Wheeler, EV, Auto), Brand, Model, Fuel Type (Petrol, Diesel, CNG, Electric), Year.
3. `services`: Service ID, Vehicle ID (FK), Service Package Type, Service Date, Status (Scheduled, In Progress, Ready for Delivery, Completed, Cancelled), Estimated Cost (₹), Descriptions, Mechanic Notes.
4. `payments`: Payment ID, Service ID (FK), Amount (₹), Payment Mode (UPI, Cash, Card, Net Banking), Payment Status (Paid, Pending, Failed), Transaction Reference, Payment Date.

---

## 📂 Project Structure
```text
D:\mithil vechicle reservation\
├── .env                  # Configuration (Port 3000, MySQL credentials root:mithil)
├── database.sql          # Complete MySQL schema & Indian seed records
├── db.js                 # MySQL2 connection pool & auto-reconnect
├── server.js             # Express.js REST API backend running on port 3000
├── package.json          # Node.js project manifest & scripts
├── README.md             # Complete documentation and run instructions
└── public\
    ├── index.html        # Dashboard & Fleet Overview (Hero Image included)
    ├── customers.html    # Customers CRUD page (Customer Lounge Image included)
    ├── vehicles.html     # Vehicles CRUD page (Vehicle Fleet Image included)
    ├── services.html     # Services CRUD page (Technician Bay Image included)
    ├── payments.html     # Payments & Invoice Receipt page (UPI POS Image included)
    ├── css\
    │   └── style.css     # Premium dark theme stylesheet
    └── js\
        ├── main.js       # Shared utilities (Toast alerts, modals, INR currency formatter)
        ├── dashboard.js  # Dashboard stats & recent job cards
        ├── customers.js  # Customer CRUD operations
        ├── vehicles.js   # Vehicle CRUD operations
        ├── services.js   # Service reservation CRUD operations
        └── payments.js   # Payment processing & invoice receipt generator
```

---

## 🚀 How to Run the Project

### Step 1: Ensure MySQL is Running
Make sure your local MySQL server is started. (Credentials: user `root`, password `mithil`).

### Step 2: (Optional) If you ever want to re-import the database
Open PowerShell in this folder and run:
```powershell
Get-Content database.sql | mysql -u root -pmithil
```
*(Note: The database and sample records are already set up and tested!)*

### Step 3: Start the Node.js Server
In your terminal, navigate to the project directory:
```powershell
cd "d:\mithil vechicle reservation"
npm start
```
*(Or `node server.js`)*

You will see:
```text
=====================================================================
🚀 MITHIL VEHICLE RESERVATION SYSTEM is RUNNING
🌐 Website URL: http://localhost:3000
🗄️  Database: MySQL (mithil_vehicle_db) on root@localhost:3306
=====================================================================
✅ Connected successfully to MySQL Database: "mithil_vehicle_db" (User: root)
```

### Step 4: Open in Your Browser
Open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🛠️ Testing the CRUD Operations
1. **Customers (`/customers.html`)**:
   - **Create**: Click *"Register New Customer"*, enter name, 10-digit mobile, city (e.g., Bengaluru), and save.
   - **Read**: Live search by name, phone, or city.
   - **Update**: Click the pencil icon on any customer row to edit their details.
   - **Delete**: Click the red trash icon with cascading protection.

2. **Vehicles (`/vehicles.html`)**:
   - **Create**: Click *"Register Vehicle"*, select an owner, input number plate (e.g., `KA-01-AB-1234`), brand (Tata, Mahindra, Royal Enfield), model, fuel (Petrol/Diesel/CNG/Electric).
   - **Read**: Filter and view plate badges with EV green styling.
   - **Update / Delete**: Full edit and remove controls.

3. **Services (`/services.html`)**:
   - **Create**: Click *"Book Service Reservation"*, choose Indian packages (Monsoon Checkup, Ayudha Pooja Servicing, Diwali Deep Clean), date, cost in ₹.
   - **Read**: Filter by status (*Scheduled*, *In Progress*, *Ready*, *Completed*).
   - **Update / Delete**: Live status updates for job cards.

4. **Payments (`/payments.html`)**:
   - **Create**: Click *"Record Payment"*, select job card, enter ₹ amount, select UPI / Cash / Card, and record transaction.
   - **Print Invoice**: Click the printer icon to generate a printable Indian GST tax invoice with garage header and vehicle number.

