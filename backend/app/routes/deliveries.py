from flask import request, jsonify
from app.routes import api_bp
from app.models import Delivery
from app.routes.auth import token_required
from app.database import execute_query

@api_bp.route('/deliveries', methods=['GET'])
@token_required
def get_deliveries():
    deliveries = Delivery.get_all()
    return jsonify(deliveries), 200

@api_bp.route('/deliveries/<int:delivery_id>/status', methods=['PUT'])
@token_required
def update_delivery_status(delivery_id):
    data = request.get_json()
    status = data.get('status')
    
    if not status:
        return jsonify({'error': 'Status required'}), 400
    
    Delivery.update_status(delivery_id, status)
    return jsonify({'message': 'Delivery status updated'}), 200

@api_bp.route('/deliveries/audit', methods=['GET'])
@token_required
def get_delivery_audit():
    audit = execute_query("""
        SELECT * FROM delivery_audit 
        ORDER BY changed_at DESC 
        LIMIT 50
    """)
    return jsonify(audit), 200