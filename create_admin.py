import os
from getpass import getpass
from pymongo import MongoClient
from werkzeug.security import generate_password_hash

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
MONGO_DB_NAME = os.getenv('MONGO_DB_NAME', 'phonestoredb')


def main():
    print('Create or update an admin user')
    email = input('Admin email: ').strip().lower()
    name = input('Admin name: ').strip()
    password = getpass('Admin password: ')

    client = MongoClient(MONGO_URI)
    db = client.get_database(MONGO_DB_NAME)
    users = db['users']

    password_hash = generate_password_hash(password)
    users.update_one(
        {'email': email},
        {'$set': {
            'name': name,
            'email': email,
            'password_hash': password_hash,
            'role': 'admin',
            'reset_code': None
        }},
        upsert=True
    )
    print(f'Admin user {email} created/updated successfully.')


if __name__ == '__main__':
    main()
