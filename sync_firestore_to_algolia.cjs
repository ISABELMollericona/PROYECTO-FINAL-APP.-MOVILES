const admin = require('firebase-admin');
const algoliasearch = require('algoliasearch/builds/algoliasearch-nodejs.umd.js');

// Configura tu Firebase
const serviceAccount = require('./app-movil-farmacia-v2-firebase-adminsdk-fbsvc-702815dc65.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Configura Algolia
const ALGOLIA_APP_ID = 'KCQ3G7A878';
const ALGOLIA_ADMIN_KEY = '4deb9879504f63d03d7bd4bed68631c9'; // Reemplaza por tu Admin API Key de Algolia
const ALGOLIA_INDEX = 'productos';

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const index = client.initIndex(ALGOLIA_INDEX);

async function syncProductos() {
  const productosRef = db.collection('Productos');
  const snapshot = await productosRef.get();

  const productos = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    productos.push({
      objectID: doc.id,
      Nombre: data.Nombre,
      Accion_Terapéutica: data.Acción_Terapéutica,
      Marca: data.Marca,
      Codigo_Barras: data.Codigo_Barras,
      Principio_Activo: data.Principio_Activo,
      id: data.id
    });
  });

  index.saveObjects(productos)
    .then(() => {
      console.log('¡Sincronización completa!');
    })
    .catch(err => {
      console.error('Error al subir a Algolia:', err);
    });
}

syncProductos();
