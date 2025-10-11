from app import app

client = app.test_client()

resp = client.get('/api/products')
print('GET /api/products', resp.status_code)
try:
    j = resp.get_json()
    if isinstance(j, list):
        print('Products count:', len(j))
        print('First 2 items:', j[:2])
    else:
        print('Response JSON:', j)
except Exception as e:
    print('Could not parse JSON:', e)

resp2 = client.get('/product/1')
print('\nGET /product/1', resp2.status_code)
print('Content-Type:', resp2.content_type)
print('Length HTML:', len(resp2.get_data(as_text=True)))

resp3 = client.get('/api/cart/get')
print('\nGET /api/cart/get', resp3.status_code)
try:
    print('Body JSON:', resp3.get_json())
except Exception as e:
    print('Could not parse JSON:', e)
