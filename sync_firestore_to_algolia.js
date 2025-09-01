import fs from 'fs';
import admin from 'firebase-admin';
import algoliasearch from 'algoliasearch';

const serviceAccount = JSON.parse(
  fs.readFileSync('./app-movil-farmacia-v2-firebase-adminsdk-fbsvc-702815dc65.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const ALGOLIA_APP_ID = 'KCQ3G7A878';
const ALGOLIA_ADMIN_KEY = '4deb9879504f63d03d7bd4bed68631c9';
const ALGOLIA_INDEX_PRODUCTOS = 'productos';
const ALGOLIA_INDEX_FARMACIA_PRODUCTOS = 'farmacia_productos';

async function syncProductos() {
  const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
  const index = client.initIndex(ALGOLIA_INDEX_PRODUCTOS);

  const productosRef = db.collection('Productos');
  const snapshot = await productosRef.get();

  const productos = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    productos.push({
      objectID: doc.id,
      Nombre: data.Nombre,
      Accion_Terapéutica: data.Acción_Terapéutica,
      Marca: data.Marca,
      Codigo_Barras: data.Codigo_Barras,
      Principio_Activo: data.Principio_Activo,
      id: data.id,
    });
  });

  await index.saveObjects(productos);
  console.log('¡Sincronización completa de productos!');
}

async function syncFarmaciaProductos() {
  const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
  const index = client.initIndex(ALGOLIA_INDEX_FARMACIA_PRODUCTOS);

  const farmaciaProductosRef = db.collection('Farmacia_productos');
  const snapshot = await farmaciaProductosRef.get();

  if (snapshot.empty) {
    console.log('No hay documentos en la colección Farmacia_productos. Nada que sincronizar.');
    return;
  }

  const farmaciaProductos = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    farmaciaProductos.push({
      objectID: doc.id,
      farmacia_id: data.farmacia_id,
      producto_id: data.producto_id,
      precio: data.precio,
      stock: data.stock
    });
  });

  await index.saveObjects(farmaciaProductos);
  console.log('¡Sincronización completa de Farmacia_productos!');
}

syncProductos();
syncFarmaciaProductos();
