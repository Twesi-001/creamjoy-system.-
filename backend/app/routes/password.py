from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app.routes import api_bp
from app.routes.auth import token_required, admin_required
from app.database import execute_query, execute_update

# ============ CHANGE OWN PASSWORD ============
@api_bp.route('/auth/change-password', methods=['POST'])
@token_required
def change_password():
    data = request.get_json()
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    confirm_password = data.get('confirm_password')
    
    # Validation
    if not current_password or not new_password or not confirm_password:
        return jsonify({'error': 'All password fields are required'}), 400
    
    if new_password != confirm_password:
        return jsonify({'error': 'New passwords do not match'}), 400
    
    if len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters'}), 400
    
    # Get current user
    staff_id = request.staff.get('staff_id')
    user = execute_query("""
        SELECT staff_id, password_hash FROM staff WHERE staff_id = %s
    """, (staff_id,))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Verify current password
    if not check_password_hash(user[0]['password_hash'], current_password):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    # Update password
    new_hash = generate_password_hash(new_password)
    execute_update("""
        UPDATE staff SET password_hash = %s, updated_at = NOW()
        WHERE staff_id = %s
    """, (new_hash, staff_id))
    
    return jsonify({
        'message': 'Password changed successfully',
        'staff_id': staff_id
    }), 200

# ============ ADMIN: FORCE RESET ANY USER'S PASSWORD ============
@api_bp.route('/admin/users/<int:user_id>/reset-password', methods=['POST'])
@token_required
@admin_required
def admin_reset_password(user_id):
    data = request.get_json()
    new_password = data.get('new_password')
    
    if not new_password:
        return jsonify({'error': 'New password is required'}), 400
    
    if len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters'}), 400
    
    # Check if user exists
    user = execute_query("SELECT staff_id FROM staff WHERE staff_id = %s", (user_id,))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Update password
    new_hash = generate_password_hash(new_password)
    execute_update("""
        UPDATE staff SET password_hash = %s, updated_at = NOW()
        WHERE staff_id = %s
    """, (new_hash, user_id))
    
    return jsonify({
        'message': 'Password reset successfully',
        'staff_id': user_id
    }), 200

# ============ ADMIN: GET PASSWORD STATUS FOR A USER ============
@api_bp.route('/admin/users/<int:user_id>/password-status', methods=['GET'])
@token_required
@admin_required
def get_password_status(user_id):
    user = execute_query("""
        SELECT staff_id, name, email, role, 
               CASE WHEN password_hash IS NOT NULL THEN 'Set' ELSE 'Not Set' END as password_status,
               updated_at as last_password_change
        FROM staff 
        WHERE staff_id = %s
    """, (user_id,))
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'staff_id': user[0]['staff_id'],
        'name': user[0]['name'],
        'email': user[0]['email'],
        'role': user[0]['role'],
        'password_status': user[0]['password_status'],
        'last_password_change': user[0]['last_password_change']
    }), 200

# ============ ADMIN: GET ALL USERS PASSWORD STATUS ============
@api_bp.route('/admin/users/password-status', methods=['GET'])
@token_required
@admin_required
def get_all_password_status():
    users = execute_query("""
        SELECT 
            staff_id, 
            name, 
            email, 
            role, 
            CASE WHEN password_hash IS NOT NULL THEN 'Set' ELSE 'Not Set' END as password_status,
            updated_at as last_password_change
        FROM staff 
        ORDER BY name
    """)
    
    return jsonify(users), 200
