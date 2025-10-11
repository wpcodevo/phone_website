from app import app, mongo_db
from bson.objectid import ObjectId
import json

# Use Flask test client
app.testing = True
client = app.test_client()

# 1) Insert a test product
products = mongo_db['products']
prod = {
    'id': 9999,
    'title': 'TEST PRODUCT E2E',
    'price': 19.99,
    'category': 'Featured Products',
    'image': './images/products/placeholder.png',
    'description': 'This is a test product created by automated test.',
    'specs': 'RAM: 4GB\nStorage: 64GB\nColor: Black'
}
products.update_one({'id': prod['id']}, {'$set': prod}, upsert=True)
print('Inserted/updated product id', prod['id'])

# 2) GET product page
resp = client.get(f"/product/{prod['id']}")
print('/product/<id> status', resp.status_code)
print('Page length', len(resp.get_data(as_text=True)))

# 3) Create a test user and login via session
users = mongo_db['users']
user = users.find_one({'email': 'e2e_test@example.com'})
if not user:
    res = users.insert_one({'name': 'E2E Test', 'email': 'e2e_test@example.com', 'password_hash': 'x', 'role': 'user'})
    user = users.find_one({'_id': res.inserted_id})

with client.session_transaction() as sess:
    sess['user_id'] = str(user['_id'])
    sess['user_email'] = user.get('email')
    sess['role'] = 'user'

# 4) Add to cart
resp2 = client.post('/api/cart/add', json={'product_id': prod['id'], 'quantity': 2})
print('/api/cart/add', resp2.status_code, resp2.get_json())

# 5) Get cart
resp3 = client.get('/api/cart/get')
print('/api/cart/get', resp3.status_code, resp3.get_json())

# Cleanup: remove test product and cart items
mongo_db['cart'].delete_many({'product_id': prod['id']})
products.delete_one({'id': prod['id']})
print('Cleanup done')
