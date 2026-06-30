from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.database import mysql

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # ✅ FIXED: Single CORS configuration with explicit origins
    allowed_origins = [
        "https://creamjoy-frontend.vercel.app",
        "https://creamjoy-system-in97.vercel.app",
        "https://creamjoy-system-in97-git-main-twesi-001-s-projects.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
        "https://creamjoy-frontend.vercel.app",
    ]
    
    CORS(app, 
         origins=allowed_origins,
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
         allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
         expose_headers=["Content-Type", "Authorization"],
         supports_credentials=True,
         max_age=3600)
    
    mysql.init_app(app)
    
    # Register blueprints
    from app.routes import api_bp
    app.register_blueprint(api_bp)
    
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
                'flavours': '/api/flavours',
                'pack-sizes': '/api/pack-sizes',
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