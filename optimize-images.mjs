import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const folders = [
  'public/assets/signages',
  'public/assets/printing',
  'public/assets/chemicals'
];

async function optimizeFolder(folderPath) {
  try {
    const files = await fs.readdir(folderPath);
    for (const file of files) {
      if (file.toLowerCase().endsWith('.png')) {
        const fullPath = path.join(folderPath, file);
        // Replace spaces with hyphens and change extension to .webp
        const newFileName = file.replace(/ /g, '-').replace(/\.png$/i, '.webp');
        const newPath = path.join(folderPath, newFileName);
        
        console.log(`Optimizing ${file}...`);
        await sharp(fullPath)
          .webp({ quality: 80 })
          .toFile(newPath);
          
        console.log(`Created ${newFileName}, deleting original...`);
        await fs.unlink(fullPath);
      }
    }
  } catch (err) {
    console.error(`Error processing folder ${folderPath}:`, err);
  }
}

async function run() {
  for (const folder of folders) {
    console.log(`Processing folder: ${folder}`);
    await optimizeFolder(folder);
  }
  console.log('Optimization complete!');
}

run();
