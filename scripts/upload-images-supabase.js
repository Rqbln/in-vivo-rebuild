import { createClient } from '@supabase/supabase-js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration Supabase
const supabaseUrl = 'https://whivezkkzwgagherygzu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoaXZlemtrendnYWdoZXJ5Z3p1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjAxNzQ0NSwiZXhwIjoyMDc3NTkzNDQ1fQ.5UuFbIyoXTQcTNvV0U90-UfCyH0xcpHAVE2LLuu5oaA';

const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'images';

async function uploadImages() {
  console.log('\n🖼️  UPLOAD DES IMAGES VERS SUPABASE STORAGE');
  console.log('=============================================\n');
  console.log(`📍 URL: ${supabaseUrl}`);
  console.log(`🗂️  Bucket: ${BUCKET_NAME}\n`);
  
  const imagesDir = path.join(__dirname, '../lovable-ready/public/images');
  
  // Vérifier si le dossier existe
  if (!await fs.pathExists(imagesDir)) {
    console.log('❌ Dossier images/ non trouvé !');
    console.log(`   Chemin attendu: ${imagesDir}\n`);
    return;
  }
  
  const imageFiles = await fs.readdir(imagesDir);
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  
  const imagesToUpload = imageFiles.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return validExtensions.includes(ext);
  });
  
  if (imagesToUpload.length === 0) {
    console.log('⚠️  Aucune image trouvée à uploader\n');
    return;
  }
  
  console.log(`📦 ${imagesToUpload.length} images à uploader\n`);
  
  let successCount = 0;
  let errorCount = 0;
  const uploadedUrls = [];
  
  for (const file of imagesToUpload) {
    const filePath = path.join(imagesDir, file);
    const fileBuffer = await fs.readFile(filePath);
    const fileStats = await fs.stat(filePath);
    const fileSizeMB = (fileStats.size / 1024 / 1024).toFixed(2);
    
    // Déterminer le content type
    const ext = path.extname(file).slice(1).toLowerCase();
    const contentType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
    
    console.log(`📤 ${file} (${fileSizeMB} MB)...`);
    
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(file, fileBuffer, {
          contentType: contentType,
          upsert: true // Remplacer si existe déjà
        });
      
      if (error) {
        console.error(`   ❌ Erreur: ${error.message}`);
        errorCount++;
      } else {
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(file);
        
        const publicUrl = publicUrlData.publicUrl;
        
        console.log(`   ✅ Uploadé !`);
        console.log(`   🔗 ${publicUrl}\n`);
        
        uploadedUrls.push({
          filename: file,
          url: publicUrl,
          size: fileSizeMB + ' MB'
        });
        
        successCount++;
      }
    } catch (err) {
      console.error(`   ❌ Exception: ${err.message}\n`);
      errorCount++;
    }
  }
  
  console.log('\n=============================================');
  console.log('✅ UPLOAD TERMINÉ !\n');
  console.log('📊 STATISTIQUES :');
  console.log(`   Images uploadées : ${successCount}`);
  console.log(`   Erreurs          : ${errorCount}`);
  console.log(`   Total            : ${imagesToUpload.length}\n`);
  
  // Sauvegarder la liste des URLs
  if (uploadedUrls.length > 0) {
    const outputPath = path.join(__dirname, '../exports/supabase-images-urls.json');
    await fs.writeJson(outputPath, uploadedUrls, { spaces: 2 });
    console.log(`💾 URLs sauvegardées dans: ${outputPath}\n`);
  }
  
  console.log('🎯 Prochaines étapes :');
  console.log('   1. Vérifiez les images dans le dashboard Supabase Storage');
  console.log('   2. Assurez-vous que le bucket est PUBLIC');
  console.log('   3. Mettez à jour les chemins des images dans vos posts si nécessaire\n');
  
  if (errorCount > 0) {
    console.log('⚠️  Certaines images n\'ont pas pu être uploadées.');
    console.log('   Vérifiez les erreurs ci-dessus et réessayez.\n');
  }
}

async function checkBucket() {
  console.log('🔍 Vérification du bucket...\n');
  
  try {
    const { data, error } = await supabase.storage.getBucket(BUCKET_NAME);
    
    if (error) {
      console.log('⚠️  Le bucket n\'existe pas ou n\'est pas accessible.');
      console.log('   Veuillez créer le bucket "images" dans Supabase Storage.');
      console.log('   Étapes :');
      console.log('   1. Allez sur https://supabase.com/dashboard');
      console.log('   2. Sélectionnez votre projet in-vivo-rebuild');
      console.log('   3. Allez dans Storage');
      console.log('   4. Créez un nouveau bucket nommé "images"');
      console.log('   5. Rendez-le PUBLIC\n');
      return false;
    }
    
    console.log(`✅ Bucket "${BUCKET_NAME}" trouvé`);
    console.log(`   Public: ${data.public ? 'Oui ✅' : 'Non ❌'}\n`);
    
    if (!data.public) {
      console.log('⚠️  ATTENTION : Le bucket n\'est pas public !');
      console.log('   Les images ne seront pas accessibles publiquement.');
      console.log('   Pour le rendre public :');
      console.log('   1. Allez dans Storage > images');
      console.log('   2. Cliquez sur les paramètres du bucket');
      console.log('   3. Activez "Public bucket"\n');
    }
    
    return true;
  } catch (err) {
    console.error('❌ Erreur lors de la vérification:', err.message);
    return false;
  }
}

async function main() {
  const bucketExists = await checkBucket();
  
  if (!bucketExists) {
    console.log('❌ Impossible de continuer sans bucket.\n');
    process.exit(1);
  }
  
  await uploadImages();
}

main().catch(console.error);
