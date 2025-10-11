from flask import Flask, jsonify, request, render_template, session, redirect, url_for, flash
from flask_cors import CORS
from dotenv import load_dotenv
import uuid
from chatbot_backend import get_chatbot_response
from functools import wraps
from urllib.parse import quote
import os
import random
import smtplib
from email.mime.text import MIMEText
from pymongo import MongoClient, ASCENDING
from gridfs import GridFS
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta



load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key')
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5 MB upload limit (GridFS backend)
CORS(app)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('user_id'):
            # Redirect to login with next param so we can return after auth
            next_url = request.path
            return redirect(url_for('login') + f"?next={quote(next_url)}")
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        role = session.get('role')
        if not session.get('user_id') or role != 'admin':
            next_url = request.path
            return redirect(url_for('login') + f"?next={quote(next_url)}")
        return f(*args, **kwargs)
    return decorated_function

# --- MongoDB setup ---
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
MONGO_DB_NAME = os.getenv('MONGO_DB_NAME', 'phonestoredb')

try:
    # Add connection timeout to prevent hanging
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000)
    # Test the connection
    mongo_client.admin.command('ping')
    mongo_db = mongo_client.get_database(MONGO_DB_NAME)
    users_col = mongo_db['users']
    print(f"✅ Connected to MongoDB: {MONGO_DB_NAME}")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    print("💡 Make sure MongoDB is running on localhost:27017")
    # Use a fallback or exit gracefully
    mongo_client = None
    mongo_db = None
    users_col = None
products_col = mongo_db['products'] if mongo_db is not None else None
cart_col = mongo_db['cart'] if mongo_db is not None else None
fs = GridFS(mongo_db) if mongo_db is not None else None

# Ensure we have a unique index on email
try:
    users_col.create_index([('email', ASCENDING)], unique=True)
except Exception:
    pass
# Helpful index on role (optional, non-unique)
try:
    users_col.create_index([('role', ASCENDING)], unique=False)
except Exception:
    pass

# Ensure unique index on product id
try:
    products_col.create_index([('id', ASCENDING)], unique=True)
except Exception:
    pass


@app.route('/')
def index():
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
    return render_template('index.html')



@app.route('/login/')
def login():
    return render_template('login.html')

# --- LOGIN API ---
@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json
    email = data.get('email','').strip().lower()
    password = data.get('password','')
    user = users_col.find_one({'email': email})
    if user and user.get('password_hash') and check_password_hash(user['password_hash'], password):
        session['user_id'] = str(user['_id'])
        session['user_email'] = user.get('email')
        session['user_name'] = user.get('name', '')
        session['role'] = user.get('role', 'user')
        return jsonify({'success': True, 'name': user.get('name', ''), 'role': session['role']})
    return jsonify({'success': False, 'message': 'Invalid email or password.'}), 401

# --- LOGOUT API ---
@app.route('/api/logout', methods=['POST'])
def api_logout():
    session.clear()
    return jsonify({'success': True})

# --- REGISTER API ---
@app.route('/api/register', methods=['POST'])
def api_register():
    data = request.json
    name = data.get('name')
    email = data.get('email','').strip().lower()
    password = data.get('password')
    if not name or not email or not password:
        return jsonify({'success': False, 'message': 'All fields are required.'}), 400
    try:
        password_hash = generate_password_hash(password)
        users_col.insert_one({
            'name': name,
            'email': email,
            'password_hash': password_hash,
            'reset_code': None,
            'role': 'user'
        })
        return jsonify({'success': True, 'message': 'Registration successful! You can now log in.'})
    except Exception as e:
        # Likely duplicate email due to unique index
        return jsonify({'success': False, 'message': 'Email already registered.'}), 400

