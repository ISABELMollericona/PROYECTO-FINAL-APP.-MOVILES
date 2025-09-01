// Backend Express para exponer datos de MongoDB
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(cors());

const MONGO_URI = 'mongodb+srv://mollericonaisabel1:xS8UDopTzgVJOYXp@appmovilfarmaciav2.mlbpnmp.mongodb.net/';
const DB_NAME = 'appMovilFarmacia'; // Cambia si tu base tiene otro nombre

let db;

MongoClient.connect(MONGO_URI, { useUnifiedTopology: true })
  .then(client => {
    db = client.db(DB_NAME);
    app.listen(4000, () => console.log('API escuchando en http://localhost:4000'));
  })
  .catch(err => console.error('Error conectando a MongoDB:', err));

// Obtener todas las farmacias
app.get('/farmacias', async (req, res) => {
  try {
    const farmacias = await db.collection('Farmacias').find().toArray();
    res.json(farmacias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener todos los productos
app.get('/productos', async (req, res) => {
  try {
    const productos = await db.collection('Productos').find().toArray();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener stock y precio de productos por farmacia
app.get('/farmacia_productos', async (req, res) => {
  try {
    const items = await db.collection('Farmacia_productos').find().toArray();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar productos por cualquier campo (evaluar todos los campos del documento)
app.get('/buscar_productos', async (req, res) => {
  const q = req.query.q || '';
  try {
    const productos = await db.collection('Productos').find({
      $expr: {
        $gt: [
          {
            $size: {
              $filter: {
                input: { $objectToArray: '$$ROOT' },
                as: 'kv',
                cond: {
                  $regexMatch: {
                    input: { $toString: '$$kv.v' },
                    regex: q,
                    options: 'i'
                  }
                }
              }
            }
          },
          0
        ]
      }
    }).toArray();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
