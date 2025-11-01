import { createClient } from '@supabase/supabase-js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration Supabase
const supabaseUrl = 'https://whivezkkzwgagherygzu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoaXZlemtrendnYWdoZXJ5Z3p1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjAxNzQ0NSwiZXhwIjoyMDc3NTkzNDQ1fQ.5UuFbIyoXTQcTNvV0U90-UfCyH0xcpHAVE2LLuu5oaA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importCategories() {
  console.log('📁 Import des catégories...');
  
  const categoriesPath = path.join(__dirname, '../lovable-ready/data/categories.json');
  const categoriesData = await fs.readJson(categoriesPath);
  
  // Adapter selon le format de votre fichier
  const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData.data || [];
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const category of categories) {
    // Créer un slug si nécessaire
    const slug = category.slug || 
                 category.name.toLowerCase()
                   .normalize('NFD')
                   .replace(/[\u0300-\u036f]/g, '')
                   .replace(/[^a-z0-9]+/g, '-')
                   .replace(/(^-|-$)/g, '');
    
    const { data, error } = await supabase
      .from('categories')
      .upsert({
        slug: slug,
        name: category.name || category.title,
        description: category.description || null
      }, { onConflict: 'slug' });
    
    if (error) {
      console.error(`   ❌ ${category.name}:`, error.message);
      errorCount++;
    } else {
      console.log(`   ✅ ${category.name} (${slug})`);
      successCount++;
    }
  }
  
  console.log(`\n   Total: ${successCount} réussies, ${errorCount} erreurs\n`);
  return { successCount, errorCount };
}

async function importPosts() {
  console.log('📝 Import des posts...');
  
  const postsDir = path.join(__dirname, '../lovable-ready/content/posts');
  
  // Vérifier si le dossier existe
  if (!await fs.pathExists(postsDir)) {
    console.log('   ⚠️  Dossier posts/ non trouvé, passage...\n');
    return { successCount: 0, errorCount: 0 };
  }
  
  const postFiles = await fs.readdir(postsDir);
  
  // Récupérer les catégories pour le mapping
  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, name');
  
  const categoryMap = {};
  if (categories) {
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
      categoryMap[cat.slug] = cat.id;
    });
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const file of postFiles) {
    if (!file.endsWith('.md')) continue;
    
    const filePath = path.join(postsDir, file);
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Parser le frontmatter YAML
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!frontmatterMatch) {
      console.log(`   ⚠️  ${file}: pas de frontmatter`);
      continue;
    }
    
    const frontmatter = {};
    frontmatterMatch[1].split('\n').forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) return;
      
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
      frontmatter[key] = value;
    });
    
    const postContent = frontmatterMatch[2].trim();
    
    // Créer un slug si nécessaire
    const slug = frontmatter.slug || 
                 file.replace('.md', '') ||
                 frontmatter.title?.toLowerCase()
                   .normalize('NFD')
                   .replace(/[\u0300-\u036f]/g, '')
                   .replace(/[^a-z0-9]+/g, '-')
                   .replace(/(^-|-$)/g, '');
    
    // Trouver l'ID de la catégorie
    const categoryId = frontmatter.category ? 
      (categoryMap[frontmatter.category] || null) : 
      null;
    
    // Déterminer l'URL de l'image
    let featuredImage = frontmatter.image || null;
    if (featuredImage && !featuredImage.startsWith('http')) {
      // Si c'est un chemin local, construire l'URL Supabase Storage
      const imageName = path.basename(featuredImage);
      featuredImage = `https://whivezkkzwgagherygzu.supabase.co/storage/v1/object/public/images/${imageName}`;
    }
    
    const { data, error } = await supabase
      .from('posts')
      .upsert({
        title: frontmatter.title || 'Sans titre',
        slug: slug,
        content: postContent,
        excerpt: frontmatter.excerpt || frontmatter.description || null,
        author: frontmatter.author || 'In Vivo Expert',
        category_id: categoryId,
        featured_image: featuredImage,
        published_at: frontmatter.date || new Date().toISOString()
      }, { onConflict: 'slug' });
    
    if (error) {
      console.error(`   ❌ ${frontmatter.title}:`, error.message);
      errorCount++;
    } else {
      console.log(`   ✅ ${frontmatter.title} (${slug})`);
      successCount++;
    }
  }
  
  console.log(`\n   Total: ${successCount} réussies, ${errorCount} erreurs\n`);
  return { successCount, errorCount };
}

async function importRedirects() {
  console.log('🔀 Import des redirections...');
  
  const redirectsPath = path.join(__dirname, '../lovable-ready/config/redirects-301.json');
  
  // Vérifier si le fichier existe
  if (!await fs.pathExists(redirectsPath)) {
    console.log('   ⚠️  Fichier redirects-301.json non trouvé, passage...\n');
    return { successCount: 0, errorCount: 0 };
  }
  
  const redirectsData = await fs.readJson(redirectsPath);
  const redirects = Array.isArray(redirectsData) ? redirectsData : redirectsData.redirects || [];
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const redirect of redirects) {
    const { data, error } = await supabase
      .from('redirects')
      .upsert({
        from_path: redirect.from || redirect.source,
        to_path: redirect.to || redirect.destination,
        status_code: redirect.status || 301
      }, { onConflict: 'from_path' });
    
    if (error) {
      console.error(`   ❌ ${redirect.from}:`, error.message);
      errorCount++;
    } else {
      console.log(`   ✅ ${redirect.from} → ${redirect.to}`);
      successCount++;
    }
  }
  
  console.log(`\n   Total: ${successCount} réussies, ${errorCount} erreurs\n`);
  return { successCount, errorCount };
}

async function main() {
  console.log('\n🚀 IMPORT DES DONNÉES VERS SUPABASE');
  console.log('=====================================\n');
  console.log(`📍 URL: ${supabaseUrl}`);
  console.log(`🗂️  Projet: in-vivo-rebuild\n`);
  
  const stats = {
    categories: { successCount: 0, errorCount: 0 },
    posts: { successCount: 0, errorCount: 0 },
    redirects: { successCount: 0, errorCount: 0 }
  };
  
  try {
    stats.categories = await importCategories();
    stats.posts = await importPosts();
    stats.redirects = await importRedirects();
    
    console.log('\n=====================================');
    console.log('✅ IMPORT TERMINÉ !\n');
    console.log('📊 STATISTIQUES :');
    console.log(`   Catégories : ${stats.categories.successCount} importées`);
    console.log(`   Posts      : ${stats.posts.successCount} importés`);
    console.log(`   Redirects  : ${stats.redirects.successCount} importées`);
    
    const totalErrors = stats.categories.errorCount + 
                       stats.posts.errorCount + 
                       stats.redirects.errorCount;
    
    if (totalErrors > 0) {
      console.log(`\n⚠️  ${totalErrors} erreurs au total`);
    }
    
    console.log('\n🎯 Prochaines étapes :');
    console.log('   1. Uploadez les images : npm run upload:images:supabase');
    console.log('   2. Vérifiez les données dans le dashboard Supabase');
    console.log('   3. Testez l\'API dans votre app Lovable\n');
    
  } catch (error) {
    console.error('\n❌ ERREUR FATALE:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
