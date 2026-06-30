from flask import jsonify
from app.routes import api_bp
from app.routes.auth import token_required
from app.database import execute_query
import traceback

@api_bp.route('/flavours', methods=['GET'])
@token_required
def get_flavours():
    try:
        flavours = execute_query("""
            SELECT flavour_id, flavour_name 
            FROM flavours 
            ORDER BY flavour_name
        """)
        return jsonify(flavours), 200
    except Exception as e:
        print(f"🔥 Error fetching flavours: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500