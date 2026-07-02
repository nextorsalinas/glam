require('dotenv').config();
const { db } = require('../src/config/firebase');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function run() {
  console.log("Iniciando OPTIMIZACIÓN de imágenes de JUNIO 3...");
  try {
    const servicesRef = db.collection('services');
    const snapshot = await servicesRef.where('category', '==', 'peinado').get();
    
    const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-9e7a27440b204a97b7ddc8deddeb8e95.r2.dev';
    const baseImagenesDir = path.join(__dirname, '..', '..', 'imagenes');
    const junioImagenesDir = path.join(baseImagenesDir, 'glam-images');
    const cloudflareMcpDir = path.join(__dirname, '..', '..', 'cloudflare-mcp');

    // Nombres de los peinados de junio3.txt
    const junio3Names = [
      "Moño Princesa Diamante",
      "Corona Trenzada Angelical",
      "Moño Encanto Floral",
      "Rizos de Princesa Celestial",
      "Cascada Real de Rizos",
      "Ondas Encantadas de Comunión",
      "Ondas de Ensueño Trenzadas",
      "Jardín de Rosas Encantadas",
      "Lazo de Ensueño Floral"
    ];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const name = data.name;
      if (!junio3Names.includes(name)) continue;

      const originalPngPath = path.join(junioImagenesDir, `${name}.png`);
      if (!fs.existsSync(originalPngPath)) {
        console.log(`⚠️ Archivo original no encontrado en glam-images para ${name}. Se omite.`);
        continue;
      }

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

      // Upload Main
      const s3KeyMain = `images/${webpFileName}`;
      execSync(`node upload_image.js "${webpFileName}" "${s3KeyMain}"`, { cwd: cloudflareMcpDir, stdio: 'inherit' });
      
      // Upload Thumb
      const s3KeyThumb = `images/${thumbFileName}`;
      execSync(`node upload_image.js "${thumbFileName}" "${s3KeyThumb}"`, { cwd: cloudflareMcpDir, stdio: 'inherit' });

      // Update Firestore
      await servicesRef.doc(doc.id).update({
        imageUrl: `${R2_PUBLIC_URL}/${s3KeyMain}`,
        thumbnailUrl: `${R2_PUBLIC_URL}/${s3KeyThumb}`,
        updatedAt: new Date()
      });

      console.log(`✅ Optimizado, subido y actualizado: ${name}`);
      
      // Cleanup local webp files
      fs.unlinkSync(webpFilePath);
      fs.unlinkSync(thumbFilePath);
    }

    console.log("\n¡Optimización de Junio 3 completada con éxito!");
    process.exit(0);
  } catch (error) {
    console.error("Error fatal:", error);
    process.exit(1);
  }
}

run();
