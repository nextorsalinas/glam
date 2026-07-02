#!/usr/bin/env node
require('dotenv').config({ path: __dirname + '/.env' });
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'glam-media';

if (!ACCOUNT_ID || !ACCESS_KEY || !SECRET_KEY) {
  console.error("Missing required R2 credentials in .env file.");
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});

const server = new Server(
  {
    name: 'cloudflare-r2-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list_r2_media',
      description: 'List all media files (images, videos) in the Cloudflare R2 bucket.',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
    {
      name: 'get_r2_media_url',
      description: 'Generate a presigned URL to view or download a specific media file from R2. The URL expires in 1 hour.',
      inputSchema: {
        type: 'object',
        properties: {
          objectKey: {
            type: 'string',
            description: 'The key (filename) of the object in R2',
          },
        },
        required: ['objectKey'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'list_r2_media') {
      const command = new ListObjectsV2Command({ Bucket: BUCKET_NAME });
      const response = await s3.send(command);
      const objects = response.Contents ? response.Contents.map(obj => ({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified,
      })) : [];

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ bucket: BUCKET_NAME, files: objects }, null, 2),
          },
        ],
      };
    }

    if (name === 'get_r2_media_url') {
      const { objectKey } = args;
      if (!objectKey) throw new Error('objectKey is required');

      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: objectKey,
      });

      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ url, expires_in: '1 hour' }, null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
