import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, '../public');
const SOURCE_ICON = path.join(PUBLIC_DIR, 'logo-splash.svg');

// Ruta hacia el JSON de datos que lee tu astro.config.mjs
const SPONSOR_JSON_PATH = path.resolve(__dirname, '../src/data/sponsor.json');

// Color de respaldo por si el JSON falla de alguna manera
const DEFAULT_FALLBACK_COLOR = '#ffffff';

async function getAppBackgroundColor() {
  try {
    // Leemos el archivo tal como lo hace Astro internamente
    const rawData = await fs.readFile(SPONSOR_JSON_PATH, 'utf-8');
    const sponsorInfo = JSON.parse(rawData);
    
    if (sponsorInfo?.colors?.appBg) {
      console.log(`🎨 Color detectado desde sponsor.json: ${sponsorInfo.colors.appBg}`);
      return sponsorInfo.colors.appBg;
    }
    
    console.warn(`⚠️ No se encontró "colors.appBg" en el JSON. Usando fallback: ${DEFAULT_FALLBACK_COLOR}`);
    return DEFAULT_FALLBACK_COLOR;
  } catch (error) {
    console.warn(`⚠️ No se pudo leer sponsor.json (${error.message}). Usando fallback: ${DEFAULT_FALLBACK_COLOR}`);
    return DEFAULT_FALLBACK_COLOR;
  }
}

async function generateIcons() {
  try {
    // Comprobar si existe el SVG fuente
    await fs.access(SOURCE_ICON);
    
    // Obtenemos dinámicamente el color configurado
    const APP_BACKGROUND_COLOR = await getAppBackgroundColor();

    const ICONS = [
      { name: 'icon-192.png', size: 192, maskable: false },
      { name: 'icon-192-maskable.png', size: 192, maskable: true },
      { name: 'icon-512.png', size: 512, maskable: false },
      { name: 'icon-512-maskable.png', size: 512, maskable: true },
      { name: 'apple-touch-icon.png', size: 180, maskable: false, background: APP_BACKGROUND_COLOR }
    ];
    
    console.log('Generando iconos PWA optimizados desde logo-splash.svg...\n');

    for (const icon of ICONS) {
      const outputPath = path.join(PUBLIC_DIR, icon.name);
      
      let pipeline;

      // Determinamos el color de fondo para este icono específico
      const targetBackground = icon.background || (icon.maskable ? APP_BACKGROUND_COLOR : null);

      if (targetBackground) {
        // CONFIGURACIÓN PARA FONDOS SÓLIDOS (Maskables y Apple)
        pipeline = sharp(SOURCE_ICON)
          .resize(icon.size, icon.size, {
            fit: 'contain',
            kernel: sharp.kernel.lanczos3,
            background: targetBackground
          })
          .flatten({ background: targetBackground })
          .png({ 
            quality: 100, 
            compressionLevel: 9, 
            palette: true 
          });
      } else {
        // CONFIGURACIÓN PARA ICONOS TRANSPARENTES (Any)
        pipeline = sharp(SOURCE_ICON)
          .resize(icon.size, icon.size, {
            fit: 'cover',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png({ quality: 100 });
      }

      await pipeline.toFile(outputPath);
      console.log(`✅ Creado: ${icon.name} (${icon.size}x${icon.size})${targetBackground ? ` [Fondo: ${targetBackground}]` : ' [Transparente]'}`);
    }

    console.log('\n¡Todos los iconos generados correctamente con el color sincronizado!');
  } catch (error) {
    console.error('Error generando los iconos:', error);
    if (error.code === 'ENOENT') {
      console.error(`Asegúrate de que existe el archivo base en: ${SOURCE_ICON}`);
    }
  }
}

generateIcons();