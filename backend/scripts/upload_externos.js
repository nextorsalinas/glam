require('dotenv').config({ path: __dirname + '/../../cloudflare-mcp/.env' });
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.R2_BUCKET_NAME;

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});

const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-9e7a27440b204a97b7ddc8deddeb8e95.r2.dev';

async function uploadExternos() {
  const dirPath = path.join(__dirname, '..', '..', 'videos', 'externos');
  if (!fs.existsSync(dirPath)) {
    console.error("No se encontró la carpeta:", dirPath);
    return;
  }

  const files = fs.readdirSync(dirPath).filter(f => f.toLowerCase().endsWith('.mp4'));
  
  console.log(`Encontrados ${files.length} videos en la carpeta externos.\n`);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const s3Key = 'videos/externos/' + file.replace(/ /g, '_').toLowerCase();
    
    console.log(`Subiendo: ${file}...`);
    try {
      const fileStream = fs.createReadStream(filePath);
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: fileStream,
        ContentType: 'video/mp4'
      });
      
      await s3.send(command);
      const url = `${R2_PUBLIC_URL}/${s3Key}`;
      console.log(`✅ Subido con éxito: ${url}`);
    } catch (err) {
      console.error(`❌ Error al subir ${file}:`, err.message);
    }
  }
  
  console.log("\nProceso de subida completado.");
}

uploadExternos();
