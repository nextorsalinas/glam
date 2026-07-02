import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public', 'glam.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

const base64Match = svgContent.match(/data:image\/png;base64,([^"]+)/);
if (base64Match && base64Match[1]) {
  const base64Data = base64Match[1];
  const buffer = Buffer.from(base64Data, 'base64');
  
  fs.writeFileSync(path.resolve('public', 'pwa-192x192.png'), buffer);
  fs.writeFileSync(path.resolve('public', 'pwa-512x512.png'), buffer);
  fs.writeFileSync(path.resolve('public', 'apple-touch-icon.png'), buffer);
  fs.writeFileSync(path.resolve('public', 'favicon.ico'), buffer);
  console.log('Icons extracted and saved successfully!');
} else {
  console.error('Base64 data not found in SVG');
}
