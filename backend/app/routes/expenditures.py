from flask import request, jsonify
from app.routes import api_bp
from app.routes.auth import token_required
from app.database import execute_insert, execute_query

@api_bp.route('/expenditures', methods=['POST'])
@token_required
def create_expenditure():
    data = request.get_json()
    
    category = data.get('category')
    description = data.get('description')
    quantity = data.get('quantity')
    unit = data.get('unit')
    amount_ugx = data.get('amount_ugx')
    paid_by = data.get('paid_by')
    expenditure_date = data.get('expenditure_date')
    notes = data.get('notes')
    
    if not category or not amount_ugx:
        return jsonify({'error': 'Category and amount required'}), 400
    
    expenditure_id = execute_insert("""
        INSERT INTO expenditures (category, description, quantity, unit, amount_ugx, paid_by, expenditure_date, notes)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (category, description, quantity, unit, amount_ugx, paid_by, expenditure_date, notes))
    
    return jsonify({
        'message': 'Expenditure recorded successfully',
        'expenditure_id': expenditure_id
    }), 201

@api_bp.route('/expenditures/summary', methods=['GET'])
@token_required
def get_expenditure_summary():
    summary = execute_query("""
        SELECT 
            category,
            SUM(amount_ugx) as total_spent,
            COUNT(*) as count
        FROM expenditures
        GROUP BY category
        ORDER BY total_spent DESC
    """)
    return jsonify(summary), 200