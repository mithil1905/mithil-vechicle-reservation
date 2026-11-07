// =====================================================================
// MITHIL VEHICLE RESERVATION SYSTEM - BACKEND SERVER
// Port: 3000 | MySQL: root:mithil@localhost:3306/mithil_vehicle_db
// =====================================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files from "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// =====================================================================
// 1. CUSTOMERS CRUD APIs
// =====================================================================

// READ all customers (with search filter)
app.get('/api/customers', async (req, res) => {
    try {
        const { search } = req.query;
        let query = 'SELECT * FROM customers';
        let params = [];

        if (search) {
            query += ' WHERE name LIKE ? OR phone LIKE ? OR city LIKE ? OR email LIKE ?';
            const term = `%${search}%`;
            params = [term, term, term, term];
        }

        query += ' ORDER BY customer_id DESC';
        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// READ single customer by ID
app.get('/api/customers/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM customers WHERE customer_id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// CREATE customer
app.post('/api/customers', async (req, res) => {
    try {
        const { name, phone, email, city, state, address } = req.body;
        if (!name || !phone) {
            return res.status(400).json({ success: false, message: 'Name and Phone are mandatory' });
        }

        const [result] = await db.query(
            'INSERT INTO customers (name, phone, email, city, state, address) VALUES (?, ?, ?, ?, ?, ?)',
            [name.trim(), phone.trim(), email ? email.trim() : null, city || 'Bengaluru', state || 'Karnataka', address || '']
        );

        res.status(201).json({
            success: true,
            message: 'Customer added successfully',
            customerId: result.insertId
        });
    } catch (err) {
        console.error('Error inserting customer:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Customer phone number already exists!' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
});

// UPDATE customer
app.put('/api/customers/:id', async (req, res) => {
    try {
        const { name, phone, email, city, state, address } = req.body;
        const customerId = req.params.id;

        const [result] = await db.query(
            'UPDATE customers SET name=?, phone=?, email=?, city=?, state=?, address=? WHERE customer_id=?',
            [name.trim(), phone.trim(), email ? email.trim() : null, city, state, address, customerId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.json({ success: true, message: 'Customer details updated successfully' });
    } catch (err) {
        console.error('Error updating customer:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE customer
app.delete('/api/customers/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM customers WHERE customer_id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        res.json({ success: true, message: 'Customer deleted successfully' });
    } catch (err) {
        console.error('Error deleting customer:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// =====================================================================
// 2. VEHICLES CRUD APIs
// =====================================================================

// READ all vehicles (joined with customer name)
app.get('/api/vehicles', async (req, res) => {
    try {
        const { search } = req.query;
        let query = `
            SELECT v.*, c.name AS customer_name, c.phone AS customer_phone
            FROM vehicles v
            LEFT JOIN customers c ON v.customer_id = c.customer_id
        `;
        let params = [];

        if (search) {
            query += ` WHERE v.registration_number LIKE ? OR v.brand LIKE ? OR v.model LIKE ? OR c.name LIKE ?`;
            const term = `%${search}%`;
            params = [term, term, term, term];
        }

        query += ' ORDER BY v.vehicle_id DESC';
        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error('Error fetching vehicles:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// READ single vehicle
app.get('/api/vehicles/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT v.*, c.name AS customer_name 
             FROM vehicles v 
             LEFT JOIN customers c ON v.customer_id = c.customer_id 
             WHERE v.vehicle_id = ?`,
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// CREATE vehicle
app.post('/api/vehicles', async (req, res) => {
    try {
        const { customer_id, registration_number, vehicle_type, brand, model, fuel_type, manufacture_year } = req.body;
        if (!customer_id || !registration_number || !brand || !model) {
            return res.status(400).json({ success: false, message: 'Customer, Registration No, Brand, and Model are required' });
        }

        const [result] = await db.query(
            `INSERT INTO vehicles (customer_id, registration_number, vehicle_type, brand, model, fuel_type, manufacture_year)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                customer_id,
                registration_number.trim().toUpperCase(),
                vehicle_type || 'Four Wheeler (Car/SUV)',
                brand.trim(),
                model.trim(),
                fuel_type || 'Petrol',
                manufacture_year || new Date().getFullYear()
            ]
        );

        res.status(201).json({ success: true, message: 'Vehicle registered successfully', vehicleId: result.insertId });
    } catch (err) {
        console.error('Error registering vehicle:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Vehicle registration plate number already registered!' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
});

// UPDATE vehicle
app.put('/api/vehicles/:id', async (req, res) => {
    try {
        const { customer_id, registration_number, vehicle_type, brand, model, fuel_type, manufacture_year } = req.body;
        const vehicleId = req.params.id;

        const [result] = await db.query(
            `UPDATE vehicles 
             SET customer_id=?, registration_number=?, vehicle_type=?, brand=?, model=?, fuel_type=?, manufacture_year=?
             WHERE vehicle_id=?`,
            [
                customer_id,
                registration_number.trim().toUpperCase(),
                vehicle_type,
                brand.trim(),
                model.trim(),
                fuel_type,
                manufacture_year,
                vehicleId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        res.json({ success: true, message: 'Vehicle information updated successfully' });
    } catch (err) {
        console.error('Error updating vehicle:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE vehicle
app.delete('/api/vehicles/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM vehicles WHERE vehicle_id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }
        res.json({ success: true, message: 'Vehicle record deleted successfully' });
    } catch (err) {
        console.error('Error deleting vehicle:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// =====================================================================
// 3. SERVICES CRUD APIs
// =====================================================================

// READ all services (joined with vehicle and customer)
app.get('/api/services', async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = `
            SELECT s.*, 
                   v.registration_number, v.brand, v.model, v.vehicle_type,
                   c.name AS customer_name, c.phone AS customer_phone
            FROM services s
            JOIN vehicles v ON s.vehicle_id = v.vehicle_id
            JOIN customers c ON v.customer_id = c.customer_id
        `;
        let params = [];
        let conditions = [];

        if (status) {
            conditions.push('s.status = ?');
            params.push(status);
        }

        if (search) {
            conditions.push('(s.service_type LIKE ? OR v.registration_number LIKE ? OR c.name LIKE ?)');
            const term = `%${search}%`;
            params.push(term, term, term);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY s.service_date DESC, s.service_id DESC';
        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error('Error fetching services:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// READ single service
app.get('/api/services/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT s.*, 
                    v.registration_number, v.brand, v.model, v.customer_id,
                    c.name AS customer_name, c.phone AS customer_phone
             FROM services s
             JOIN vehicles v ON s.vehicle_id = v.vehicle_id
             JOIN customers c ON v.customer_id = c.customer_id
             WHERE s.service_id = ?`,
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// CREATE service reservation
app.post('/api/services', async (req, res) => {
    try {
        const { vehicle_id, service_type, service_date, status, estimated_cost, description, mechanic_notes } = req.body;
        if (!vehicle_id || !service_type || !service_date) {
            return res.status(400).json({ success: false, message: 'Vehicle, Service Type, and Service Date are required' });
        }

        const [result] = await db.query(
            `INSERT INTO services (vehicle_id, service_type, service_date, status, estimated_cost, description, mechanic_notes)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                vehicle_id,
                service_type.trim(),
                service_date,
                status || 'Scheduled',
                parseFloat(estimated_cost) || 0.0,
                description || '',
                mechanic_notes || ''
            ]
        );

        res.status(201).json({ success: true, message: 'Service reservation created successfully', serviceId: result.insertId });
    } catch (err) {
        console.error('Error booking service:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// UPDATE service
app.put('/api/services/:id', async (req, res) => {
    try {
        const { vehicle_id, service_type, service_date, status, estimated_cost, description, mechanic_notes } = req.body;
        const serviceId = req.params.id;

        const [result] = await db.query(
            `UPDATE services 
             SET vehicle_id=?, service_type=?, service_date=?, status=?, estimated_cost=?, description=?, mechanic_notes=?
             WHERE service_id=?`,
            [
                vehicle_id,
                service_type.trim(),
                service_date,
                status,
                parseFloat(estimated_cost) || 0.0,
                description,
                mechanic_notes,
                serviceId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Service record not found' });
        }

        res.json({ success: true, message: 'Service reservation updated successfully' });
    } catch (err) {
        console.error('Error updating service:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE service
app.delete('/api/services/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM services WHERE service_id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Service record not found' });
        }
        res.json({ success: true, message: 'Service record deleted successfully' });
    } catch (err) {
        console.error('Error deleting service:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// =====================================================================
// 4. PAYMENTS CRUD APIs
// =====================================================================

// READ all payments (with service and customer details)
app.get('/api/payments', async (req, res) => {
    try {
        const { status } = req.query;
        let query = `
            SELECT p.*, 
                   s.service_type, s.service_date,
                   v.registration_number, v.brand, v.model,
                   c.name AS customer_name, c.phone AS customer_phone
            FROM payments p
            JOIN services s ON p.service_id = s.service_id
            JOIN vehicles v ON s.vehicle_id = v.vehicle_id
            JOIN customers c ON v.customer_id = c.customer_id
        `;
        let params = [];

        if (status) {
            query += ' WHERE p.payment_status = ?';
            params.push(status);
        }

        query += ' ORDER BY p.payment_id DESC';
        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error('Error fetching payments:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// READ single payment
app.get('/api/payments/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT p.*, s.service_type, v.registration_number, c.name AS customer_name, c.phone AS customer_phone
             FROM payments p
             JOIN services s ON p.service_id = s.service_id
             JOIN vehicles v ON s.vehicle_id = v.vehicle_id
             JOIN customers c ON v.customer_id = c.customer_id
             WHERE p.payment_id = ?`,
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Payment record not found' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// CREATE payment
app.post('/api/payments', async (req, res) => {
    try {
        const { service_id, amount, payment_mode, payment_status, transaction_ref } = req.body;
        if (!service_id || amount === undefined) {
            return res.status(400).json({ success: false, message: 'Service and Amount are required' });
        }

        const txnRef = transaction_ref && transaction_ref.trim() !== '' 
            ? transaction_ref.trim() 
            : `UPI/${new Date().getFullYear()}/MTHL/${Math.floor(10000000 + Math.random() * 90000000)}`;

        const [result] = await db.query(
            `INSERT INTO payments (service_id, amount, payment_mode, payment_status, transaction_ref)
             VALUES (?, ?, ?, ?, ?)`,
            [
                service_id,
                parseFloat(amount) || 0.0,
                payment_mode || 'UPI (GPay/PhonePe/Paytm)',
                payment_status || 'Paid',
                txnRef
            ]
        );

        res.status(201).json({ success: true, message: 'Payment processed successfully', paymentId: result.insertId });
    } catch (err) {
        console.error('Error processing payment:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// UPDATE payment
app.put('/api/payments/:id', async (req, res) => {
    try {
        const { service_id, amount, payment_mode, payment_status, transaction_ref } = req.body;
        const paymentId = req.params.id;

        const [result] = await db.query(
            `UPDATE payments 
             SET service_id=?, amount=?, payment_mode=?, payment_status=?, transaction_ref=?
             WHERE payment_id=?`,
            [
                service_id,
                parseFloat(amount) || 0.0,
                payment_mode,
                payment_status,
                transaction_ref,
                paymentId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Payment record not found' });
        }

        res.json({ success: true, message: 'Payment record updated successfully' });
    } catch (err) {
        console.error('Error updating payment:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE payment
app.delete('/api/payments/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM payments WHERE payment_id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Payment record not found' });
        }
        res.json({ success: true, message: 'Payment record deleted successfully' });
    } catch (err) {
        console.error('Error deleting payment:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// =====================================================================
// 5. DASHBOARD STATS API
// =====================================================================
app.get('/api/stats', async (req, res) => {
    try {
        const [[customersCount]] = await db.query('SELECT COUNT(*) AS total FROM customers');
        const [[vehiclesCount]] = await db.query('SELECT COUNT(*) AS total FROM vehicles');
        const [[servicesCount]] = await db.query('SELECT COUNT(*) AS total FROM services');
        const [[pendingServicesCount]] = await db.query("SELECT COUNT(*) AS total FROM services WHERE status != 'Completed' AND status != 'Cancelled'");
        const [[revenueSum]] = await db.query("SELECT IFNULL(SUM(amount), 0) AS total FROM payments WHERE payment_status = 'Paid'");
        
        // Recent 5 services
        const [recentServices] = await db.query(`
            SELECT s.*, v.registration_number, v.brand, v.model, c.name AS customer_name
            FROM services s
            JOIN vehicles v ON s.vehicle_id = v.vehicle_id
            JOIN customers c ON v.customer_id = c.customer_id
            ORDER BY s.service_id DESC LIMIT 5
        `);

        res.json({
            success: true,
            data: {
                totalCustomers: customersCount.total,
                totalVehicles: vehiclesCount.total,
                totalServices: servicesCount.total,
                pendingServices: pendingServicesCount.total,
                totalRevenue: parseFloat(revenueSum.total),
                recentServices
            }
        });
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`=====================================================================`);
    console.log(`🚀 MITHIL VEHICLE RESERVATION SYSTEM is RUNNING`);
    console.log(`🌐 Website URL: http://localhost:${PORT}`);
    console.log(`🗄️  Database: MySQL (mithil_vehicle_db) on root@localhost:3306`);
    console.log(`=====================================================================`);
});

