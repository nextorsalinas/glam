require('dotenv').config({ path: __dirname + '/.env' });
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

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
    const command = new ListObjectsV2Command({ Bucket: BUCKET_NAME });
    const response = await s3.send(command);
    console.log("Success! Bucket accessible. Files:", response.Contents?.length || 0);
  } catch (err) {
    console.error("Error accessing R2:", err.message);
  }
}
run();
