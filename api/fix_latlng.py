from pymongo import MongoClient

MONGO_URI = 'mongodb+srv://mollericonaisabel1:xS8UDopTzgVJOYXp@appmovilfarmaciav2.mlbpnmp.mongodb.net/'
DB_NAME = 'appMovilFarmacia'

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

farmacias = db['Farmacias'].find()
for f in farmacias:
    lat = f.get('lat')
    lng = f.get('lng')
    update_needed = False
    new_data = {}
    if lat is not None and not isinstance(lat, float):
        try:
            new_data['lat'] = float(lat)
            update_needed = True
        except Exception:
            pass
    if lng is not None and not isinstance(lng, float):
        try:
            new_data['lng'] = float(lng)
            update_needed = True
        except Exception:
            pass
    if update_needed:
        db['Farmacias'].update_one({'_id': f['_id']}, {'$set': new_data})
        print(f"Actualizado: {f.get('nombre', f.get('id', f['_id']))} -> {new_data}")
print("Conversión de lat/lng terminada.")
