
from flask import jsonify
from app.routes import api_bp
from app.routes.auth import token_required
from app.database import execute_query

@api_bp.route('/customers', methods=['GET'])
@token_required
def get_customers():
    try:
        customers = execute_query("""
            SELECT 
                customer_id, 
                customer_name as name, 
                location, 
                training_phone as phone, 
                customer_type, 
                notes
            FROM customers 
            ORDER BY customer_name
        """)
        return jsonify(customers), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
