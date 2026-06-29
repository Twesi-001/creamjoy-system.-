from flask import Blueprint

api_bp = Blueprint('api', __name__, url_prefix='/api')

from . import auth
from . import batches
from . import products
from . import raw_materials
from . import suppliers
from . import orders
from . import deliveries
from . import inventory
from . import customers
from . import expenditures
from . import credit_accounts
from . import admin
from . import test
from . import password  

print("✅ All routes registered!")
