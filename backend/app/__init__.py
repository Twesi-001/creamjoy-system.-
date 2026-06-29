from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.database import mysql

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app)
    mysql.init_app(app)
    
    # Register blueprints
    from app.routes import api_bp
    app.register_blueprint(api_bp)
    
    # ✅ Add root route INSIDE the function where 'app' exists
    @app.route('/')
    def home():
        return {
            'message': 'CreamJoy API is running!',
            'status': 'ok',
            'version': '1.0.0',
            'endpoints': {
                'health': '/health',
                'login': '/api/auth/login',
                'customers': '/api/customers',
                'batches': '/api/batches',
                'orders': '/api/orders',
                'deliveries': '/api/deliveries',
                'inventory': '/api/inventory',
                'products': '/api/products',
                'suppliers': '/api/suppliers',
                'credit': '/api/credit-accounts'
            }
        }, 200
    
    @app.route('/health')
    def health():
        return {
            'status': 'ok',
            'system': 'CreamJoy API',
            'version': '1.0.0'
        }, 200
    
    return app