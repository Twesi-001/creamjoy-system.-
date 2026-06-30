from flask import jsonify
from app.routes import api_bp
from app.routes.auth import token_required
from app.database import execute_query
import traceback

@api_bp.route('/credit-accounts', methods=['GET'])
@token_required
def get_credit_accounts():
    try:
        accounts = execute_query("""
            SELECT 
                ca.credit_id,
                ca.customer_id,
                ca.amount_ugx,
                ca.transaction_date as date_recorded,
                ca.status,
                ca.amount_paid_ugx,
                ca.notes,
                ca.created_at,
                ca.updated_at,
                c.customer_name,
                c.location
            FROM credit_accounts ca
            LEFT JOIN customers c ON ca.customer_id = c.customer_id
            WHERE ca.status != 'paid' OR ca.status IS NULL
            ORDER BY ca.amount_ugx DESC
        """)
        return jsonify(accounts), 200
    except Exception as e:
        print(f"🔥 Error in GET /credit-accounts: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@api_bp.route('/credit-accounts/summary', methods=['GET'])
@token_required
def get_credit_summary():
    try:
        result = execute_query("""
            SELECT 
                COALESCE(SUM(amount_ugx), 0) as total_outstanding,
                COUNT(*) as count
            FROM credit_accounts
            WHERE status != 'paid' OR status IS NULL
        """)
        return jsonify(result[0] if result else {'total_outstanding': 0, 'count': 0}), 200
    except Exception as e:
        print(f"🔥 Error in GET /credit-accounts/summary: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500
