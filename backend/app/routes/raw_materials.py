from flask import request, jsonify
from app.routes import api_bp
from app.routes.auth import token_required
from app.database import execute_query, execute_insert, execute_update

# ============ GET ALL RAW MATERIALS ============
@api_bp.route('/raw-materials', methods=['GET'])
@token_required
def get_raw_materials():
    materials = execute_query("""
        SELECT 
            rm.material_id,
            rm.material_name,
            rm.unit,
            rm.cost_per_unit_ugx,
            rm.current_stock,
            rm.minimum_stock,
            rm.last_restocked,
            rm.supplier_id,
            s.supplier_name
        FROM raw_materials rm
        LEFT JOIN suppliers s ON rm.supplier_id = s.supplier_id
        ORDER BY rm.material_name
    """)
    return jsonify(materials), 200

# ============ GET SINGLE RAW MATERIAL ============
@api_bp.route('/raw-materials/<int:material_id>', methods=['GET'])
@token_required
def get_raw_material(material_id):
    result = execute_query("""
        SELECT 
            rm.*, 
            s.supplier_name 
        FROM raw_materials rm
        LEFT JOIN suppliers s ON rm.supplier_id = s.supplier_id
        WHERE rm.material_id = %s
    """, (material_id,))
    return jsonify(result[0] if result else {}), 200

# ============ CREATE RAW MATERIAL ============
@api_bp.route('/raw-materials', methods=['POST'])
@token_required
def create_raw_material():
    try:
        data = request.get_json() or {}

        material_name = (data.get('material_name') or '').strip()
        unit = (data.get('unit') or '').strip()
        cost_per_unit_ugx = float(data.get('cost_per_unit_ugx') or 0)
        current_stock = float(data.get('current_stock') or 0)
        minimum_stock = float(data.get('minimum_stock') or 0)
        supplier_id = data.get('supplier_id') or None
        last_restocked = data.get('last_restocked') or None

        if not material_name or not unit:
            return jsonify({'error': 'Material name and unit are required'}), 400

        material_id = execute_insert("""
            INSERT INTO raw_materials 
            (material_name, unit, cost_per_unit_ugx, current_stock, minimum_stock, supplier_id, last_restocked)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (material_name, unit, cost_per_unit_ugx, current_stock, minimum_stock, supplier_id, last_restocked))

        created_material = execute_query("""
            SELECT 
                rm.material_id,
                rm.material_name,
                rm.unit,
                rm.cost_per_unit_ugx,
                rm.current_stock,
                rm.minimum_stock,
                rm.last_restocked,
                rm.supplier_id,
                s.supplier_name
            FROM raw_materials rm
            LEFT JOIN suppliers s ON rm.supplier_id = s.supplier_id
            WHERE rm.material_id = %s
        """, (material_id,))

        if not created_material:
            return jsonify({'error': 'Raw material was not saved to the database'}), 500

        return jsonify({
            'message': 'Raw material created successfully',
            'material_id': material_id,
            'material': created_material[0]
        }), 201
    except Exception as exc:
        return jsonify({'error': str(exc)}), 500

# ============ UPDATE RAW MATERIAL ============
@api_bp.route('/raw-materials/<int:material_id>', methods=['PUT'])
@token_required
def update_raw_material(material_id):
    data = request.get_json()
    
    material_name = data.get('material_name')
    unit = data.get('unit')
    cost_per_unit_ugx = data.get('cost_per_unit_ugx', 0)
    current_stock = data.get('current_stock', 0)
    minimum_stock = data.get('minimum_stock', 0)
    supplier_id = data.get('supplier_id') or None
    last_restocked = data.get('last_restocked')
    
    if not material_name or not unit:
        return jsonify({'error': 'Material name and unit are required'}), 400
    
    execute_update("""
        UPDATE raw_materials 
        SET material_name = %s, 
            unit = %s, 
            cost_per_unit_ugx = %s, 
            current_stock = %s, 
            minimum_stock = %s, 
            supplier_id = %s, 
            last_restocked = %s
        WHERE material_id = %s
    """, (material_name, unit, cost_per_unit_ugx, current_stock, minimum_stock, 
          supplier_id, last_restocked, material_id))
    
    return jsonify({'message': 'Raw material updated successfully'}), 200

# ============ DELETE RAW MATERIAL ============
@api_bp.route('/raw-materials/<int:material_id>', methods=['DELETE'])
@token_required
def delete_raw_material(material_id):
    execute_update("DELETE FROM raw_materials WHERE material_id = %s", (material_id,))
    return jsonify({'message': 'Raw material deleted successfully'}), 200

# ============ UPDATE STOCK ============
@api_bp.route('/raw-materials/<int:material_id>/stock', methods=['PUT'])
@token_required
def update_stock(material_id):
    data = request.get_json()
    quantity = data.get('quantity', 0)
    action = data.get('action', 'add')
    
    if quantity <= 0:
        return jsonify({'error': 'Quantity must be greater than 0'}), 400
    
    if action == 'add':
        execute_update("""
            UPDATE raw_materials 
            SET current_stock = current_stock + %s,
                last_restocked = CURDATE()
            WHERE material_id = %s
        """, (quantity, material_id))
        message = f'Added {quantity} units to stock'
    elif action == 'subtract':
        # Check if enough stock
        result = execute_query("SELECT current_stock FROM raw_materials WHERE material_id = %s", (material_id,))
        if result and result[0]['current_stock'] < quantity:
            return jsonify({'error': 'Insufficient stock'}), 400
        
        execute_update("""
            UPDATE raw_materials 
            SET current_stock = current_stock - %s
            WHERE material_id = %s
        """, (quantity, material_id))
        message = f'Removed {quantity} units from stock'
    else:
        return jsonify({'error': 'Invalid action. Use "add" or "subtract"'}), 400
    
    return jsonify({'message': message}), 200

# ============ GET LOW STOCK ITEMS ============
@api_bp.route('/raw-materials/low-stock', methods=['GET'])
@token_required
def get_low_stock():
    materials = execute_query("""
        SELECT 
            rm.*, 
            s.supplier_name,
            (rm.minimum_stock - rm.current_stock) as reorder_quantity
        FROM raw_materials rm
        LEFT JOIN suppliers s ON rm.supplier_id = s.supplier_id
        WHERE rm.current_stock <= rm.minimum_stock
        ORDER BY reorder_quantity DESC
    """)
    return jsonify(materials), 200