require('dotenv').config();
const { db } = require('../src/config/firebase');

async function run() {
  const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-9e7a27440b204a97b7ddc8deddeb8e95.r2.dev';
  const servicesRef = db.collection('services');

  console.log("Iniciando inserción de videos externos sin descripción...");

  for (let i = 1; i <= 11; i++) {
    const filename = `1 (${i}).mp4`;
    const s3Key = 'videos/externos/' + filename.replace(/ /g, '_').toLowerCase();
    const videoUrl = `${R2_PUBLIC_URL}/${s3Key}`;
    
    // Asignamos un nombre interno para la llave, pero lo dejamos vacío o genérico para la UI
    // Si dejamos name vacío, no aparecerá título.
    const name = ``; 

    try {
      // Usaremos un ID predecible para no duplicarlos si se corre de nuevo
      const docId = `video_externo_${i}`;
      await servicesRef.doc(docId).set({
        name: name,
        tiktokText: "",
        videoUrl: videoUrl,
        imageUrl: "", // Podríamos dejarlo vacío o generar thumbnail después
        thumbnailUrl: "" 
      }, { merge: true });

      console.log(`✅ Agregado video a la base de datos: ${videoUrl}`);
    } catch(e) {
      console.error(`❌ Error con video ${i}:`, e.message);
    }
  }
  
  console.log("\nCompletado.");
  process.exit(0);
}

run();
