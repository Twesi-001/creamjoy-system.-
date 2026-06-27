
from werkzeug.security import generate_password_hash
import MySQLdb

# Database connection (XAMPP default - blank password)
conn = MySQLdb.connect(
    host='localhost',
    user='root',
    passwd='Peacebewithyouall@2023!1',
    database='creamjoy_db'
)

cursor = conn.cursor()

# Generate password hash
password = 'password123'
password_hash = generate_password_hash(password)

# Insert supervisor
cursor.execute("""
    INSERT INTO staff (name, email, role, phone, password_hash)
    VALUES ('Supervisor User', 'supervisor@creamjoy.com', 'supervisor', '0777000004', %s)
""", (password_hash,))

conn.commit()
print("✅ Supervisor user created successfully!")
print("   Email: supervisor@creamjoy.com")
print("   Password: password123")

cursor.close()
conn.close()
