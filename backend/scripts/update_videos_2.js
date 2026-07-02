const { db } = require('../src/config/firebase');

async function updateDb() {
  console.log('Actualizando Firestore con los 2 nuevos videos...');
  try {
    const servicesRef = db.collection('services');
    
    const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-9e7a27440b204a97b7ddc8deddeb8e95.r2.dev';
    
    const updates = [
      {
        name: 'Ondas de Agua Texturizadas',
        videoUrl: `${R2_PUBLIC_URL}/ondas_de_agua_texturizadas.mp4`,
        tiktokText: 'El movimiento que enamora ✨ Ondas perfectas que duran toda tu fiesta.'
      },
      {
        name: 'Manicura Express Brillante',
        videoUrl: `${R2_PUBLIC_URL}/manicura_express_brillante.mp4`,
        tiktokText: '¡Que tus manos también brillen con el diploma! ✨💅'
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
        videoUrl: update.videoUrl,
        tiktokText: update.tiktokText
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
