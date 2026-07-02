require('dotenv').config();
const { db } = require('../src/config/firebase');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function run() {
  console.log("Iniciando procesamiento de 5 NUEVAS imágenes (Subida + Optimización + Firestore)...");
  
  // Forzar proyecto correcto si no está en .env
  const PROJECT_ID = "alexandra-styles";
  process.env.FIREBASE_PROJECT_ID = PROJECT_ID;

  try {
    const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-9e7a27440b204a97b7ddc8deddeb8e95.r2.dev';
    const baseImagenesDir = path.join(__dirname, '..', '..', 'imagenes');
    const junioImagenesDir = path.join(baseImagenesDir, 'glam-images');
    const cloudflareMcpDir = path.join(__dirname, '..', '..', 'cloudflare-mcp');

    // Lista de las 5 nuevas imágenes detectadas físicamente
    const newImages = [
      { name: "Cascada Floral de Cristal", description: "Espectacular semirrecogido con delicadas flores de cristal entrelazadas en una cascada de rizos definidos." },
      { name: "Corona Trenzada de Cristal", description: "Elegante corona elaborada con trenzas artesanales y detalles de cristales brillantes, ideal para eventos de gala." },
      { name: "Moño Imperial de Cristal", description: "Recogido alto de gran volumen con estructura imperial, realzado por un tocado de cristales que aporta luz y elegancia." },
      { name: "Ondas Angelicales de Cristal", description: "Suaves ondas angelicales con un brillo sutil, complementadas con accesorios de cristal para un look romántico y puro." },
      { name: "Ondas de Honor Celestial", description: "Peinado de ondas profundas y definidas con un acabado celestial, perfecto para damas de honor y ocasiones especiales." }
    ];

    const servicesRef = db.collection('services');

    for (const item of newImages) {
      const { name, description } = item;
      const originalPngPath = path.join(junioImagenesDir, `${name}.png`);

      if (!fs.existsSync(originalPngPath)) {
        console.log(`⚠️ Archivo ${name}.png no encontrado. Saltando...`);
        continue;
      }

      console.log(`\n--- Procesando: ${name} ---`);

      // 1. Normalizar nombre para URL
      const cleanName = name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ñ/g, "n")
        .replace(/Ñ/g, "N")
        .replace(/ /g, '_')
        .toLowerCase();

      const webpFileName = `${cleanName}.webp`;
      const thumbFileName = `${cleanName}_thumb.webp`;
      const webpFilePath = path.join(baseImagenesDir, webpFileName);
      const thumbFilePath = path.join(baseImagenesDir, thumbFileName);

      // 2. Optimizar a WebP
      console.log("Optimización WebP...");
      await sharp(originalPngPath)
        .resize({ width: 1080, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(webpFilePath);
        
      await sharp(originalPngPath)
        .resize({ width: 400, withoutEnlargement: true })
        .webp({ quality: 60 })
        .toFile(thumbFilePath);

      // 3. Subir a Cloudflare R2
      console.log("Subiendo a Cloudflare...");
      const s3KeyMain = `images/${webpFileName}`;
      const s3KeyThumb = `images/${thumbFileName}`;
      
      execSync(`node upload_image.js "${webpFileName}" "${s3KeyMain}"`, { cwd: cloudflareMcpDir, stdio: 'inherit' });
      execSync(`node upload_image.js "${thumbFileName}" "${s3KeyThumb}"`, { cwd: cloudflareMcpDir, stdio: 'inherit' });

      // 4. Actualizar Firestore en 'alexandra-styles'
      console.log("Actualizando Firestore...");
      const imageUrl = `${R2_PUBLIC_URL}/${s3KeyMain}`;
      const thumbnailUrl = `${R2_PUBLIC_URL}/${s3KeyThumb}`;

      const snapshot = await servicesRef.where('name', '==', name).get();
      if (snapshot.empty) {
        await servicesRef.add({
          name,
          description,
          tiktokText: description,
          imageUrl,
          thumbnailUrl,
          category: 'peinado',
          price: 600,
          duration: 60,
          updatedAt: new Date()
        });
        console.log(`✅ Agregado: ${name}`);
      } else {
        let docId;
        snapshot.forEach(doc => docId = doc.id);
        await servicesRef.doc(docId).update({
          description,
          tiktokText: description,
          imageUrl,
          thumbnailUrl,
          category: 'peinado',
          updatedAt: new Date()
        });
        console.log(`✅ Actualizado: ${name}`);
      }

      // Cleanup local
      fs.unlinkSync(webpFilePath);
      fs.unlinkSync(thumbFilePath);
    }

    console.log("\n🚀 ¡Proceso completado exitosamente para las 5 nuevas imágenes!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fatal:", error);
    process.exit(1);
  }
}

run();
