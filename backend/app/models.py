from app.database import execute_query, execute_insert, execute_update

class Batch:
    @staticmethod
    def get_all():
        return execute_query("""
            SELECT b.*, s.name as supervisor_name,
                   (SELECT SUM(bp.quantity_produced) 
                    FROM batch_products bp 
                    WHERE bp.batch_id = b.batch_id) as total_units
            FROM batches b
            LEFT JOIN staff s ON b.supervisor_id = s.staff_id
            ORDER BY b.batch_date DESC
        """)
    
    @staticmethod
    def get_by_id(batch_id):
        result = execute_query("""
            SELECT b.*, s.name as supervisor_name
            FROM batches b
            LEFT JOIN staff s ON b.supervisor_id = s.staff_id
            WHERE b.batch_id = %s
        """, (batch_id,))
        return result[0] if result else None
    
    @staticmethod
    def create(batch_number, batch_date, supervisor_id, notes=None):
        return execute_insert("""
            INSERT INTO batches (batch_number, batch_date, supervisor_id, notes)
            VALUES (%s, %s, %s, %s)
        """, (batch_number, batch_date, supervisor_id, notes))
    
    @staticmethod
    def update_status(batch_id, status):
        return execute_update("""
            UPDATE batches SET status = %s WHERE batch_id = %s
        """, (status, batch_id))

class Product:
    @staticmethod
    def get_all():
        return execute_query("""
            SELECT p.*, f.flavour_name, s.size_name
            FROM products p
            JOIN flavours f ON p.flavour_id = f.flavour_id
            JOIN pack_sizes s ON p.size_id = s.size_id
            ORDER BY f.flavour_name, FIELD(s.size_name, '5L', '2L', '1L', '300ml')
        """)
    
    @staticmethod
    def get_by_id(product_id):
        result = execute_query("""
            SELECT p.*, f.flavour_name, s.size_name
            FROM products p
            JOIN flavours f ON p.flavour_id = f.flavour_id
            JOIN pack_sizes s ON p.size_id = s.size_id
            WHERE p.product_id = %s
        """, (product_id,))
        return result[0] if result else None

class Staff:
    @staticmethod
    def get_all():
        return execute_query("SELECT * FROM staff ORDER BY name")
    
    @staticmethod
    def get_by_id(staff_id):
        result = execute_query("SELECT * FROM staff WHERE staff_id = %s", (staff_id,))
        return result[0] if result else None
    
    @staticmethod
    def get_by_email(email):
        result = execute_query("SELECT * FROM staff WHERE email = %s", (email,))
        return result[0] if result else None

class Order:
    @staticmethod
    def get_all():
        return execute_query("""
            SELECT o.*, c.name as customer_name
            FROM orders o
            JOIN customers c ON o.customer_id = c.customer_id
            ORDER BY o.order_date DESC
        """)
    
    @staticmethod
    def get_by_id(order_id):
        result = execute_query("""
            SELECT o.*, c.name as customer_name
            FROM orders o
            JOIN customers c ON o.customer_id = c.customer_id
            WHERE o.order_id = %s
        """, (order_id,))
        return result[0] if result else None
    
    @staticmethod
    def create(customer_id, order_date, delivery_date, payment_method, total_amount):
        return execute_insert("""
            INSERT INTO orders (customer_id, order_date, delivery_date, payment_method, payment_status, total_amount)
            VALUES (%s, %s, %s, %s, 'pending', %s)
        """, (customer_id, order_date, delivery_date, payment_method, total_amount))
    
    @staticmethod
    def update_status(order_id, status):
        return execute_update("""
            UPDATE orders SET payment_status = %s WHERE order_id = %s
        """, (status, order_id))

class Customer:
    @staticmethod
    def get_all():
        return execute_query("SELECT * FROM customers ORDER BY name")
    
    @staticmethod
    def get_by_id(customer_id):
        result = execute_query("SELECT * FROM customers WHERE customer_id = %s", (customer_id,))
        return result[0] if result else None

class Delivery:
    @staticmethod
    def get_all():
        return execute_query("""
            SELECT d.*, s.name as staff_name, c.name as customer_name
            FROM deliveries d
            JOIN staff s ON d.staff_id = s.staff_id
            JOIN orders o ON d.order_id = o.order_id
            JOIN customers c ON o.customer_id = c.customer_id
            ORDER BY d.delivery_date DESC
        """)
    
    @staticmethod
    def update_status(delivery_id, status):
        return execute_update("""
            UPDATE deliveries SET status = %s WHERE delivery_id = %s
        """, (status, delivery_id))

class Inventory:
    @staticmethod
    def get_all():
        return execute_query("""
            SELECT *, 
                   (current_stock < minimum_stock) as low_stock
            FROM raw_materials
            ORDER BY material_name
        """)
    
    @staticmethod
    def update_stock(material_id, quantity):
        return execute_update("""
            UPDATE raw_materials 
            SET current_stock = current_stock - %s 
            WHERE material_id = %s AND current_stock >= %s
        """, (quantity, material_id, quantity))
    
    @staticmethod
    def add_stock(material_id, quantity):
        return execute_update("""
            UPDATE raw_materials 
            SET current_stock = current_stock + %s 
            WHERE material_id = %s
        """, (quantity, material_id))