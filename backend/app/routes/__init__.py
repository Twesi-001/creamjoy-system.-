from flask import Blueprint

api_bp = Blueprint('api', __name__, url_prefix='/api')

from . import auth, batches, products,raw_materials,suppliers, orders, deliveries, inventory, customers, expenditures, credit_accounts
from . import test 