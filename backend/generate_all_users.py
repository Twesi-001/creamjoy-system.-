
import mysql.connector
from werkzeug.security import generate_password_hash

# Database connection
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='Peacebewithyouall@2023!1',
    database='creamjoy_db'
)

cursor = conn.cursor()

# Define users with their passwords
users = [
    {'email': 'jack@creamjoy.com', 'password': 'password123', 'role': 'delivery'},
    {'email': 'production@creamjoy.com', 'password': 'password123', 'role': 'production'},
    {'email': 'delivery@creamjoy.com', 'password': 'password123', 'role': 'delivery'},
    {'email': 'sales@creamjoy.com', 'password': 'password123', 'role': 'sales'},
]

for user in users:
    # Generate hash
    new_hash = generate_password_hash(user['password'])
    
    # Update or insert user
    cursor.execute("""
        UPDATE staff 
        SET password_hash = %s, role = %s
        WHERE email = %s
    """, (new_hash, user['role'], user['email']))
    
    if cursor.rowcount == 0:
        # User doesn't exist, insert
        cursor.execute("""
            INSERT INTO staff (name, email, role, phone, password_hash)
            VALUES (%s, %s, %s, %s, %s)
        """, (user['role'].title() + ' User', user['email'], user['role'], '0777000000', new_hash))
    
    print(f"✅ Updated {user['email']} with role {user['role']}")

conn.commit()
print("\n✅ All users updated!")

# Show all users
cursor.execute("SELECT staff_id, name, email, role FROM staff ORDER BY role")
print("\n📋 All Staff:")
for row in cursor.fetchall():
    print(f"  {row[0]}: {row[1]} ({row[2]}) - {row[3]}")

cursor.close()
conn.close()
