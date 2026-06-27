
from werkzeug.security import check_password_hash

# The hash from your database
hash_from_db = 'scrypt:32768:8:1$K9x7XpRf$e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'

# The password you're trying
password = 'admin123'

# Check if they match
result = check_password_hash(hash_from_db, password)
print(f"Password match: {result}")

# Also test with a wrong password
wrong = 'wrongpassword'
result2 = check_password_hash(hash_from_db, wrong)
print(f"Wrong password match: {result2}")
