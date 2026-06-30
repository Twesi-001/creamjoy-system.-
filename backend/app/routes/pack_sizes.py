from flask import jsonify
from app.routes import api_bp
from app.routes.auth import token_required
from app.database import execute_query
import traceback

@api_bp.route('/pack-sizes', methods=['GET'])
@token_required
def get_pack_sizes():
    try:
        sizes = execute_query("""
            SELECT size_id, size_name 
            FROM pack_sizes 
            ORDER BY size_name
        """)
        return jsonify(sizes), 200
    except Exception as e:
        print(f"🔥 Error fetching pack sizes: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500