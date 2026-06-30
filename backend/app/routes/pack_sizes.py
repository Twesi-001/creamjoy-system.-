from flask import jsonify
from app.routes import api_bp
from app.routes.auth import token_required
from app.database import execute_query

@api_bp.route('/pack-sizes', methods=['GET'])
@token_required
def get_pack_sizes():
    sizes = execute_query("SELECT * FROM pack_sizes ORDER BY size_name")
    return jsonify(sizes), 200
