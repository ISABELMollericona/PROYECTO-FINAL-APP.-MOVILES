from pymongo import MongoClient
import ast

MONGO_URI = 'mongodb+srv://mollericonaisabel1:xS8UDopTzgVJOYXp@appmovilfarmaciav2.mlbpnmp.mongodb.net/'
DB_NAME = 'appMovilFarmacia'

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

farmacias = db['Farmacias'].find()
for f in farmacias:
    turno = f.get('turno')
    if turno and isinstance(turno, str):
        try:
            # Convierte el string a dict
            turno_obj = ast.literal_eval(turno)
            if isinstance(turno_obj, dict):
                db['Farmacias'].update_one({'_id': f['_id']}, {'$set': {'turno': turno_obj}})
                print(f"Actualizado: {f.get('nombre', f.get('id', f['_id']))}")
        except Exception as e:
            print(f"Error con {f.get('nombre', f.get('id', f['_id']))}: {e}")
print("Corrección terminada.")
