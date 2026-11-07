-- =====================================================================
-- MITHIL VEHICLE RESERVATION & SERVICE MANAGEMENT SYSTEM
-- Database Schema & Indian Culture Seed Data
-- =====================================================================

CREATE DATABASE IF NOT EXISTS mithil_vehicle_db;
USE mithil_vehicle_db;

-- ---------------------------------------------------------------------
-- Table 1: customers
-- Indian Customer database with Name, Mobile, Email, City & State
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(100),
    city VARCHAR(50) DEFAULT 'Bengaluru',
    state VARCHAR(50) DEFAULT 'Karnataka',
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Table 2: vehicles
-- Indian Vehicles (Tata, Mahindra, Maruti, Royal Enfield, Bajaj, etc.)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    registration_number VARCHAR(20) NOT NULL UNIQUE, -- e.g. KA-01-MJ-2024
    vehicle_type ENUM('Two Wheeler (Bike/Scooter)', 'Four Wheeler (Car/SUV)', 'Auto Rickshaw / Commercial', 'Electric Vehicle (EV)') NOT NULL,
    brand VARCHAR(50) NOT NULL,                      -- e.g. Tata, Mahindra, Royal Enfield
    model VARCHAR(50) NOT NULL,                      -- e.g. Nexon EV, Thar, Classic 350
    fuel_type ENUM('Petrol', 'Diesel', 'CNG', 'Electric') NOT NULL DEFAULT 'Petrol',
    manufacture_year INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Table 3: services
-- Service reservations, Indian festive & regular service packages
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    service_date DATE NOT NULL,
    status ENUM('Scheduled', 'In Progress', 'Ready for Delivery', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Scheduled',
    estimated_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    description TEXT,
    mechanic_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Table 4: payments
-- Indian Payment System (UPI - GPay/PhonePe/Paytm, Cash, Cards, NetBanking)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_mode ENUM('UPI (GPay/PhonePe/Paytm)', 'Cash', 'Credit/Debit Card', 'Net Banking') NOT NULL DEFAULT 'UPI (GPay/PhonePe/Paytm)',
    payment_status ENUM('Paid', 'Pending', 'Failed') NOT NULL DEFAULT 'Pending',
    transaction_ref VARCHAR(60),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Seed Realistic Indian Data
-- ---------------------------------------------------------------------

-- Insert Customers
INSERT INTO customers (customer_id, name, phone, email, city, state, address) VALUES
(1, 'Rajesh Varma', '9845012345', 'rajesh.varma@gmail.com', 'Bengaluru', 'Karnataka', '#42, 14th Main, Indiranagar'),
(2, 'Priya Sundaram', '9884023456', 'priya.sundaram@yahoo.co.in', 'Chennai', 'Tamil Nadu', 'Plot 12, Besant Nagar, 2nd Cross'),
(3, 'Amitabh Patel', '9825034567', 'amit.patel@rediffmail.com', 'Ahmedabad', 'Gujarat', 'B-304, Shivalik Heights, SG Highway'),
(4, 'Vikram Singh Rathore', '9414045678', 'vikram.rathore@outlook.com', 'Jaipur', 'Rajasthan', 'Haveli 5, C-Scheme, Ashok Nagar'),
(5, 'Ananya Banerjee', '9830056789', 'ananya.banerjee@gmail.com', 'Kolkata', 'West Bengal', 'Flat 4A, Salt Lake Sector 1')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Vehicles
INSERT INTO vehicles (vehicle_id, customer_id, registration_number, vehicle_type, brand, model, fuel_type, manufacture_year) VALUES
(1, 1, 'KA-01-MJ-2024', 'Electric Vehicle (EV)', 'Tata', 'Nexon EV Empowered', 'Electric', 2023),
(2, 2, 'TN-07-BL-4554', 'Two Wheeler (Bike/Scooter)', 'Royal Enfield', 'Classic 350 Stealth Black', 'Petrol', 2022),
(3, 3, 'GJ-01-TX-9988', 'Four Wheeler (Car/SUV)', 'Maruti Suzuki', 'Swift Dzire ZXi', 'CNG', 2021),
(4, 4, 'RJ-14-EA-7711', 'Four Wheeler (Car/SUV)', 'Mahindra', 'Thar 4x4 Hard Top', 'Diesel', 2022),
(5, 5, 'WB-02-AK-3030', 'Two Wheeler (Bike/Scooter)', 'Bajaj', 'Pulsar NS200 ABS', 'Petrol', 2020)
ON DUPLICATE KEY UPDATE registration_number=VALUES(registration_number);

-- Insert Service Reservations
INSERT INTO services (service_id, vehicle_id, service_type, service_date, status, estimated_cost, description, mechanic_notes) VALUES
(1, 1, 'Monsoon High-Voltage & Battery Health Diagnostics', '2026-11-08', 'In Progress', 3499.00, 'Underbody water-proofing seal inspection, 100-point EV battery cell balancing.', 'Battery efficiency 97.4%, brake pads cleaned.'),
(2, 2, 'Ayudha Pooja & Festive Deep Engine Servicing', '2026-11-09', 'Scheduled', 2250.00, 'Full Motul synthetic engine oil replacement, tappet clearance adjustment, chain lubrication.', 'Customer requested brass polish on custom parts.'),
(3, 3, 'CNG Kit Calibration & 40,000 KM Periodic Maintenance', '2026-11-05', 'Completed', 4150.00, 'CNG cylinder safety test, throttle body throttle wash, air filter change.', 'Tested on highway, CNG pressure optimal.'),
(4, 4, 'Off-Road 4x4 Differential & Suspension Overhaul', '2026-11-07', 'Ready for Delivery', 7800.00, 'Suspension bushing replacement, 4x4 transfer case fluid refresh, brake caliper greasing.', 'All off-road test parameters verified.'),
(5, 5, 'General Periodic Water Wash & Carburetor Tune', '2026-11-06', 'Completed', 1400.00, 'High-pressure foam wash, spark plug clean, electrical wiring check.', 'Delivered on time.')
ON DUPLICATE KEY UPDATE service_type=VALUES(service_type);

-- Insert Payments
INSERT INTO payments (payment_id, service_id, amount, payment_mode, payment_status, transaction_ref) VALUES
(1, 1, 3499.00, 'UPI (GPay/PhonePe/Paytm)', 'Paid', 'UPI/2026/MTHL/98231409'),
(2, 2, 2250.00, 'UPI (GPay/PhonePe/Paytm)', 'Pending', 'UPI/PENDING/771239'),
(3, 3, 4150.00, 'Credit/Debit Card', 'Paid', 'HDFC_POS_TXN_8812940'),
(4, 4, 7800.00, 'UPI (GPay/PhonePe/Paytm)', 'Paid', 'UPI/2026/MTHL/11993421'),
(5, 5, 1400.00, 'Cash', 'Paid', 'CASH_REC_MTHL_0045')
ON DUPLICATE KEY UPDATE amount=VALUES(amount);

