from flask import request, jsonify
from app.routes import api_bp
from app.routes.auth import token_required
from app.database import execute_query, execute_insert, execute_update
import traceback

@api_bp.route('/products', methods=['GET'])
@token_required
def get_products():
    try:
        products = execute_query("""
            SELECT 
                p.product_id,
                p.flavour_id,
                p.size_id,
                p.unit_price,
                f.flavour_name,
                s.size_name
            FROM products p
            JOIN flavours f ON p.flavour_id = f.flavour_id
            JOIN pack_sizes s ON p.size_id = s.size_id
            ORDER BY f.flavour_name, FIELD(s.size_name, '5L', '2L', '1L', '300ml')
        """)
        return jsonify(products), 200
    except Exception as e:
        print(f"🔥 Error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@api_bp.route('/products', methods=['POST'])
@token_required
def create_product():
    try:
        data = request.get_json()
        print(f"📦 Creating product: {data}")
        
        flavour_id = data.get('flavour_id')
        size_id = data.get('size_id')
        unit_price = data.get('unit_price', 0)
        
        if not flavour_id or not size_id:
            return jsonify({'error': 'Flavour and size are required'}), 400
        
        # Check if product already exists
        existing = execute_query("""
            SELECT product_id FROM products 
            WHERE flavour_id = %s AND size_id = %s
        """, (flavour_id, size_id))
        
        if existing:
            return jsonify({'error': 'This product combination already exists'}), 400
        
        product_id = execute_insert("""
            INSERT INTO products (flavour_id, size_id, unit_price)
            VALUES (%s, %s, %s)
        """, (flavour_id, size_id, unit_price))
        
        # Get the created product
        product = execute_query("""
            SELECT 
                p.product_id,
                p.flavour_id,
                p.size_id,
                p.unit_price,
                f.flavour_name,
                s.size_name
            FROM products p
            JOIN flavours f ON p.flavour_id = f.flavour_id
            JOIN pack_sizes s ON p.size_id = s.size_id
            WHERE p.product_id = %s
        """, (product_id,))
        
        return jsonify({
            'message': 'Product created successfully',
            'product': product[0] if product else None
        }), 201
        
    except Exception as e:
        print(f"🔥 Error creating product: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@api_bp.route('/products/<int:product_id>', methods=['PUT'])
@token_required
def update_product(product_id):
    try:
        data = request.get_json()
        print(f"📦 Updating product {product_id}: {data}")
        
        unit_price = data.get('unit_price')
        
        if unit_price is None:
            return jsonify({'error': 'Unit price is required'}), 400
        
        execute_update("""
            UPDATE products SET unit_price = %s WHERE product_id = %s
        """, (unit_price, product_id))
        
        # Get the updated product
        product = execute_query("""
            SELECT 
                p.product_id,
                p.flavour_id,
                p.size_id,
                p.unit_price,
                f.flavour_name,
                s.size_name
            FROM products p
            JOIN flavours f ON p.flavour_id = f.flavour_id
            JOIN pack_sizes s ON p.size_id = s.size_id
            WHERE p.product_id = %s
        """, (product_id,))
        
        return jsonify({
            'message': 'Product updated successfully',
            'product': product[0] if product else None
        }), 200
        
    except Exception as e:
        print(f"🔥 Error updating product: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@api_bp.route('/products/<int:product_id>', methods=['DELETE'])
@token_required
def delete_product(product_id):
    try:
        # Check if product is used in orders
        orders = execute_query("SELECT order_id FROM order_lines WHERE product_id = %s LIMIT 1", (product_id,))
        if orders:
            return jsonify({'error': 'Cannot delete product that has been ordered'}), 400
        
        # Check if product is used in batches
        batches = execute_query("SELECT batch_id FROM batch_products WHERE product_id = %s LIMIT 1", (product_id,))
        if batches:
            return jsonify({'error': 'Cannot delete product that has been produced'}), 400
        
        execute_update("DELETE FROM products WHERE product_id = %s", (product_id,))
        return jsonify({'message': 'Product deleted successfully'}), 200
        
    except Exception as e:
        print(f"🔥 Error deleting product: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500
