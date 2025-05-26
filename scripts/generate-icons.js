import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

// Obtener el directorio actual en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tamaños de iconos a generar
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Ruta al icono SVG placeholder
const svgPath = path.join(__dirname, '../public/icons/');

// Directorio de salida
const outputDir = path.join(__dirname, '../public/icons');

// Asegurarse de que el directorio existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Leer el archivo SVG
const svgBuffer = fs.readFileSync(svgPath);

// Generar iconos para cada tamaño
async function generateIcons() {
  console.log('Generando iconos...');
  
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`Generado: ${outputPath}`);
    } catch (error) {
      console.error(`Error al generar ${outputPath}:`, error);
    }
  }
  
  console.log('¡Iconos generados con éxito!');
}

// Ejecutar la función
generateIcons().catch(console.error); 