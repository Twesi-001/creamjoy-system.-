from flask import jsonify
from app.routes import api_bp
from app.models import Staff
from app.routes.auth import token_required

@api_bp.route('/staff', methods=['GET'])
@token_required
def get_staff():
    staff = Staff.get_all()
    return jsonify(staff), 200

@api_bp.route('/staff/<int:staff_id>', methods=['GET'])
@token_required
def get_staff_member(staff_id):
    staff = Staff.get_by_id(staff_id)
    if not staff:
        return jsonify({'error': 'Staff not found'}), 404
    return jsonify(staff), 200