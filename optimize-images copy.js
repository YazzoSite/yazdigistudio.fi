/**
 * Image Optimization Script
 *
 * This script optimizes images for web display:
 * - Resizes to max 1200px width (maintains aspect ratio)
 * - Converts to WebP format (better compression)
 * - 85% quality (good balance of size vs quality)
 * - Reduces file size from 1-8MB to ~200-400KB
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.join(__dirname, 'public/images/downloads');
const OUTPUT_DIR = path.join(__dirname, 'public/images/web');
const MAX_WIDTH = 1200;
const QUALITY = 85;

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Get all image files from source directory
const files = fs.readdirSync(SOURCE_DIR).filter(file =>
  /\.(jpg|jpeg|png)$/i.test(file)
);

console.log(`Found ${files.length} images to optimize...\n`);

// Process each image
for (const file of files) {
  const inputPath = path.join(SOURCE_DIR, file);
  const outputFileName = path.parse(file).name + '.webp';
  const outputPath = path.join(OUTPUT_DIR, outputFileName);

  try {
    const stats = fs.statSync(inputPath);
    const inputSizeMB = (stats.size / 1024 / 1024).toFixed(2);

    await sharp(inputPath)
      .resize(MAX_WIDTH, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: QUALITY })
      .toFile(outputPath);

    const outputStats = fs.statSync(outputPath);
    const outputSizeKB = (outputStats.size / 1024).toFixed(0);
    const reduction = ((1 - outputStats.size / stats.size) * 100).toFixed(0);

    console.log(`✓ ${file}`);
    console.log(`  ${inputSizeMB}MB → ${outputSizeKB}KB (${reduction}% smaller)\n`);
  } catch (error) {
    console.error(`✗ Failed to process ${file}:`, error.message);
  }
}

console.log('Image optimization complete!');
