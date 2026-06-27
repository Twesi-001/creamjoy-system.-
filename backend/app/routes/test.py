from flask import jsonify
from app.routes import api_bp

@api_bp.route('/test', methods=['GET'])
def test_route():
    return jsonify({
        'message': 'Test route works!',
        'status': 'success',
        'timestamp': '2026-06-27'
    }), 200