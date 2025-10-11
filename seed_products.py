import json
import os
from pymongo import MongoClient, ASCENDING


def main():
    # Resolve data path relative to this file, with fallback to parent directory
    here = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(here, 'data', 'products.json'),
        os.path.join(os.path.dirname(here), 'data', 'products.json')
    ]
    data_path = next((p for p in candidates if os.path.exists(p)), None)
    if not data_path:
        raise FileNotFoundError(
            f"Could not find data/products.json. Tried: {candidates}. "
            f"Ensure products.json exists under the project's data folder."
        )

    with open(data_path, 'r', encoding='utf-8') as f:
        payload = json.load(f)

    products = payload.get('products', [])
    if not isinstance(products, list):
        raise ValueError('products.json format invalid: "products" should be a list')

    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
    db_name = os.getenv('MONGO_DB_NAME', 'phonestoredb')

    client = MongoClient(mongo_uri)
    db = client.get_database(db_name)
    col = db['products']

    # Ensure unique index on id
    try:
        col.create_index([('id', ASCENDING)], unique=True)
    except Exception:
        pass

    # Upsert by id
    upserts = 0
    for p in products:
        if 'id' not in p:
            continue
        col.update_one({'id': p['id']}, {'$set': p}, upsert=True)
        upserts += 1

    print(f'Seeded {upserts} products into MongoDB database "{db_name}" collection "products"')


if __name__ == '__main__':
    main()
