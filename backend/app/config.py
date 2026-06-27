import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', '')
    MYSQL_DB = os.getenv('MYSQL_DB', 'creamjoy_db')
    MYSQL_PORT = int(os.getenv('MYSQL_PORT', 3306))
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-secret-key')
    
    # MySQL connection string for Flask-MySQLdb
    MYSQL_HOST = MYSQL_HOST
    MYSQL_USER = MYSQL_USER
    MYSQL_PASSWORD = MYSQL_PASSWORD
    MYSQL_DB = MYSQL_DB
    MYSQL_PORT = MYSQL_PORT
    MYSQL_CURSORCLASS = 'DictCursor'