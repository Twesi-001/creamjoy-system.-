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
                p.unit_price_ugx as unit_price,
                p.flavour,
                p.size,
                f.flavour_name,
                s.size_name
            FROM products p
            LEFT JOIN flavours f ON p.flavour_id = f.flavour_id
            LEFT JOIN pack_sizes s ON p.size_id = s.size_id
            ORDER BY f.flavour_name, FIELD(s.size_name, '5L', '2L', '1L', '300ml')
        """)
        
        print(f"✅ Products found: {len(products)}")
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
        print(f"📦 Received product data: {data}")
        
        # Get fields
        flavour_id = data.get('flavour_id')
        size_id = data.get('size_id')
        unit_price = data.get('unit_price', 0)
        
        # Validate
        if not flavour_id or not size_id:
            return jsonify({'error': 'Flavour and size are required'}), 400
        
        # Convert to int
        try:
            flavour_id = int(flavour_id)
            size_id = int(size_id)
            unit_price = float(unit_price) if unit_price else 0
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid flavour or size ID'}), 400
        
        # Check if product already exists
        existing = execute_query("""
            SELECT product_id FROM products 
            WHERE flavour_id = %s AND size_id = %s
        """, (flavour_id, size_id))
        
        if existing:
            return jsonify({'error': 'This product combination already exists'}), 400
        
        # Get flavour and size names
        flavour_res = execute_query("SELECT flavour_name FROM flavours WHERE flavour_id = %s", (flavour_id,))
        size_res = execute_query("SELECT size_name FROM pack_sizes WHERE size_id = %s", (size_id,))
        
        if not flavour_res or not size_res:
            return jsonify({'error': 'Invalid flavour or size'}), 400
        
        flavour_name = flavour_res[0]['flavour_name']
        size_name = size_res[0]['size_name']
        
        product_id = execute_insert("""
            INSERT INTO products (flavour_id, size_id, unit_price_ugx, flavour, size)
            VALUES (%s, %s, %s, %s, %s)
        """, (flavour_id, size_id, unit_price, flavour_name, size_name))

        created_product = execute_query("""
            SELECT 
                p.product_id,
                p.flavour_id,
                p.size_id,
                p.unit_price_ugx as unit_price,
                p.flavour,
                p.size,
                f.flavour_name,
                s.size_name
            FROM products p
            LEFT JOIN flavours f ON p.flavour_id = f.flavour_id
            LEFT JOIN pack_sizes s ON p.size_id = s.size_id
            WHERE p.product_id = %s
        """, (product_id,))

        if not created_product:
            return jsonify({'error': 'Product was not saved to the database'}), 500

        return jsonify({
            'message': 'Product created successfully',
            'product_id': product_id,
            'product': created_product[0]
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
        unit_price = data.get('unit_price')
        
        if unit_price is None:
            return jsonify({'error': 'Unit price is required'}), 400
        
        execute_update("""
            UPDATE products SET unit_price_ugx = %s WHERE product_id = %s
        """, (unit_price, product_id))
        
        return jsonify({'message': 'Product updated successfully'}), 200
        
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
