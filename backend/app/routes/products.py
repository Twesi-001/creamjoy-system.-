from flask import request, jsonify
from app.routes import api_bp
from app.models import Product
from app.routes.auth import token_required
from app.database import execute_query, execute_insert, execute_update

@api_bp.route('/products', methods=['GET'])
@token_required
def get_products():
    products = Product.get_all()
    return jsonify(products), 200

@api_bp.route('/products', methods=['POST'])
@token_required
def create_product():
    data = request.get_json() or {}
    flavour_id = data.get('flavour_id')
    size_id = data.get('size_id')
    unit_price = data.get('unit_price')

    if not flavour_id or not size_id or unit_price is None:
        return jsonify({'error': 'Flavour, size, and unit price are required.'}), 400

    duplicate = execute_query(
        'SELECT product_id FROM products WHERE flavour_id = %s AND size_id = %s',
        (flavour_id, size_id)
    )
    if duplicate:
        return jsonify({'error': 'Product combination already exists.'}), 400

    product_id = execute_insert(
        'INSERT INTO products (flavour_id, size_id, unit_price) VALUES (%s, %s, %s)',
        (flavour_id, size_id, unit_price)
    )
    product = execute_query(
        '''
        SELECT p.*, f.flavour_name, s.size_name
        FROM products p
        JOIN flavours f ON p.flavour_id = f.flavour_id
        JOIN pack_sizes s ON p.size_id = s.size_id
        WHERE p.product_id = %s
        ''',
        (product_id,)
    )
    return jsonify({'message': 'Product created', 'product': product[0] if product else None}), 201

@api_bp.route('/products/<int:product_id>', methods=['PUT'])
@token_required
def update_product(product_id):
    data = request.get_json() or {}
    unit_price = data.get('unit_price')

    if unit_price is None:
        return jsonify({'error': 'Unit price is required.'}), 400

    execute_update('UPDATE products SET unit_price = %s WHERE product_id = %s', (unit_price, product_id))
    product = execute_query(
        '''
        SELECT p.*, f.flavour_name, s.size_name
        FROM products p
        JOIN flavours f ON p.flavour_id = f.flavour_id
        JOIN pack_sizes s ON p.size_id = s.size_id
        WHERE p.product_id = %s
        ''',
        (product_id,)
    )
    return jsonify({'message': 'Product updated', 'product': product[0] if product else None}), 200

@api_bp.route('/products/<int:product_id>', methods=['DELETE'])
@token_required
def delete_product(product_id):
    execute_update('DELETE FROM products WHERE product_id = %s', (product_id,))
    return jsonify({'message': 'Product deleted'}), 200

@api_bp.route('/flavours', methods=['GET'])
@token_required
def get_flavours():
    flavours = execute_query('SELECT flavour_id, flavour_name FROM flavours ORDER BY flavour_name')
    return jsonify(flavours), 200

@api_bp.route('/pack-sizes', methods=['GET'])
@token_required
def get_pack_sizes():
    pack_sizes = execute_query('SELECT size_id, size_name FROM pack_sizes ORDER BY size_name')
    return jsonify(pack_sizes), 200

@api_bp.route('/products/<int:product_id>', methods=['GET'])
@token_required
def get_product(product_id):
    product = Product.get_by_id(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify(product), 200