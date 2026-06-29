from flask import request, jsonify
from werkzeug.security import generate_password_hash
from app.routes import api_bp
from app.routes.auth import token_required, admin_required
from app.database import execute_query, execute_insert, execute_update

@api_bp.route('/admin/users', methods=['GET'])
@token_required
@admin_required
def get_all_users():
    users = execute_query("""
        SELECT staff_id, name, email, role, phone, status, last_login, created_at
        FROM staff
        ORDER BY name
    """)
    return jsonify(users), 200

@api_bp.route('/admin/users', methods=['POST'])
@token_required
@admin_required
def create_user():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'delivery')
    phone = data.get('phone', '')
    status = data.get('status', 'active')
    
    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required'}), 400
    
    existing = execute_query("SELECT * FROM staff WHERE email = %s", (email,))
    if existing:
        return jsonify({'error': 'User already exists'}), 400
    
    password_hash = generate_password_hash(password)
    staff_id = execute_insert("""
        INSERT INTO staff (name, email, role, phone, password_hash, status)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (name, email, role, phone, password_hash, status))
    
    return jsonify({'message': 'User created', 'staff_id': staff_id}), 201

@api_bp.route('/admin/users/<int:user_id>', methods=['PUT'])
@token_required
@admin_required
def update_user(user_id):
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    role = data.get('role')
    phone = data.get('phone')
    status = data.get('status')
    password = data.get('password')
    
    update_fields = ["name = %s", "email = %s", "role = %s"]
    params = [name, email, role]
    
    if phone is not None:
        update_fields.append("phone = %s")
        params.append(phone)
    
    if status is not None:
        update_fields.append("status = %s")
        params.append(status)
    
    if password:
        update_fields.append("password_hash = %s")
        params.append(generate_password_hash(password))
    
    params.append(user_id)
    execute_update(f"""
        UPDATE staff SET {', '.join(update_fields)}
        WHERE staff_id = %s
    """, tuple(params))
    
    return jsonify({'message': 'User updated'}), 200

@api_bp.route('/admin/users/<int:user_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_user(user_id):
    if request.staff.get('staff_id') == user_id:
        return jsonify({'error': 'Cannot delete your own account'}), 400
    execute_update("DELETE FROM staff WHERE staff_id = %s", (user_id,))
    return jsonify({'message': 'User deleted'}), 200

@api_bp.route('/admin/users/<int:user_id>/suspend', methods=['PUT'])
@token_required
@admin_required
def suspend_user(user_id):
    if request.staff.get('staff_id') == user_id:
        return jsonify({'error': 'Cannot suspend your own account'}), 400
    execute_update("UPDATE staff SET status = 'suspended' WHERE staff_id = %s", (user_id,))
    return jsonify({'message': 'User suspended'}), 200

@api_bp.route('/admin/users/<int:user_id>/activate', methods=['PUT'])
@token_required
@admin_required
def activate_user(user_id):
    execute_update("UPDATE staff SET status = 'active' WHERE staff_id = %s", (user_id,))
    return jsonify({'message': 'User activated'}), 200

@api_bp.route('/admin/stats', methods=['GET'])
@token_required
@admin_required
def get_system_stats():
    stats = {
        'users': execute_query("SELECT COUNT(*) as count FROM staff")[0]['count'],
        'active_users': execute_query("SELECT COUNT(*) as count FROM staff WHERE status = 'active'")[0]['count'],
        'suspended_users': execute_query("SELECT COUNT(*) as count FROM staff WHERE status = 'suspended'")[0]['count'],
        'customers': execute_query("SELECT COUNT(*) as count FROM customers")[0]['count'],
        'products': execute_query("SELECT COUNT(*) as count FROM products")[0]['count'],
        'batches': execute_query("SELECT COUNT(*) as count FROM batches")[0]['count'],
        'orders': execute_query("SELECT COUNT(*) as count FROM orders")[0]['count'],
        'raw_materials': execute_query("SELECT COUNT(*) as count FROM raw_materials")[0]['count'],
        'suppliers': execute_query("SELECT COUNT(*) as count FROM suppliers")[0]['count'],
    }
    
    low_stock = execute_query("SELECT COUNT(*) as count FROM raw_materials WHERE current_stock <= minimum_stock")
    stats['low_stock'] = low_stock[0]['count'] if low_stock else 0
    
    pending_orders = execute_query("SELECT COUNT(*) as count FROM orders WHERE payment_status = 'pending'")
    stats['pending_orders'] = pending_orders[0]['count'] if pending_orders else 0
    
    return jsonify(stats), 200
