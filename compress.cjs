const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, 'zip new folder');
const outputDir = path.join(__dirname, 'public', 'frames');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

console.log('⚡ Starting compression magic...');

fs.readdirSync(inputDir).forEach(file => {
    if (file.endsWith('.png')) {
        const inputPath = path.join(inputDir, file);

        const outputFilename = file.replace('.png', '.jpg');
        const outputPath = path.join(outputDir, outputFilename);

        sharp(inputPath)
            .jpeg({
                quality: 75,      
                mozjpeg: true     
            })
            .toFile(outputPath)
            .then(() => {
                console.log(`Compressed: ${outputFilename}`);
            })
            .catch(err => {
                console.error(`Failed on ${file}:`, err);
            });
    }
});