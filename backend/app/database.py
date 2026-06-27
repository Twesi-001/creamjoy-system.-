import MySQLdb.cursors
from flask_mysqldb import MySQL

mysql = MySQL()

def get_db():
    return mysql

def execute_query(query, params=None):
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute(query, params or ())
    result = cursor.fetchall()
    cursor.close()
    return result

def execute_insert(query, params=None):
    cursor = mysql.connection.cursor()
    cursor.execute(query, params or ())
    mysql.connection.commit()
    last_id = cursor.lastrowid
    cursor.close()
    return last_id

def execute_update(query, params=None):
    cursor = mysql.connection.cursor()
    cursor.execute(query, params or ())
    mysql.connection.commit()
    affected_rows = cursor.rowcount
    cursor.close()
    return affected_rows