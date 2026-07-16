const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 1. Point dynamically to the folders in your project root
const inputDir = path.join(__dirname, 'zip new folder');
const outputDir = path.join(__dirname, 'public', 'frames');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log('⚡ Starting compression magic...');

fs.readdirSync(inputDir).forEach(file => {
    if (file.endsWith('.png')) {
        const inputPath = path.join(inputDir, file);

        // Convert extension to .jpg
        const outputFilename = file.replace('.png', '.jpg');
        const outputPath = path.join(outputDir, outputFilename);

        sharp(inputPath)
            .jpeg({
                quality: 75,      // Sweet spot: tiny size, high-end 2K quality
                mozjpeg: true     // Advanced compression
            })
            .toFile(outputPath)
            .then(() => {
                console.log(`✅ Compressed: ${outputFilename}`);
            })
            .catch(err => {
                console.error(`❌ Failed on ${file}:`, err);
            });
    }
});