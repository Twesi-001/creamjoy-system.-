from flask import jsonify
from app.routes import api_bp
from app.models import Product
from app.routes.auth import token_required

@api_bp.route('/products', methods=['GET'])
@token_required
def get_products():
    products = Product.get_all()
    return jsonify(products), 200

@api_bp.route('/products/<int:product_id>', methods=['GET'])
@token_required
def get_product(product_id):
    product = Product.get_by_id(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify(product), 200