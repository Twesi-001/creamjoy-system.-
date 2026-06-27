from flask import request, jsonify
from app.routes import api_bp
from app.models import Order, Product
from app.routes.auth import token_required
from app.database import execute_insert

@api_bp.route('/orders', methods=['GET'])
@token_required
def get_orders():
    orders = Order.get_all()
    return jsonify(orders), 200

@api_bp.route('/orders/<int:order_id>', methods=['GET'])
@token_required
def get_order(order_id):
    order = Order.get_by_id(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    # Get order lines
    from app.database import execute_query
    lines = execute_query("""
        SELECT ol.*, f.flavour_name, s.size_name
        FROM order_lines ol
        JOIN products p ON ol.product_id = p.product_id
        JOIN flavours f ON p.flavour_id = f.flavour_id
        JOIN pack_sizes s ON p.size_id = s.size_id
        WHERE ol.order_id = %s
    """, (order_id,))
    
    order['order_lines'] = lines
    return jsonify(order), 200

@api_bp.route('/orders', methods=['POST'])
@token_required
def create_order():
    data = request.get_json()
    
    customer_id = data.get('customer_id')
    order_date = data.get('order_date')
    delivery_date = data.get('delivery_date')
    payment_method = data.get('payment_method', 'cash')
    order_lines = data.get('order_lines', [])
    
    if not customer_id or not order_date or not order_lines:
        return jsonify({'error': 'Customer, date, and order lines required'}), 400
    
    # Calculate total
    total_amount = 0
    for line in order_lines:
        product = Product.get_by_id(line.get('product_id'))
        if product:
            price = product.get('unit_price') or 0
            total_amount += price * line.get('quantity', 0)
    
    # Create order
    order_id = Order.create(customer_id, order_date, delivery_date, payment_method, total_amount)
    
    # Add order lines
    for line in order_lines:
        product = Product.get_by_id(line.get('product_id'))
        price = product.get('unit_price') or 0
        execute_insert("""
            INSERT INTO order_lines (order_id, product_id, quantity, unit_price_at_time)
            VALUES (%s, %s, %s, %s)
        """, (order_id, line.get('product_id'), line.get('quantity'), price))
    
    return jsonify({
        'message': 'Order created successfully',
        'order_id': order_id,
        'total_amount': total_amount
    }), 201

@api_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@token_required
def update_order_status(order_id):
    data = request.get_json()
    status = data.get('status')
    
    if not status:
        return jsonify({'error': 'Status required'}), 400
    
    Order.update_status(order_id, status)
    return jsonify({'message': 'Order status updated'}), 200