# --- FORGOT PASSWORD API ---
def send_email(to_email, subject, body):
    """Generic email sender with multiple fallback options. Returns True on success.
    If SMTP credentials are not configured, logs to console (dev fallback).
    """
    try:
        SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        FROM_EMAIL = os.getenv('SMTP_FROM_EMAIL')
        FROM_PASSWORD = os.getenv('SMTP_FROM_PASSWORD')
        USE_TLS = os.getenv('SMTP_USE_TLS', 'false').lower() == 'true'

        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = FROM_EMAIL
        msg["To"] = to_email

        # If SMTP creds are not configured, log to console as a fallback
        if not FROM_EMAIL or not FROM_PASSWORD:
            print(f"[DEV] Email to {to_email} | Subject: {subject} | Body: {body}")
            return True

        smtp_configs = [
            {'port': 587, 'use_ssl': False, 'use_tls': True},
            {'port': 465, 'use_ssl': True, 'use_tls': False},
            {'port': 25, 'use_ssl': False, 'use_tls': True},
        ]

        for config in smtp_configs:
            try:
                port = config['port']
                if config['use_ssl']:
                    server = smtplib.SMTP_SSL(SMTP_SERVER, port, timeout=5)
                else:
                    server = smtplib.SMTP(SMTP_SERVER, port, timeout=5)
                    if config['use_tls']:
                        server.starttls()

                server.login(FROM_EMAIL, FROM_PASSWORD)
                server.sendmail(FROM_EMAIL, [to_email], msg.as_string())
                server.quit()
                print(f"✅ Email sent to {to_email} via port {port}")
                return True
            except Exception as port_error:
                print(f"❌ Port {config['port']} failed: {port_error}")
                continue

        print(f"❌ All SMTP ports failed for {to_email}")
        print(f"[DEV] Email to {to_email} | Subject: {subject} | Body: {body}")
        return False

    except Exception as e:
        print(f"❌ Email sending failed: {e}")
        print(f"[DEV] Email to {to_email} | Subject: {subject} | Body: {body}")
        return False


def send_reset_email(to_email, code):
    subject = "Your Password Reset Code"
    body = f"Your verification code is: {code}\n\nThis code will expire in 15 minutes. If you didn't request this, ignore this email." 
    return send_email(to_email, subject, body)


def send_password_changed_email(to_email):
    subject = "Your Password Was Updated"
    body = "Your account password was recently updated. If you did not perform this action, please contact support immediately."
    return send_email(to_email, subject, body)

@app.route('/api/forgot-password', methods=['POST'])
def api_forgot_password():
    try:
        # Check database connection
        # Explicit None check (PyMongo Collection objects do not support truth value testing)
        if users_col is None:
            return jsonify({'success': False, 'message': 'Database not available'}), 500
            
        data = request.json
        email = data.get('email')
        user = users_col.find_one({'email': email})
        if user:
            code = str(random.randint(100000, 999999))
            # expiry 15 minutes from now
            expiry_ts = int((datetime.utcnow() + timedelta(minutes=15)).timestamp())
            users_col.update_one({'_id': user['_id']}, {'$set': {'reset_code': code, 'reset_code_expires': expiry_ts}})
            send_reset_email(email, code)
        return jsonify({'success': True, 'message': 'If your email exists, you will receive a code.'})
    except Exception as e:
        import traceback
        print('ERROR in /api/forgot-password:', traceback.format_exc())  # This will print detailed error in terminal
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/reset-password', methods=['POST'])
def api_reset_password():
    data = request.json
    email = data.get('email')
    code = data.get('code')
    new_password = data.get('newPassword')
    # Validate inputs
    if not email or not code or not new_password:
        return jsonify({'success': False, 'message': 'Missing parameters.'}), 400

    user = users_col.find_one({'email': email})
    if not user or 'reset_code' not in user or not user.get('reset_code'):
        return jsonify({'success': False, 'message': 'Invalid code or email.'}), 400

    # Check code match
    if str(user.get('reset_code')) != str(code):
        return jsonify({'success': False, 'message': 'Invalid verification code.'}), 400

    # Check expiry
    expires_ts = user.get('reset_code_expires')
    if expires_ts:
        if int(datetime.utcnow().timestamp()) > int(expires_ts):
            return jsonify({'success': False, 'message': 'Verification code expired.'}), 400

    # All good, update password
    try:
        users_col.update_one({'_id': user['_id']}, {
            '$set': {
                'password_hash': generate_password_hash(new_password),
            },
            '$unset': {'reset_code': '', 'reset_code_expires': ''}
        })
        # Send notification email (best-effort)
        try:
            send_password_changed_email(email)
        except Exception as e:
            print(f"Warning: failed to send password changed email: {e}")

        return jsonify({'success': True, 'message': 'Password reset successful.'})
    except Exception as e:
        print(f"Error updating password: {e}")
        return jsonify({'success': False, 'message': 'Failed to update password.'}), 500


