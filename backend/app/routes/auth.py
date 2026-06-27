
import jwt
import datetime
from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app.routes import api_bp
from app.config import Config
from app.database import execute_query, execute_insert

@api_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    users = execute_query("""
        SELECT staff_id, name, email, role, password_hash 
        FROM staff 
        WHERE email = %s
    """, (email,))
    
    if not users:
        return jsonify({'error': 'Invalid email or password'}), 401
    
    user = users[0]
    
    if user.get('password_hash'):
        if not check_password_hash(user['password_hash'], password):
            return jsonify({'error': 'Invalid email or password'}), 401
    
    token = jwt.encode({
        'staff_id': user['staff_id'],
        'email': user['email'],
        'role': user['role'],
        'name': user['name'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, Config.JWT_SECRET_KEY, algorithm='HS256')
    
    return jsonify({
        'token': token,
        'user': {
            'staff_id': user['staff_id'],
            'name': user['name'],
            'email': user['email'],
            'role': user['role']
        }
    }), 200

@api_bp.route('/auth/me', methods=['GET'])
def get_current_user():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'No token provided'}), 401
    
    try:
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({'error': 'Invalid Authorization header format. Use: Bearer <token>'}), 401
        
        token = parts[1]
        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
        
        user = execute_query("""
            SELECT staff_id, name, email, role, phone 
            FROM staff 
            WHERE staff_id = %s
        """, (payload['staff_id'],))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user[0]), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401

# ============ AUTH DECORATORS ============

def token_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'No token provided'}), 401
        
        # ✅ FIXED: Properly parse the Authorization header
        parts = auth_header.split()
        
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({'error': 'Invalid Authorization header format. Use: Bearer <token>'}), 401
        
        token = parts[1]
        
        try:
            payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
            request.staff = payload
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    return decorated

def role_required(allowed_roles):
    def decorator(f):
        from functools import wraps
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(request, 'staff'):
                return jsonify({'error': 'Authentication required'}), 401
            
            role = request.staff.get('role')
            if role not in allowed_roles and role != 'admin':
                return jsonify({'error': 'Insufficient permissions'}), 403
            
            return f(*args, **kwargs)
        return decorated
    return decorator

def admin_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if not hasattr(request, 'staff'):
            return jsonify({'error': 'Authentication required'}), 401
        
        role = request.staff.get('role')
        if role != 'admin' and role != 'supervisor':
            return jsonify({'error': 'Admin access required'}), 403
        
        return f(*args, **kwargs)
    return decorated
