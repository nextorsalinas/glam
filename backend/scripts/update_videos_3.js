const { db } = require('../src/config/firebase');

async function updateDb() {
  console.log('Actualizando Firestore con los 3 nuevos videos...');
  try {
    const servicesRef = db.collection('services');
    
    const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-9e7a27440b204a97b7ddc8deddeb8e95.r2.dev';
    
    const updates = [
      {
        name: 'Semirecogido con Lazo de Terciopelo',
        videoUrl: `${R2_PUBLIC_URL}/semirecogido_con_lazo_de_terciopelo.mp4`
      },
      {
        name: 'Coleta Alta con Volumen (Ponytail Glam)',
        videoUrl: `${R2_PUBLIC_URL}/ponytail_glam.mp4`
      },
      {
        name: 'Recogido Alto Despeinado (Messy Bun)',
        videoUrl: `${R2_PUBLIC_URL}/recogido_alto_despeinado.mp4`
      }
    ];

    for (const update of updates) {
      const snapshot = await servicesRef.where('name', '==', update.name).get();
      if (snapshot.empty) {
        console.log(`❌ No se encontró: ${update.name}`);
        continue;
      }
      let docId;
      snapshot.forEach(doc => docId = doc.id);
      
      await servicesRef.doc(docId).update({
        videoUrl: update.videoUrl
      });
      console.log(`✅ ¡Éxito! Se actualizó ${update.name} con ID ${docId}`);
    }
    
    process.exit(0);
  } catch(e) {
    console.error('Error:', e);
    process.exit(1);
  }
}
updateDb();
