const { db } = require('../src/config/firebase');

async function updateDb() {
  console.log('Actualizando Firestore...');
  try {
    const servicesRef = db.collection('services');
    const snapshot = await servicesRef.where('name', '==', 'Trenza Corona Bohemia').get();
    
    if (snapshot.empty) {
      console.log('❌ No se encontró el peinado en la base de datos');
      process.exit(1);
    }
    
    let docId;
    snapshot.forEach(doc => docId = doc.id);
    
    // Suponiendo que el usuario configuró el bucket R2 como público (Custom Domain o .r2.dev)
    // En este caso, dejaremos la URL base para que luego la ajusten si es diferente.
    // Usaremos una variable de entorno o el endpoint directo temporal:
    const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-TU_R2_DEV_AQUI.r2.dev';
    
    await servicesRef.doc(docId).update({
      videoUrl: `${R2_PUBLIC_URL}/corona_bohemia.mp4`,
      tiktokText: '¡El peinado perfecto para tu graduación SÍ existe! ✨🎓 Si buscas un look romántico, elegante y con vibras bohemias, este semirrecogido con media corona trenzada es TODO lo que necesitas.'
    });
    
    console.log(`✅ ¡Éxito! Se actualizó el peinado con el ID ${docId}`);
    process.exit(0);
  } catch(e) {
    console.error('Error:', e);
    process.exit(1);
  }
}
updateDb();
