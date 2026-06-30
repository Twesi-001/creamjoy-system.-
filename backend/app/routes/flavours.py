from flask import jsonify
from app.routes import api_bp
from app.routes.auth import token_required
from app.database import execute_query

@api_bp.route('/flavours', methods=['GET'])
@token_required
def get_flavours():
    flavours = execute_query("SELECT * FROM flavours ORDER BY flavour_name")
    return jsonify(flavours), 200
