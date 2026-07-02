const { db } = require('../src/config/firebase');

async function verifyDatabase() {
  console.log('Validando colecciones en glam-database...\n');
  try {
    const servicesRef = db.collection('services');
    const snapshot = await servicesRef.get();
    
    if (snapshot.empty) {
      console.log('❌ La colección "services" está vacía o no existe.');
      return;
    }
    
    console.log(`✅ Colección "services" encontrada con ${snapshot.size} documentos.`);
    console.log('Listando algunos peinados para comprobar:\n');
    
    let count = 0;
    snapshot.forEach(doc => {
      if (count < 3) {
        const data = doc.data();
        console.log(`- [${doc.id}] ${data.name} ($${data.price}) - ${data.category}`);
      }
      count++;
    });
    
    if (snapshot.size > 3) {
      console.log(`  ... y ${snapshot.size - 3} más.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al acceder a la base de datos:', error);
    process.exit(1);
  }
}

verifyDatabase();
