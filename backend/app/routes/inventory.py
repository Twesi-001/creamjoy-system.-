from flask import request, jsonify
from app.routes import api_bp
from app.models import Inventory
from app.routes.auth import token_required

@api_bp.route('/inventory', methods=['GET'])
@token_required
def get_inventory():
    inventory = Inventory.get_all()
    return jsonify(inventory), 200

@api_bp.route('/inventory/<int:material_id>', methods=['PUT'])
@token_required
def update_inventory(material_id):
    data = request.get_json()
    quantity = data.get('quantity')
    action = data.get('action', 'subtract')  # 'subtract' or 'add'
    
    if quantity is None:
        return jsonify({'error': 'Quantity required'}), 400
    
    if action == 'subtract':
        affected = Inventory.update_stock(material_id, quantity)
        if not affected:
            return jsonify({'error': 'Insufficient stock'}), 400
    else:
        affected = Inventory.add_stock(material_id, quantity)
    
    return jsonify({'message': 'Inventory updated successfully'}), 200