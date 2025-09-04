from flask import Flask, jsonify, request, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


#@app.route('/api/products', methods=['GET'])
#def get_products():
    # Example static data, replace with DB query later
    #products = [
     #   {"id": 1, "name": "Apple iPhone 11", "price": 750, "image": "images/products/iPhone/iphone6.jpeg"},
      #  {"id": 2, "name": "Samsung Galaxy", "price": 900, "image": "images/products/sumsung/samsung5.jpeg"},
        # ...add more products as needed...
    #]
    #return jsonify(products)

#@app.route('/api/login', methods=['POST'])
#def login():
 #   data = request.json
    # Dummy login logic
  #  if data.get('email') == 'test@example.com' and data.get('password') == 'password':
   #     return jsonify({"success": True, "token": "dummy-token"})
    #return jsonify({"success": False}), 401

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/cart/')
def cart():
    return render_template('cart.html')

@app.route('/product/')
def product():
    return render_template('product.html')
# ...add more routes for cart, orders, etc...


if __name__ == '__main__':
    app.run(debug=True)
