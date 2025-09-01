

let client: any = null;
async function getClient() {
  if (client) return client;
  const algoliasearchModule = await import('algoliasearch/lite');
  const algoliasearch = (algoliasearchModule as any).default || algoliasearchModule;
  client = algoliasearch("KCQ3G7A878", "987de33c2132090de80cb478c9990bce");
  return client;
}

export const searchMedicamento = async (query: string) => {
  const client = await getClient();
  const index = client.initIndex("productos");
  const result = await index.search(query);
  return result.hits;
};

export const buscarFarmacias = async (query: string) => {
  const client = await getClient();
  const index = client.initIndex("farmacias"); // Cambia si tu índice tiene otro nombre
  const result = await index.search(query, {
    hitsPerPage: 10,
    // Puedes agregar filtros, por ejemplo: 'abierta:true'
  });
  return result.hits;
};
