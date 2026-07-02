// Forzar base de datos correcta de producción ANTES de requerir firebase
process.env.FIREBASE_PROJECT_ID = "alexandra-styles";
process.env.FIRESTORE_DATABASE_ID = "(default)";

require('dotenv').config();
const { db } = require('../src/config/firebase');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function run() {
  console.log("Iniciando procesamiento de imágenes de JUNIO 3 (Optimización WebP, Normalización y Firestore)...");
  
  try {
    const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-9e7a27440b204a97b7ddc8deddeb8e95.r2.dev';
    const baseImagenesDir = path.join(__dirname, '..', '..', 'imagenes');
    const junioImagenesDir = path.join(baseImagenesDir, 'glam-images');
    const cloudflareMcpDir = path.join(__dirname, '..', '..', 'cloudflare-mcp');

    const fileContent = fs.readFileSync(path.join(junioImagenesDir, 'junio3.txt'), 'utf8');
    const lines = fileContent.split('\n').filter(l => l.trim().length > 0);
    
    const servicesRef = db.collection('services');

    for (const line of lines) {
      const parts = line.split('/');
      if (parts.length < 2) continue;
      
      const name = parts[0].trim();
      const description = parts.slice(1).join('/').trim();
      
      const originalPngPath = path.join(junioImagenesDir, `${name}.png`);
      
      if (!fs.existsSync(originalPngPath)) {
        console.log(`⚠️ Archivo PNG original no encontrado para peinado: "${name}". Saltando...`);
        continue;
      }

      console.log(`\n--- Procesando peinado: ${name} ---`);

      // 1. Normalizar nombre para el archivo R2 (reemplazar acentos, ñ, etc.)
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

      // 2. Convertir y optimizar con Sharp a WebP
      console.log(`Optimización WebP a ${webpFileName}...`);
      await sharp(originalPngPath)
        .resize({ width: 1080, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(webpFilePath);
        
      console.log(`Optimización miniatura a ${thumbFileName}...`);
      await sharp(originalPngPath)
        .resize({ width: 400, withoutEnlargement: true })
        .webp({ quality: 60 })
        .toFile(thumbFilePath);

      // 3. Subir a Cloudflare R2
      console.log("Subiendo a Cloudflare R2...");
      const s3KeyMain = `images/${webpFileName}`;
      const s3KeyThumb = `images/${thumbFileName}`;
      
      execSync(`node upload_image.js "${webpFileName}" "${s3KeyMain}"`, { cwd: cloudflareMcpDir, stdio: 'inherit' });
      execSync(`node upload_image.js "${thumbFileName}" "${s3KeyThumb}"`, { cwd: cloudflareMcpDir, stdio: 'inherit' });

      // 4. Actualizar Firestore
      console.log("Actualizando base de datos Firestore...");
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
        console.log(`✅ Creado nuevo documento para: ${name}`);
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
        console.log(`✅ Actualizado documento existente: ${name}`);
      }

      // 5. Cleanup temporal local
      console.log("Limpieza de temporales locales...");
      fs.unlinkSync(webpFilePath);
      fs.unlinkSync(thumbFilePath);
    }

    console.log("\n🚀 ¡Proceso completado exitosamente para junio3!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fatal:", error);
    process.exit(1);
  }
}

run();
