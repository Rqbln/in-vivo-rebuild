/**
 * Script Node.js pour télécharger les médias
 */

const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

const MEDIAS_JSON = './exports/medias/all-medias.json';
const OUTPUT_DIR = './medias';
const BASE_URL = 'https://www.in-vivo-expert.fr';

let downloaded = 0;
let errors = 0;

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        file.close();
        fs.unlink(dest, () => {});
        reject(new Error('Status ' + response.statusCode));
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function processMedias() {
  const medias = JSON.parse(fs.readFileSync(MEDIAS_JSON, 'utf8'));
  const mediaArray = Array.isArray(medias) ? medias : (medias.items || medias.data || []);
  
  // Dédupliquer par nom de fichier (éviter miniature, vignette, etc.)
  const uniqueMedias = [];
  const seen = new Set();
  
  for (const media of mediaArray) {
    const url = media.url || media.link || media.src;
    if (!url) continue;
    
    const filename = media.filename || path.basename(url.split('?')[0]);
    
    // Garder seulement l'image originale (pas les miniatures)
    if (!url.includes('/miniature/') && !url.includes('/vignette/') && !url.includes('/g_miniature/') && !url.includes('/g_vignette/')) {
      if (!seen.has(filename)) {
        seen.add(filename);
        uniqueMedias.push(media);
      }
    }
  }
  
  console.log('📊 ' + mediaArray.length + ' médias trouvés, ' + uniqueMedias.length + ' uniques à télécharger');
  console.log('');
  
  for (const media of uniqueMedias) {
    try {
      let url = media.url || media.link || media.src;
      if (!url) continue;
      
      // Ajouter le domaine si l'URL est relative
      if (url.startsWith('/')) {
        url = BASE_URL + url;
      }
      
      const filename = media.filename || path.basename(url.split('?')[0]);
      const dest = path.join(OUTPUT_DIR, filename);
      
      if (fs.existsSync(dest)) {
        console.log('⏭️  Existe déjà: ' + filename);
        continue;
      }
      
      process.stdout.write('⬇️  Téléchargement: ' + filename + '...');
      await downloadFile(url, dest);
      console.log(' ✅');
      downloaded++;
      
      // Petite pause
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.log(' ❌ (' + error.message + ')');
      errors++;
    }
  }
  
  console.log('');
  console.log('✅ Téléchargement terminé');
  console.log('📊 Téléchargés: ' + downloaded);
  console.log('❌ Erreurs: ' + errors);
  console.log('📁 Dossier: ' + OUTPUT_DIR);
}

processMedias().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
