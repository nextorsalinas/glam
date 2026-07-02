require('dotenv').config({ path: __dirname + '/.env' });
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

async function run() {
  try {
    const filename = process.argv[2];
    if (!filename) throw new Error("Filename required");
    
    // Default s3Key formats it to lowercase, underscores and removes accents
    const s3Key = process.argv[3] || 'images/' + filename
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ñ/g, "n")
      .replace(/Ñ/g, "N")
      .replace(/ /g, '_')
      .toLowerCase();
    
    const filePath = path.join(__dirname, '..', 'imagenes', filename);
    const fileStream = fs.createReadStream(filePath);
    
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'image/png';
    if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileStream,
      ContentType: contentType
    });
    
    await s3.send(command);
    console.log("Upload successful for", filename);
  } catch (err) {
    console.error("Error uploading to R2:", err.message);
  }
}
run();
