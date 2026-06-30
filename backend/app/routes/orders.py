from flask import request, jsonify
from app.routes import api_bp
from app.routes.auth import token_required
from app.database import execute_query, execute_insert, execute_update
import traceback

@api_bp.route('/orders', methods=['GET'])
@token_required
def get_orders():
    try:
        orders = execute_query("""
            SELECT 
                o.order_id,
                o.customer_id,
                o.order_date,
                o.delivery_date,
                o.payment_method,
                o.payment_status,
                o.total_amount_ugx as total_amount,
                o.notes,
                o.created_at,
                c.customer_name as customer_name
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.customer_id
            ORDER BY o.order_date DESC
        """)
        return jsonify(orders), 200
    except Exception as e:
        print(f"🔥 Error in GET /orders: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@api_bp.route('/orders/<int:order_id>', methods=['GET'])
@token_required
def get_order(order_id):
    try:
        order = execute_query("""
            SELECT 
                o.order_id,
                o.customer_id,
                o.order_date,
                o.delivery_date,
                o.payment_method,
                o.payment_status,
                o.total_amount_ugx as total_amount,
                o.notes,
                o.created_at,
                c.customer_name as customer_name
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.customer_id
            WHERE o.order_id = %s
        """, (order_id,))
        
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        # Get order lines
        lines = execute_query("""
            SELECT 
                ol.order_line_id,
                ol.product_id,
                ol.quantity,
                ol.unit_price_ugx as unit_price_at_time,
                ol.line_total_ugx as line_total,
                p.flavour,
                p.size
            FROM order_lines ol
            JOIN products p ON ol.product_id = p.product_id
            WHERE ol.order_id = %s
        """, (order_id,))
        
        result = order[0]
        result['order_lines'] = lines
        return jsonify(result), 200
    except Exception as e:
        print(f"🔥 Error in GET /orders/{order_id}: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@api_bp.route('/orders', methods=['POST'])
@token_required
def create_order():
    try:
        data = request.get_json()
        print(f"📦 Received order data: {data}")
        
        # Validate required fields
        customer_id = data.get('customer_id')
        order_date = data.get('order_date')
        delivery_date = data.get('delivery_date')
        payment_method = data.get('payment_method', 'cash')
        order_lines = data.get('order_lines', [])
        
        if not customer_id:
            return jsonify({'error': 'Customer ID is required'}), 400
        
        if not order_date:
            return jsonify({'error': 'Order date is required'}), 400
        
        if not order_lines or len(order_lines) == 0:
            return jsonify({'error': 'At least one product is required'}), 400
        
        # Validate customer exists
        customer = execute_query("SELECT customer_id FROM customers WHERE customer_id = %s", (customer_id,))
        if not customer:
            return jsonify({'error': f'Customer with ID {customer_id} not found'}), 404
        
        # Validate products and calculate total
        total_amount = 0
        for line in order_lines:
            product_id = line.get('product_id')
            quantity = line.get('quantity', 0)
            
            product = execute_query("SELECT product_id, unit_price_ugx FROM products WHERE product_id = %s", (product_id,))
            if not product:
                return jsonify({'error': f'Product with ID {product_id} not found'}), 404
            
            price = product[0].get('unit_price_ugx') or 0
            total_amount += price * quantity
        
        # Validate payment method
        valid_payment_methods = ['cash', 'mobile_money', 'credit']
        if payment_method not in valid_payment_methods:
            return jsonify({'error': f'Invalid payment method. Must be one of: {valid_payment_methods}'}), 400
        
        # Create order
        print(f"📝 Creating order...")
        order_id = execute_insert("""
            INSERT INTO orders 
            (customer_id, order_date, delivery_date, payment_method, payment_status, total_amount_ugx)
            VALUES (%s, %s, %s, %s, 'pending', %s)
        """, (customer_id, order_date, delivery_date, payment_method, total_amount))
        
        print(f"✅ Order created with ID: {order_id}")
        
        # Create order lines
        for line in order_lines:
            product_id = line.get('product_id')
            quantity = line.get('quantity', 0)
            
            product = execute_query("SELECT unit_price_ugx FROM products WHERE product_id = %s", (product_id,))
            price = product[0].get('unit_price_ugx') or 0 if product else 0
            line_total = price * quantity
            
            execute_insert("""
                INSERT INTO order_lines (order_id, product_id, quantity, unit_price_ugx, line_total_ugx)
                VALUES (%s, %s, %s, %s, %s)
            """, (order_id, product_id, quantity, price, line_total))
        
        return jsonify({
            'message': 'Order created successfully',
            'order_id': order_id,
            'total_amount': total_amount
        }), 201
        
    except Exception as e:
        print(f"🔥 ERROR creating order: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@api_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@token_required
def update_order_status(order_id):
    try:
        data = request.get_json()
        status = data.get('status')
        
        if not status:
            return jsonify({'error': 'Status is required'}), 400
        
        valid_statuses = ['pending', 'paid', 'partial']
        if status not in valid_statuses:
            return jsonify({'error': f'Invalid status. Must be one of: {valid_statuses}'}), 400
        
        order = execute_query("SELECT order_id FROM orders WHERE order_id = %s", (order_id,))
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        execute_update("""
            UPDATE orders SET payment_status = %s WHERE order_id = %s
        """, (status, order_id))
        
        return jsonify({'message': 'Order status updated successfully'}), 200
    except Exception as e:
        print(f"🔥 Error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500
