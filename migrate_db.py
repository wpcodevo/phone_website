import os
from pymongo import MongoClient, ASCENDING

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
MONGO_DB_NAME = os.getenv('MONGO_DB_NAME', 'phonestoredb')

client = MongoClient(MONGO_URI)
db = client.get_database(MONGO_DB_NAME)
users = db['users']
products = db['products']


def ensure_indexes():
    print('Ensuring indexes...')
    try:
        users.create_index([('email', ASCENDING)], unique=True)
        users.create_index([('role', ASCENDING)], unique=False)
        products.create_index([('id', ASCENDING)], unique=True)
        print('Indexes ensured.')
    except Exception as e:
        print('Index ensure warning:', e)


def normalize_user_emails_and_roles():
    print('Normalizing user emails and roles...')
    updated = 0
    for u in users.find({}):
        updates = {}
        # Lowercase and strip emails
        email = (u.get('email') or '').strip()
        if email and email != email.lower():
            updates['email'] = email.lower()
        # Backfill missing roles to 'user'
        if not u.get('role'):
            updates['role'] = 'user'
        if updates:
            users.update_one({'_id': u['_id']}, {'$set': updates})
            updated += 1
    print(f'Users normalized: {updated}')


def clean_products():
    print('Cleaning product fields...')
    cleaned = 0
    for p in products.find({}):
        updates = {}
        # Ensure id is int
        try:
            if isinstance(p.get('id'), str) and p['id'].isdigit():
                updates['id'] = int(p['id'])
        except Exception:
            pass
        # Ensure required fields exist
        for key in ['title', 'image', 'price', 'category']:
            if key not in p:
                updates[key] = '' if key in ('title', 'image', 'category') else 0
        if updates:
            products.update_one({'_id': p['_id']}, {'$set': updates})
            cleaned += 1
    print(f'Products cleaned: {cleaned}')


def main():
    ensure_indexes()
    normalize_user_emails_and_roles()
    clean_products()
    print('Migration complete.')


if __name__ == '__main__':
    main()
