require('dotenv').config();
const { db } = require('../src/config/firebase');

async function migrateImages() {
  console.log("Iniciando migración de imágenes de Unsplash a Cloudflare R2...");
  const R2_DEFAULT = "https://pub-9e7a27440b204a97b7ddc8deddeb8e95.r2.dev/images/chongo_bajo_pulido.webp";
  
  try {
    const snapshot = await db.collection('services').get();
    let count = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.imageUrl && data.imageUrl.includes('unsplash.com')) {
        console.log(`Migrando documento ${doc.id}: ${data.name}`);
        await db.collection('services').doc(doc.id).update({
          imageUrl: R2_DEFAULT,
          thumbnailUrl: R2_DEFAULT
        });
        count++;
      }
    }

    console.log(`Migración completada. Se actualizaron ${count} documentos.`);
    process.exit(0);
  } catch (e) {
    console.error("Error en migración:", e);
    process.exit(1);
  }
}

migrateImages();
