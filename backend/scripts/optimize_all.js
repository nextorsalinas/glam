require('dotenv').config();
const { db } = require('../src/config/firebase');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function run() {
  console.log("Iniciando optimización WebP de imágenes...");
  try {
    const servicesRef = db.collection('services');
    const snapshot = await servicesRef.get();
    
    const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-9e7a27440b204a97b7ddc8deddeb8e95.r2.dev';
    const imagenesDir = path.join(__dirname, '..', '..', 'imagenes');
    const cloudflareMcpDir = path.join(__dirname, '..', '..', 'cloudflare-mcp');

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const name = data.name;
      if (!name) continue;

      const originalPngPath = path.join(imagenesDir, `${name}.png`);
      if (!fs.existsSync(originalPngPath)) {
        console.log(`⚠️ Archivo original no encontrado para ${name}. Se omite.`);
        continue;
      }

      const webpFileName = `${name}.webp`;
      const thumbFileName = `${name}_thumb.webp`;
      
      const webpFilePath = path.join(imagenesDir, webpFileName);
      const thumbFilePath = path.join(imagenesDir, thumbFileName);

      console.log(`\nProcesando: ${name}`);

      // Convert to WebP Main (Max 1080p, 80% quality)
      await sharp(originalPngPath)
        .resize({ width: 1080, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(webpFilePath);
        
      // Convert to WebP Thumb (Max 400p, 60% quality)
      await sharp(originalPngPath)
        .resize({ width: 400, withoutEnlargement: true })
        .webp({ quality: 60 })
        .toFile(thumbFilePath);

      // Normalize key for R2 and Web (remove accents, replace ñ, convert spaces to underscores)
      const normalizeKey = (filename) => {
        return 'images/' + filename
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/ñ/g, "n")
          .replace(/Ñ/g, "N")
          .replace(/ /g, '_')
          .toLowerCase();
      };

      const s3KeyMain = normalizeKey(webpFileName);
      const s3KeyThumb = normalizeKey(thumbFileName);

      // Upload Main
      execSync(`node upload_image.js "${webpFileName}" "${s3KeyMain}"`, { cwd: cloudflareMcpDir, stdio: 'pipe' });
      
      // Upload Thumb
      execSync(`node upload_image.js "${thumbFileName}" "${s3KeyThumb}"`, { cwd: cloudflareMcpDir, stdio: 'pipe' });

      // Update Firestore
      await servicesRef.doc(doc.id).update({
        imageUrl: `${R2_PUBLIC_URL}/${s3KeyMain}`,
        thumbnailUrl: `${R2_PUBLIC_URL}/${s3KeyThumb}`
      });

      console.log(`✅ Optimizado y actualizado: ${name}`);
    }

    console.log("\n¡Optimización completada con éxito!");
    process.exit(0);
  } catch (error) {
    console.error("Error fatal:", error);
    process.exit(1);
  }
}

run();
