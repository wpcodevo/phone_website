from pymongo import MongoClient
import os

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
MONGO_DB_NAME = os.getenv('MONGO_DB_NAME', 'phonestoredb')

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    db = client.get_database(MONGO_DB_NAME)
    users = db['users']
    
    user_count = users.count_documents({})
    print(f'✅ MongoDB connection successful')
    print(f'📊 Total users in database: {user_count}')
    
    if user_count > 0:
        print('\n👥 Users in database:')
        for i, user in enumerate(users.find(), 1):
            name = user.get('name', 'N/A')
            email = user.get('email', 'N/A')
            role = user.get('role', 'user')
            print(f'  {i}. {name} ({email}) - Role: {role}')
    else:
        print('\n⚠️  No users found in database')
        print('💡 You can create an admin user by running: python create_admin.py')
        
except Exception as e:
    print(f'❌ MongoDB connection failed: {e}')
    print('💡 Make sure MongoDB is running on localhost:27017')