@app.route('/api/verify-reset-code', methods=['POST'])
def api_verify_reset_code():
    """Verify OTP code without resetting password yet."""
    data = request.json
    email = data.get('email')
    code = data.get('code')
    if not email or not code:
        return jsonify({'success': False, 'message': 'Missing parameters.'}), 400
    user = users_col.find_one({'email': email})
    if not user or not user.get('reset_code'):
        return jsonify({'success': False, 'message': 'Invalid code or email.'}), 400
    if str(user.get('reset_code')) != str(code):
        return jsonify({'success': False, 'message': 'Invalid verification code.'}), 400
    expires_ts = user.get('reset_code_expires')
    if expires_ts and int(datetime.utcnow().timestamp()) > int(expires_ts):
        return jsonify({'success': False, 'message': 'Verification code expired.'}), 400
    return jsonify({'success': True, 'message': 'Code verified. You may reset your password now.'})

@app.route('/api/check-auth')
def check_auth():
    if session.get('user_id'):
        try:
            user = users_col.find_one({'_id': ObjectId(session['user_id'])})
        except Exception:
            user = None
        if user:
            return jsonify({
                'authenticated': True,
                'name': user.get('name', ''),
                'email': user.get('email', ''),
                'role': user.get('role', 'user')
            })
    return jsonify({'authenticated': False})
#end


#--CHATBOT API--
@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    try:
        data = request.get_json()
        message = data.get('message', '')
        
        # Get the session ID from the user's session
        session_id = session.get('session_id', 'default')
        
        # Get response from the chatbot
        response = get_chatbot_response(message, session_id)
        
        return jsonify({'response': response})
    except Exception as e:
        print(f"Error in chatbot endpoint: {e}")
        return jsonify({'response': "Sorry, I'm having trouble processing your request right now."}), 500



# --- PRODUCTS API ---
@app.route('/api/products', methods=['GET'])
def api_products():
    try:
        # Return all products (exclude Mongo _id)
        raw_docs = list(products_col.find({}, {'_id': 0}))
        docs = []
        for d in raw_docs:
            if d.get('image_file_id'):
                d['image_url'] = f"/api/products/{d['id']}/image"
            docs.append(d)
        return jsonify(docs)
    except Exception as e:
        print('ERROR in /api/products:', e)
        return jsonify([]), 500

@app.route('/api/products/<int:pid>/image')
def api_product_image(pid):
    try:
        prod = products_col.find_one({'id': pid})
        if not prod or not prod.get('image_file_id'):
            return ('', 404)
        from bson import ObjectId
        try:
            file_obj = fs.get(ObjectId(prod['image_file_id']))
        except Exception:
            return ('', 404)
        data = file_obj.read()
        mime = file_obj.content_type or 'application/octet-stream'
        return app.response_class(data, mimetype=mime, headers={
            'Cache-Control': 'public, max-age=86400'
        })
    except Exception as e:
        print('ERROR serving product image:', e)
        return ('', 500)


# --- ADMIN PAGE ---
@app.route('/admin/')
@admin_required
def admin():
    return render_template('admin.html')


# --- PRODUCTS CRUD (admin) ---
def _require_admin():
    return bool(session.get('user_id')) and session.get('role') == 'admin'

def _allowed_image(filename: str) -> bool:
    allowed = {'.png', '.jpg', '.jpeg', '.gif', '.webp'}
    _, ext = os.path.splitext(filename.lower())
    return ext in allowed

def _save_image_gridfs(file_storage):
    if not file_storage or file_storage.filename == '':
        return None, 'No file provided'
    if not _allowed_image(file_storage.filename):
        return None, 'Unsupported file type'
    try:
        file_id = fs.put(file_storage.stream.read(), filename=file_storage.filename, contentType=file_storage.mimetype)
        return str(file_id), None
    except Exception as e:
        return None, f'Failed saving file: {e}'

