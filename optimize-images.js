/**
 * Image Optimization Script
 *
 * Optimizes images in /public/images/ folder:
 * - Converts to WebP format
 * - Reduces file size
 * - Maintains quality at 85%
 */

import sharp from 'sharp';
import { readdirSync, existsSync, mkdirSync } from 'fs';
import { join, parse } from 'path';

const INPUT_DIR = './public/images';
const OUTPUT_DIR = './public/images/optimized';
const QUALITY = 85;
const MAX_WIDTH = 1200;

// Create output directory if it doesn't exist
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function optimizeImage(inputPath, outputPath) {
  try {
    const metadata = await sharp(inputPath).metadata();

    await sharp(inputPath)
      .resize(MAX_WIDTH, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: QUALITY })
      .toFile(outputPath);

    console.log(`✓ Optimized: ${inputPath} → ${outputPath}`);
  } catch (error) {
    console.error(`✗ Error optimizing ${inputPath}:`, error.message);
  }
}

async function processImages() {
  console.log('🖼️  Starting image optimization...\n');

  try {
    const files = readdirSync(INPUT_DIR);
    const imageFiles = files.filter(file =>
      /\.(jpg|jpeg|png)$/i.test(file)
    );

    if (imageFiles.length === 0) {
      console.log('No images found to optimize.');
      return;
    }

    for (const file of imageFiles) {
      const inputPath = join(INPUT_DIR, file);
      const { name } = parse(file);
      const outputPath = join(OUTPUT_DIR, `${name}.webp`);

      await optimizeImage(inputPath, outputPath);
    }

    console.log(`\n✅ Optimized ${imageFiles.length} image(s)`);
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  } catch (error) {
    console.error('Error processing images:', error);
    process.exit(1);
  }
}

processImages();
