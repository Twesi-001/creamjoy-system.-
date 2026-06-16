-- =====================================================
-- CREAMJOY DATABASE SCHEMA (FIXED - NO EMPTY TABLES)
-- =====================================================

DROP DATABASE IF EXISTS creamjoy_db;
CREATE DATABASE creamjoy_db;
USE creamjoy_db;

-- 1. STAFF TABLE
CREATE TABLE staff (
    staff_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    role ENUM('production', 'delivery', 'sales', 'maintenance', 'supervisor') NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    hire_date DATE
);

-- 2. CUSTOMERS TABLE
CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    phone VARCHAR(20),
    customer_type VARCHAR(50),
    notes TEXT
);

-- 3. FLAVOURS LOOKUP TABLE
CREATE TABLE flavours (
    flavour_id INT PRIMARY KEY AUTO_INCREMENT,
    flavour_name ENUM('Millet', 'Chocolate', 'Strawberry', 'Mango', 'Vanilla', 'Plain', 'Blueberry', 'Bushela') UNIQUE NOT NULL
);

-- 4. PACK SIZES LOOKUP TABLE
CREATE TABLE pack_sizes (
    size_id INT PRIMARY KEY AUTO_INCREMENT,
    size_name ENUM('300ml', '1L', '2L', '5L') UNIQUE NOT NULL
);

-- 5. PRODUCTS TABLE
CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    flavour_id INT NOT NULL,
    size_id INT NOT NULL,
    unit_price DECIMAL(10,2),
    UNIQUE KEY unique_flavour_size (flavour_id, size_id),
    FOREIGN KEY (flavour_id) REFERENCES flavours(flavour_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (size_id) REFERENCES pack_sizes(size_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 6. BATCHES TABLE
CREATE TABLE batches (
    batch_id INT PRIMARY KEY AUTO_INCREMENT,
    batch_number VARCHAR(20) NOT NULL,
    batch_date DATE NOT NULL,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    supervisor_id INT,
    notes TEXT,
    FOREIGN KEY (supervisor_id) REFERENCES staff(staff_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 7. BATCH PRODUCTS JUNCTION TABLE
CREATE TABLE batch_products (
    batch_product_id INT PRIMARY KEY AUTO_INCREMENT,
    batch_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity_produced INT NOT NULL CHECK (quantity_produced >= 0),
    FOREIGN KEY (batch_id) REFERENCES batches(batch_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE KEY unique_batch_product (batch_id, product_id)
);

-- 8. RAW MATERIALS TABLE
CREATE TABLE raw_materials (
    material_id INT PRIMARY KEY AUTO_INCREMENT,
    material_name VARCHAR(100) NOT NULL UNIQUE,
    unit VARCHAR(20) NOT NULL,
    cost_per_unit DECIMAL(10,2) NOT NULL,
    current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
    minimum_stock DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- 9. BATCH MATERIALS JUNCTION TABLE
CREATE TABLE batch_materials (
    batch_material_id INT PRIMARY KEY AUTO_INCREMENT,
    batch_id INT NOT NULL,
    material_id INT NOT NULL,
    quantity_used DECIMAL(10,2) NOT NULL CHECK (quantity_used >= 0),
    FOREIGN KEY (batch_id) REFERENCES batches(batch_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (material_id) REFERENCES raw_materials(material_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE KEY unique_batch_material (batch_id, material_id)
);

-- 10. ORDERS TABLE
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    order_date DATE NOT NULL,
    delivery_date DATE,
    payment_method ENUM('cash', 'mobile_money', 'credit') NOT NULL,
    payment_status ENUM('pending', 'paid', 'partial') DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 11. ORDER LINES JUNCTION TABLE
CREATE TABLE order_lines (
    order_line_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price_at_time DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 12. DELIVERIES TABLE
CREATE TABLE deliveries (
    delivery_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL UNIQUE,
    staff_id INT NOT NULL,
    delivery_date DATETIME NOT NULL,
    status ENUM('pending', 'dispatched', 'delivered') DEFAULT 'pending',
    notes TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 13. DELIVERY AUDIT TABLE
CREATE TABLE delivery_audit (
    audit_id INT PRIMARY KEY AUTO_INCREMENT,
    delivery_id INT NOT NULL,
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    changed_by VARCHAR(100),
    FOREIGN KEY (delivery_id) REFERENCES deliveries(delivery_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 14. CREDIT ACCOUNTS TABLE
CREATE TABLE credit_accounts (
    credit_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    amount_ugx DECIMAL(10,2) NOT NULL CHECK (amount_ugx >= 0),
    date_recorded DATE NOT NULL,
    status ENUM('pending', 'paid', 'partial') DEFAULT 'pending',
    notes TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 15. EXPENDITURES TABLE
CREATE TABLE expenditures (
    expenditure_id INT PRIMARY KEY AUTO_INCREMENT,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    amount_ugx DECIMAL(10,2) NOT NULL CHECK (amount_ugx >= 0),
    paid_by INT,
    expenditure_date DATE NOT NULL,
    notes TEXT,
    FOREIGN KEY (paid_by) REFERENCES staff(staff_id) ON DELETE SET NULL ON UPDATE CASCADE
);

SHOW TABLES;