@app.route('/api/products', methods=['POST'])
def api_products_create():
    if not _require_admin():
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401

    # Support JSON (legacy) or multipart form with file
    if request.content_type and 'multipart/form-data' in request.content_type:
        form = request.form
        try:
            pid = int(form.get('id', '').strip())
        except ValueError:
            return jsonify({'success': False, 'message': 'Invalid id'}), 400
        title = (form.get('title') or '').strip()
        price_raw = form.get('price')
        category = (form.get('category') or '').strip()
        if not title or not price_raw or not category:
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        try:
            price = float(price_raw)
        except ValueError:
            return jsonify({'success': False, 'message': 'Invalid price'}), 400
        image_file = request.files.get('imageFile')
        image_file_id, err = _save_image_gridfs(image_file)
        if err:
            return jsonify({'success': False, 'message': err}), 400
        data = {
            'id': pid,
            'title': title,
            'price': price,
            'category': category,
            'image_file_id': image_file_id,
            'description': (form.get('description') or '').strip(),
            'specs': (form.get('specs') or '').strip()
        }
    else:
        data = request.get_json(force=True) or {}
        required = ['id', 'title', 'image', 'price', 'category']
        missing = [k for k in required if k not in data]
        if missing:
            return jsonify({'success': False, 'message': f'Missing fields: {', '.join(missing)}'}), 400
    try:
        products_col.update_one({'id': data['id']}, {'$set': data}, upsert=True)
        return jsonify({'success': True, 'data': {'image_file_id': data.get('image_file_id')}})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/products/<int:pid>', methods=['PUT'])
def api_products_update(pid):
    if not _require_admin():
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401

    existing = products_col.find_one({'id': pid})
    if not existing:
        return jsonify({'success': False, 'message': 'Product not found'}), 404

    if request.content_type and 'multipart/form-data' in request.content_type:
        form = request.form
        title = (form.get('title') or existing.get('title', '')).strip()
        category = (form.get('category') or existing.get('category', '')).strip()
        price_raw = form.get('price', existing.get('price'))
        try:
            price = float(price_raw)
        except ValueError:
            return jsonify({'success': False, 'message': 'Invalid price'}), 400
        image_file = request.files.get('imageFile')
        image_file_id = existing.get('image_file_id')
        if image_file and image_file.filename:
            new_file_id, err = _save_image_gridfs(image_file)
            if err:
                return jsonify({'success': False, 'message': err}), 400
            image_file_id = new_file_id
        data = {
            'title': title,
            'price': price,
            'category': category,
            'image_file_id': image_file_id,
            'description': (form.get('description') or existing.get('description','')).strip(),
            'specs': (form.get('specs') or existing.get('specs','')).strip()
        }
    else:
        data = request.get_json(force=True) or {}
    try:
        products_col.update_one({'id': pid}, {'$set': data}, upsert=False)
        return jsonify({'success': True, 'data': {'image_file_id': data.get('image_file_id')}})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/products/<int:pid>', methods=['DELETE'])
def api_products_delete(pid):
    if not _require_admin():
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    try:
        products_col.delete_one({'id': pid})
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# (admin-login removed; unified to /api/login and /login/)


@app.route('/product/')
def product_index():
    # Keep backward compatibility: redirect to home (use /product/<id> for details)
    return redirect(url_for('index'))


