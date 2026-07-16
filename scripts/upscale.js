import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const sourceDir = path.resolve('zip folder');
const targetDir = path.resolve('public/frames');

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function upscaleImages() {
  const files = fs.readdirSync(sourceDir)
    .filter(file => file.startsWith('ezgif-frame-') && file.endsWith('.jpg'))
    .sort();

  console.log(`Found ${files.length} frames to process.`);

  const startTime = Date.now();

  // Process frames in parallel batches of 10 to not overflow memory
  const batchSize = 10;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(files.length / batchSize)}...`);

    await Promise.all(
      batch.map(async (file) => {
        const sourcePath = path.join(sourceDir, file);
        const targetPath = path.join(targetDir, file);

        try {
          await sharp(sourcePath)
            .resize(3840, 2160, {
              fit: 'fill',
              kernel: sharp.kernel.lanczos3
            })
            .jpeg({ quality: 75, progressive: true, mozjpeg: true })
            .toFile(targetPath);
        } catch (err) {
          console.error(`Error processing ${file}:`, err);
        }
      })
    );
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`Successfully upscaled all images to 4K in ${duration}s!`);
}

upscaleImages().catch(console.error);
