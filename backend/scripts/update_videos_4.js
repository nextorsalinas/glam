const { db } = require('../src/config/firebase');

async function updateDb() {
  console.log('Actualizando Firestore con los 4 nuevos videos...');
  try {
    const servicesRef = db.collection('services');
    
    const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-9e7a27440b204a97b7ddc8deddeb8e95.r2.dev';
    
    const updates = [
      {
        name: "Maquillaje 'No-Makeup' Glow",
        videoUrl: `${R2_PUBLIC_URL}/maquillaje_'no-makeup'_glow.mp4`
      },
      {
        name: "Ondas Surferas (Beach Waves)",
        videoUrl: `${R2_PUBLIC_URL}/ondas_surferas.mp4`
      },
      {
        name: "Recogido Bajo Minimalista",
        videoUrl: `${R2_PUBLIC_URL}/recogido_bajo_minimalista.mp4`
      },
      {
        name: "Trenza Boxeadora Elegante (Bubble Braids)",
        videoUrl: `${R2_PUBLIC_URL}/trenza_boxeadora_elegante.mp4`
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