@app.route('/product/<int:pid>')
def product_detail(pid):
    try:
        prod = products_col.find_one({'id': pid}, {'_id': 0})
    except Exception:
        prod = None
    if not prod:
        return render_template('product.html', product=None), 404

    # Provide image_url when using GridFS
    if prod.get('image_file_id'):
        prod['image_url'] = f"/api/products/{pid}/image"

    # Build images list (prefer image_url then image path)
    images = []
    if prod.get('image_url'):
        images.append(prod['image_url'])
    if prod.get('image'):
        img = prod.get('image')
        if isinstance(img, str) and img.startswith('./images/'):
            images.append('/static' + img[1:])
        else:
            images.append(img)
    if not images:
        images.append('/static/images/products/placeholder.png')

    prod['images'] = images
    prod['price'] = float(prod.get('price', 0))
    prod['description'] = prod.get('description', '')
    # Normalize specs: allow stored dict or string (key:value lines or JSON)
    raw_specs = prod.get('specs', '')
    specs_obj = {}
    if isinstance(raw_specs, dict):
        specs_obj = raw_specs
    elif isinstance(raw_specs, str) and raw_specs.strip():
        # try JSON
        try:
            import json
            parsed = json.loads(raw_specs)
            if isinstance(parsed, dict):
                specs_obj = parsed
            else:
                specs_obj = {}
        except Exception:
            # parse key:value lines
            for line in raw_specs.splitlines():
                if ':' in line:
                    k, v = line.split(':', 1)
                    specs_obj[k.strip()] = v.strip()
    prod['specs'] = specs_obj

    return render_template('product.html', product=prod)

@app.route('/cart/')
@login_required
def cart():
    return render_template('cart.html')
 

# --- USER DASHBOARD PAGE ---
@app.route('/user-dashboard/')
@login_required
def user_dashboard():
    return render_template('user_dashboard.html')


# --- CART API ENDPOINTS ---
@app.route('/api/cart/add', methods=['POST'])
def api_cart_add():
    try:
        # Require authenticated user for cart actions
        if not session.get('user_id'):
            return jsonify({'success': False, 'message': 'Authentication required'}), 401
        data = request.get_json()
        product_id = data.get('product_id')
        quantity = int(data.get('quantity', 1))
        
        if not product_id:
            return jsonify({'success': False, 'message': 'Product ID required'}), 400
        
        # Get product details
        product = products_col.find_one({'id': product_id}, {'_id': 0})
        if not product:
            return jsonify({'success': False, 'message': 'Product not found'}), 404
        
        # Get user identifier (session_id for guests, user_id for logged in)
        user_identifier = session.get('user_id') if session.get('user_id') else session.get('session_id')
        if not user_identifier:
            session['session_id'] = str(uuid.uuid4())
            user_identifier = session['session_id']
        
        # Check if item already in cart
        existing_item = cart_col.find_one({
            'user_identifier': user_identifier,
            'product_id': product_id
        })
        
        if existing_item:
            # Update quantity
            new_quantity = existing_item['quantity'] + quantity
            cart_col.update_one(
                {'_id': existing_item['_id']},
                {'$set': {'quantity': new_quantity}}
            )
        else:
            # Add new item
            cart_item = {
                'user_identifier': user_identifier,
                'product_id': product_id,
                    'product_title': product.get('title', ''),
                    # Prefer image_url (GridFS) then image field then placeholder
                    'product_image': product.get('image_url') or product.get('image') or '/static/images/products/placeholder.png',
                    'product_price': float(product.get('price', 0)),
                'quantity': quantity,
                'added_at': ObjectId().generation_time
            }
            cart_col.insert_one(cart_item)
        
        # Get updated cart count
        cart_count = cart_col.count_documents({'user_identifier': user_identifier})
        
        return jsonify({
            'success': True,
            'message': f'{product["title"]} added to cart!',
            'cart_count': cart_count
        })
        
    except Exception as e:
        print(f"Error adding to cart: {e}")
        return jsonify({'success': False, 'message': 'Failed to add item to cart'}), 500


@app.route('/api/cart/get', methods=['GET'])
def api_cart_get():
    try:
        # Require authenticated user for cart count/display: unauthenticated users should see 0
        if not session.get('user_id'):
            return jsonify({'cart_items': [], 'total': 0, 'count': 0}), 401
        user_identifier = session.get('user_id') if session.get('user_id') else session.get('session_id')
        if not user_identifier:
            return jsonify({'cart_items': [], 'total': 0, 'count': 0})
        
        # Get cart items
        cart_items = list(cart_col.find(
            {'user_identifier': user_identifier},
            {'_id': 0}
        ))
        
        # Calculate total
        total = sum(item['product_price'] * item['quantity'] for item in cart_items)
        count = len(cart_items)
        
        return jsonify({
            'cart_items': cart_items,
            'total': round(total, 2),
            'count': count
        })
        
    except Exception as e:
        print(f"Error getting cart: {e}")
        return jsonify({'cart_items': [], 'total': 0, 'count': 0}), 500


