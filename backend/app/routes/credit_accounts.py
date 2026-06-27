from flask import jsonify
from app.routes import api_bp
from app.routes.auth import token_required
from app.database import execute_query

@api_bp.route('/credit-accounts', methods=['GET'])
@token_required
def get_credit_accounts():
    accounts = execute_query("""
        SELECT ca.*, c.name as customer_name, c.location
        FROM credit_accounts ca
        JOIN customers c ON ca.customer_id = c.customer_id
        WHERE ca.status != 'paid'
        ORDER BY ca.amount_ugx DESC
    """)
    return jsonify(accounts), 200

@api_bp.route('/credit-accounts/summary', methods=['GET'])
@token_required
def get_credit_summary():
    summary = execute_query("""
        SELECT 
            SUM(amount_ugx) as total_outstanding,
            COUNT(*) as count
        FROM credit_accounts
        WHERE status != 'paid'
    """)
    return jsonify(summary[0] if summary else {'total_outstanding': 0, 'count': 0}), 200