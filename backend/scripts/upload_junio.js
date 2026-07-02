require('dotenv').config();
const { db } = require('../src/config/firebase');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log("Iniciando carga de nuevas imágenes y actualización de base de datos...");
  try {
    const fileContent = fs.readFileSync(path.join(__dirname, '..', '..', 'junio2.txt'), 'utf8');
    const lines = fileContent.split('\n').filter(l => l.trim().length > 0);
    
    const servicesRef = db.collection('services');
    const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-9e7a27440b204a97b7ddc8deddeb8e95.r2.dev';

    for (const line of lines) {
      const [nameRaw, textRaw] = line.split('/');
      if (!nameRaw || !textRaw) continue;
      
      const name = nameRaw.trim();
      const tiktokText = textRaw.trim();
      
      const filename = `${name}.png`;
      
      console.log(`\nProcesando: ${name}`);
      console.log(`Subiendo imagen: ${filename}...`);
      
      try {
        const cloudflareMcpDir = path.join(__dirname, '..', '..', 'cloudflare-mcp');
        execSync(`node upload_image.js "${filename}"`, { cwd: cloudflareMcpDir, stdio: 'inherit' });
        
        const s3Key = 'images/' + filename.replace(/ /g, '_').toLowerCase();
        const imageUrl = `${R2_PUBLIC_URL}/${s3Key}`;
        
        const snapshot = await servicesRef.where('name', '==', name).get();
        if (snapshot.empty) {
          await servicesRef.add({
            name,
            tiktokText,
            imageUrl
          });
          console.log(`✅ Agregado nuevo registro a la BD: ${name}`);
        } else {
          let docId;
          snapshot.forEach(doc => docId = doc.id);
          await servicesRef.doc(docId).update({
            tiktokText,
            imageUrl
          });
          console.log(`✅ Actualizado registro en la BD: ${name}`);
        }
      } catch(e) {
        console.error(`❌ Error procesando ${filename}:`, e.message);
      }
    }
    
    console.log("\nProceso terminado.");
    process.exit(0);
  } catch(e) {
    console.error('Error fatal:', e);
    process.exit(1);
  }
}
run();
