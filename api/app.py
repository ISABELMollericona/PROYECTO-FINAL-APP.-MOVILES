from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import re

app = Flask(__name__)
CORS(app)

MONGO_URI = 'mongodb+srv://mollericonaisabel1:xS8UDopTzgVJOYXp@appmovilfarmaciav2.mlbpnmp.mongodb.net/'
DB_NAME = 'appMovilFarmacia'

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

@app.route('/farmacias', methods=['GET'])
def get_farmacias():
    farmacias = list(db['Farmacias'].find())
    for f in farmacias:
        f['_id'] = str(f['_id'])
    return jsonify(farmacias)

@app.route('/productos', methods=['GET'])
def get_productos():
    productos = list(db['productos'].find())
    for p in productos:
        p['_id'] = str(p['_id'])
    return jsonify(productos)

@app.route('/farmacia_productos', methods=['GET'])
def get_farmacia_productos():
    items = list(db['farmacias_productos'].find())
    for i in items:
        i['_id'] = str(i['_id'])
    return jsonify(items)

@app.route('/buscar_productos', methods=['GET'])
def buscar_productos():
    q = request.args.get('q', '')
    if not q:
        return jsonify([])
    # Buscar en todos los campos
    regex = re.compile(re.escape(q), re.IGNORECASE)
    productos = list(db['productos'].find({
        "$or": [
            {k: regex} for k in [
                'Nombre', 'Marca', 'Codigo_Barras', 'Principio_Activo', 'Accion_Terapéutica',
                'nombre', 'marca', 'codigo_barras', 'principio_activo', 'accion_terapeutica'
            ]
        ]
    }))
    # Si no hay resultados, buscar en todos los campos del documento
    if not productos:
        productos = []
    for prod in db['productos'].find():
            if any(q.lower() in str(v).lower() for v in prod.values()):
                prod['_id'] = str(prod['_id'])
                productos.append(prod)
    else:
        for p in productos:
            p['_id'] = str(p['_id'])
    return jsonify(productos)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000, debug=True)
