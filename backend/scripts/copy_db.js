const { Firestore } = require('@google-cloud/firestore');

const sourceDb = new Firestore({
  projectId: 'glam-graduacion-ai',
  databaseId: 'glam-database',
});

const targetDb = new Firestore({
  projectId: 'alexandra-styles',
});

async function copyCollection() {
  console.log('Copiando servicios desde glam-graduacion-ai/glam-database a alexandra-styles/(default)...');
  try {
    const srcSnapshot = await sourceDb.collection('services').get();
    console.log(`Encontrados ${srcSnapshot.size} servicios en origen.`);

    const batch = targetDb.batch();
    srcSnapshot.forEach(doc => {
      const data = doc.data();
      const targetDocRef = targetDb.collection('services').doc(doc.id);
      batch.set(targetDocRef, data);
      console.log(`Preparando copia de: ${data.name || doc.id}`);
    });

    await batch.commit();
    console.log('¡Copia completada con éxito!');
    process.exit(0);
  } catch (error) {
    console.error('Error al copiar:', error);
    process.exit(1);
  }
}

copyCollection();