@app.route('/api/cart/update', methods=['POST'])
def api_cart_update():
    try:
        # Require authenticated user for cart actions
        if not session.get('user_id'):
            return jsonify({'success': False, 'message': 'Authentication required'}), 401
        data = request.get_json()
        product_id = data.get('product_id')
        quantity = int(data.get('quantity', 1))
        
        if not product_id or quantity < 1:
            return jsonify({'success': False, 'message': 'Invalid data'}), 400
        
        user_identifier = session.get('user_id') if session.get('user_id') else session.get('session_id')
        if not user_identifier:
            return jsonify({'success': False, 'message': 'Session not found'}), 400
        
        # Update quantity
        result = cart_col.update_one(
            {'user_identifier': user_identifier, 'product_id': product_id},
            {'$set': {'quantity': quantity}}
        )
        
        if result.matched_count == 0:
            return jsonify({'success': False, 'message': 'Item not found in cart'}), 404
        
        # Get updated cart info
        cart_items = list(cart_col.find({'user_identifier': user_identifier}, {'_id': 0}))
        total = sum(item['product_price'] * item['quantity'] for item in cart_items)
        count = len(cart_items)
        
        return jsonify({
            'success': True,
            'total': round(total, 2),
            'count': count
        })
        
    except Exception as e:
        print(f"Error updating cart: {e}")
        return jsonify({'success': False, 'message': 'Failed to update cart'}), 500


@app.route('/api/cart/remove', methods=['POST'])
def api_cart_remove():
    try:
        # Require authenticated user for cart actions
        if not session.get('user_id'):
            return jsonify({'success': False, 'message': 'Authentication required'}), 401
        data = request.get_json()
        product_id = data.get('product_id')
        
        if not product_id:
            return jsonify({'success': False, 'message': 'Product ID required'}), 400
        
        user_identifier = session.get('user_id') if session.get('user_id') else session.get('session_id')
        if not user_identifier:
            return jsonify({'success': False, 'message': 'Session not found'}), 400
        
        # Remove item
        result = cart_col.delete_one({
            'user_identifier': user_identifier,
            'product_id': product_id
        })
        
        if result.deleted_count == 0:
            return jsonify({'success': False, 'message': 'Item not found in cart'}), 404
        
        # Get updated cart info
        cart_items = list(cart_col.find({'user_identifier': user_identifier}, {'_id': 0}))
        total = sum(item['product_price'] * item['quantity'] for item in cart_items)
        count = len(cart_items)
        
        return jsonify({
            'success': True,
            'message': 'Item removed from cart',
            'total': round(total, 2),
            'count': count
        })
        
    except Exception as e:
        print(f"Error removing from cart: {e}")
        return jsonify({'success': False, 'message': 'Failed to remove item'}), 500


@app.route('/api/cart/clear', methods=['POST'])
def api_cart_clear():
    try:
        # Require authenticated user for cart actions
        if not session.get('user_id'):
            return jsonify({'success': False, 'message': 'Authentication required'}), 401
        user_identifier = session.get('user_id') if session.get('user_id') else session.get('session_id')
        if not user_identifier:
            return jsonify({'success': False, 'message': 'Session not found'}), 400
        
        # Clear all cart items
        cart_col.delete_many({'user_identifier': user_identifier})
        
        return jsonify({
            'success': True,
            'message': 'Cart cleared',
            'total': 0,
            'count': 0
        })
        
    except Exception as e:
        print(f"Error clearing cart: {e}")
        return jsonify({'success': False, 'message': 'Failed to clear cart'}), 500


if __name__ == '__main__':
    print("🚀 Starting Flask application...")
    try:
        app.run(host='0.0.0.0', port=5000, threaded=True)
    except Exception as e:
        print(f"❌ Failed to start Flask app: {e}")
        print("💡 Try running with: python -m flask run --host=0.0.0.0 --port=5000")
