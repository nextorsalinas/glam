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
    const videoFilename = process.argv[2] || 'corona bohemia.mp4';
    const s3Key = process.argv[3] || videoFilename.replace(/ /g, '_').toLowerCase();
    const videoPath = path.join(__dirname, '..', 'videos', videoFilename);
    const fileStream = fs.createReadStream(videoPath);
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileStream,
      ContentType: 'video/mp4'
    });
    
    await s3.send(command);
    console.log("Upload successful!");
  } catch (err) {
    console.error("Error uploading to R2:", err.message);
  }
}
run();
