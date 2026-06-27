# app/routes/suppliers.py
from flask import request, jsonify
from app.routes import api_bp
from app.routes.auth import token_required
from app.database import execute_query, execute_insert, execute_update

@api_bp.route('/suppliers', methods=['GET'])
@token_required
def get_suppliers():
    suppliers = execute_query("SELECT * FROM suppliers ORDER BY supplier_name")
    return jsonify(suppliers), 200

@api_bp.route('/suppliers', methods=['POST'])
@token_required
def create_supplier():
    data = request.get_json()
    supplier_id = execute_insert("""
        INSERT INTO suppliers (supplier_name, contact_person, phone, email, location, notes)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (data.get('supplier_name'), data.get('contact_person'), data.get('phone'),
          data.get('email'), data.get('location'), data.get('notes')))
    return jsonify({'message': 'Supplier created', 'supplier_id': supplier_id}), 201

@api_bp.route('/suppliers/<int:supplier_id>', methods=['PUT'])
@token_required
def update_supplier(supplier_id):
    data = request.get_json()
    execute_update("""
        UPDATE suppliers 
        SET supplier_name=%s, contact_person=%s, phone=%s, email=%s, location=%s, notes=%s
        WHERE supplier_id=%s
    """, (data.get('supplier_name'), data.get('contact_person'), data.get('phone'),
          data.get('email'), data.get('location'), data.get('notes'), supplier_id))
    return jsonify({'message': 'Supplier updated'}), 200

@api_bp.route('/suppliers/<int:supplier_id>', methods=['DELETE'])
@token_required
def delete_supplier(supplier_id):
    execute_update("DELETE FROM suppliers WHERE supplier_id=%s", (supplier_id,))
    return jsonify({'message': 'Supplier deleted'}), 200