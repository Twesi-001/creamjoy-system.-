from flask import request, jsonify
from app.routes import api_bp
from app.models import Batch, Product
from app.routes.auth import token_required, role_required
from app.database import execute_query, execute_insert

@api_bp.route('/batches', methods=['GET'])
@token_required
def get_batches():
    batches = Batch.get_all()
    return jsonify(batches), 200

@api_bp.route('/batches/<int:batch_id>', methods=['GET'])
@token_required
def get_batch(batch_id):
    batch = Batch.get_by_id(batch_id)
    if not batch:
        return jsonify({'error': 'Batch not found'}), 404
    
    # Get products in this batch
    products = execute_query("""
        SELECT bp.*, f.flavour_name, s.size_name
        FROM batch_products bp
        JOIN products p ON bp.product_id = p.product_id
        JOIN flavours f ON p.flavour_id = f.flavour_id
        JOIN pack_sizes s ON p.size_id = s.size_id
        WHERE bp.batch_id = %s
    """, (batch_id,))
    
    batch['products'] = products
    return jsonify(batch), 200

@api_bp.route('/batches', methods=['POST'])
@token_required
@role_required('production')
def create_batch():
    data = request.get_json()
    
    batch_number = data.get('batch_number')
    batch_date = data.get('batch_date')
    supervisor_id = data.get('supervisor_id')
    products = data.get('products', [])
    notes = data.get('notes')
    
    if not batch_number or not batch_date or not products:
        return jsonify({'error': 'Batch number, date, and products required'}), 400
    
    # Create batch
    batch_id = Batch.create(batch_number, batch_date, supervisor_id, notes)
    
    # Add products
    for product in products:
        execute_insert("""
            INSERT INTO batch_products (batch_id, product_id, quantity_produced)
            VALUES (%s, %s, %s)
        """, (batch_id, product.get('product_id'), product.get('quantity')))
    
    return jsonify({
        'message': 'Batch created successfully',
        'batch_id': batch_id
    }), 201

@api_bp.route('/batches/<int:batch_id>/status', methods=['PUT'])
@token_required
@role_required('production')
def update_batch_status(batch_id):
    data = request.get_json()
    status = data.get('status')
    
    if not status:
        return jsonify({'error': 'Status required'}), 400
    
    Batch.update_status(batch_id, status)
    return jsonify({'message': 'Batch status updated'}), 200