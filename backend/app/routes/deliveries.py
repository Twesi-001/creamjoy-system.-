from flask import jsonify
from app.routes import api_bp
from app.routes.auth import token_required
from app.database import execute_query
import traceback

@api_bp.route('/deliveries', methods=['GET'])
@token_required
def get_deliveries():
    try:
        # Use the correct column names from your table
        deliveries = execute_query("""
            SELECT 
                d.delivery_id,
                d.order_id,
                d.staff_id,
                d.delivery_date,
                d.status,
                d.notes,
                d.updated_at,
                s.name as staff_name,
                c.customer_name as customer_name
            FROM deliveries d
            LEFT JOIN staff s ON d.staff_id = s.staff_id
            LEFT JOIN orders o ON d.order_id = o.order_id
            LEFT JOIN customers c ON o.customer_id = c.customer_id
            ORDER BY d.delivery_date DESC
        """)
        return jsonify(deliveries), 200
    except Exception as e:
        print(f"🔥 Error in GET /deliveries: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500
