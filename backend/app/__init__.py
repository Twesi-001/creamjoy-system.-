from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.database import mysql

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app)
    mysql.init_app(app)
    
    from app.routes import api_bp
    app.register_blueprint(api_bp)
    
    @app.route('/health')
    def health():
        return {
            'status': 'ok',
            'system': 'CreamJoy API',
            'version': '1.0.0'
        }
    
    return app