-- =====================================================
-- CreamJoy Database - Practical 1.3 Queries
-- All queries use real data from the notebook
-- =====================================================

-- ---------------------------------------------------------------------
-- Query 18: List all products alphabetically by flavour, then by size descending
-- Business need: Display all yoghurt products in a structured way for order forms
-- ---------------------------------------------------------------------
SELECT 
    flavour, 
    size 
FROM products 
ORDER BY 
    flavour ASC,
    FIELD(size, '5L', '2L', '1L', '300ml');

-- ---------------------------------------------------------------------
-- Query 19: Show all production batches with date, batch number, status, most recent first
-- Business need: See latest production activity at a glance
-- ---------------------------------------------------------------------
SELECT 
    batch_number,
    batch_date,
    status
FROM batches
ORDER BY batch_date DESC;

-- ---------------------------------------------------------------------
-- Query 20: Find all staff members whose role is delivery
-- Business need: Know which staff are available for delivery assignments
-- ---------------------------------------------------------------------
SELECT 
    name,
    role
FROM staff
WHERE role = 'delivery';

-- ---------------------------------------------------------------------
-- Query 21: Low-stock warning report - materials below minimum stock level
-- Business need: Alert production manager before ingredients run out
-- ---------------------------------------------------------------------
SELECT 
    material_name,
    current_stock,
    minimum_stock,
    (minimum_stock - current_stock) AS units_to_reorder
FROM raw_materials
WHERE current_stock < minimum_stock
ORDER BY (minimum_stock - current_stock) DESC;

-- ---------------------------------------------------------------------
-- Query 22: Total units produced per batch (all flavours and sizes combined)
-- Business need: Compare batch productivity and identify high/low output batches
-- ---------------------------------------------------------------------
SELECT 
    b.batch_number,
    b.batch_date,
    SUM(bp.quantity_produced) AS total_units_produced
FROM batches b
JOIN batch_products bp ON b.batch_id = bp.batch_id
GROUP BY b.batch_id, b.batch_number, b.batch_date
ORDER BY b.batch_date DESC;

-- ---------------------------------------------------------------------
-- Query 23: List all orders with customer name, date, payment status (newest first)
-- Business need: Track recent sales and outstanding payments
-- ---------------------------------------------------------------------
SELECT 
    c.customer_name,
    o.order_date,
    o.payment_status
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
ORDER BY o.order_date DESC;

-- ---------------------------------------------------------------------
-- Query 24: For each order line, show product flavour, size, quantity, line total
-- Business need: Detailed breakdown of what was sold in each order
-- ---------------------------------------------------------------------
SELECT 
    p.flavour,
    p.size,
    ol.quantity,
    ol.line_total_ugx
FROM order_lines ol
JOIN products p ON ol.product_id = p.product_id
ORDER BY ol.order_line_id;

-- ---------------------------------------------------------------------
-- Query 25: List every delivery with staff name, delivery date, customer name, status
-- Business need: Full delivery audit trail for managers and clients
-- ---------------------------------------------------------------------
SELECT 
    s.name AS staff_name,
    d.delivery_date,
    c.customer_name,
    d.status
FROM deliveries d
JOIN staff s ON d.staff_id = s.staff_id
JOIN orders o ON d.order_id = o.order_id
JOIN customers c ON o.customer_id = c.customer_id
ORDER BY d.delivery_date DESC;

-- ---------------------------------------------------------------------
-- Query 26: Total revenue collected per customer (only fully paid orders)
-- Business need: Identify top-paying customers and total cash collected
-- ---------------------------------------------------------------------
SELECT 
    c.customer_name,
    SUM(o.total_amount_ugx) AS total_revenue_ugx
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
WHERE o.payment_status = 'paid'
GROUP BY c.customer_id, c.customer_name
ORDER BY total_revenue_ugx DESC;

-- ---------------------------------------------------------------------
-- Query 27: Delivery count per staff member (most deliveries first)
-- Business need: See which delivery staff are most active and balance workload
-- ---------------------------------------------------------------------
SELECT 
    s.name AS staff_name,
    COUNT(d.delivery_id) AS delivery_count
FROM staff s
LEFT JOIN deliveries d ON s.staff_id = d.staff_id
WHERE s.role = 'delivery'
GROUP BY s.staff_id, s.name
ORDER BY delivery_count DESC;

-- ---------------------------------------------------------------------
-- Query 28: Total quantity produced for each flavour in 300ml size only
-- Business need: Determine which 300ml flavours are most produced (most popular size)
-- ---------------------------------------------------------------------
SELECT 
    p.flavour,
    SUM(bp.quantity_produced) AS total_300ml_units
FROM batch_products bp
JOIN products p ON bp.product_id = p.product_id
WHERE p.size = '300ml'
GROUP BY p.flavour
ORDER BY total_300ml_units DESC;

-- ---------------------------------------------------------------------
-- Query 29: Customers with more than one order, including at least one credit order
-- Business need: Identify frequent credit customers who may need payment reminders
-- ---------------------------------------------------------------------
SELECT 
    c.customer_name,
    COUNT(o.order_id) AS total_orders,
    SUM(CASE WHEN o.payment_method = 'credit' THEN 1 ELSE 0 END) AS credit_orders
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.customer_name
HAVING COUNT(o.order_id) > 1 
   AND SUM(CASE WHEN o.payment_method = 'credit' THEN 1 ELSE 0 END) >= 1
ORDER BY credit_orders DESC;

-- ---------------------------------------------------------------------
-- Query 30: Batches where total units produced is below the overall average
-- Business need: Flag underperforming batches for investigation
-- ---------------------------------------------------------------------
SELECT 
    b.batch_number,
    b.batch_date,
    SUM(bp.quantity_produced) AS total_units
FROM batches b
JOIN batch_products bp ON b.batch_id = bp.batch_id
GROUP BY b.batch_id, b.batch_number, b.batch_date
HAVING total_units < (
    SELECT AVG(batch_total)
    FROM (
        SELECT SUM(quantity_produced) AS batch_total
        FROM batch_products
        GROUP BY batch_id
    ) AS avg_table
)
ORDER BY total_units ASC;

-- ---------------------------------------------------------------------
-- Query 31: Five most frequently sent out products by total quantity (from deliveries)
-- Business need: Know best-selling products to optimise production planning
-- ---------------------------------------------------------------------
SELECT 
    p.flavour,
    p.size,
    SUM(ol.quantity) AS total_quantity_delivered
FROM order_lines ol
JOIN products p ON ol.product_id = p.product_id
GROUP BY p.product_id, p.flavour, p.size
ORDER BY total_quantity_delivered DESC
LIMIT 5;

-- ---------------------------------------------------------------------
-- Query 32: Total amount spent per expenditure category (highest to lowest)
-- Business need: Understand where production money goes for cost control
-- ---------------------------------------------------------------------
SELECT 
    category,
    SUM(amount_ugx) AS total_spent_ugx
FROM expenditures
GROUP BY category
ORDER BY total_spent_ugx DESC;