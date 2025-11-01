import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://whivezkkzwgagherygzu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoaXZlemtrendnYWdoZXJ5Z3p1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjAxNzQ0NSwiZXhwIjoyMDc3NTkzNDQ1fQ.5UuFbIyoXTQcTNvV0U90-UfCyH0xcpHAVE2LLuu5oaA';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('\n🔍 VÉRIFICATION DE LA CONNEXION SUPABASE');
console.log('==========================================\n');

async function checkConnection() {
  console.log('📡 Test de connexion...\n');
  
  try {
    // Test simple de connexion
    const { data, error } = await supabase
      .from('categories')
      .select('count');
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      console.log('\n💡 Vérifiez que :');
      console.log('   1. Les tables ont été créées (supabase-schema.sql)');
      console.log('   2. Row Level Security est bien configuré');
      console.log('   3. Les policies de lecture sont actives\n');
      return false;
    }
    
    console.log('✅ Connexion établie !\n');
    return true;
  } catch (err) {
    console.error('❌ Exception:', err.message);
    return false;
  }
}

async function checkTables() {
  console.log('📊 Vérification des tables...\n');
  
  const tables = ['categories', 'posts', 'pages', 'redirects'];
  const stats = {};
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
        stats[table] = { count: 0, error: error.message };
      } else {
        console.log(`   ✅ ${table}: ${count} ligne(s)`);
        stats[table] = { count, error: null };
      }
    } catch (err) {
      console.log(`   ❌ ${table}: ${err.message}`);
      stats[table] = { count: 0, error: err.message };
    }
  }
  
  console.log('');
  return stats;
}

async function checkStorage() {
  console.log('🖼️  Vérification du Storage...\n');
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log('   ❌ Impossible de lister les buckets:', error.message);
      return false;
    }
    
    const imagesBucket = buckets.find(b => b.name === 'images');
    
    if (!imagesBucket) {
      console.log('   ⚠️  Bucket "images" non trouvé');
      console.log('   💡 Créez-le dans le dashboard Supabase\n');
      return false;
    }
    
    console.log(`   ✅ Bucket "images" trouvé`);
    console.log(`   📂 Public: ${imagesBucket.public ? 'Oui ✅' : 'Non ❌'}`);
    
    if (!imagesBucket.public) {
      console.log('   ⚠️  Le bucket doit être PUBLIC pour afficher les images\n');
    }
    
    // Lister les fichiers
    const { data: files, error: listError } = await supabase.storage
      .from('images')
      .list();
    
    if (listError) {
      console.log(`   ⚠️  Impossible de lister les fichiers: ${listError.message}\n`);
      return false;
    }
    
    console.log(`   📁 Fichiers: ${files?.length || 0}\n`);
    
    return true;
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
    return false;
  }
}

async function showSampleData() {
  console.log('📋 Aperçu des données...\n');
  
  // Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .limit(5);
  
  if (categories && categories.length > 0) {
    console.log('📁 Catégories :');
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.slug})`);
    });
    console.log('');
  }
  
  // Posts
  const { data: posts } = await supabase
    .from('posts')
    .select('title, slug, published_at')
    .order('published_at', { ascending: false })
    .limit(5);
  
  if (posts && posts.length > 0) {
    console.log('📝 Posts récents :');
    posts.forEach(post => {
      const date = new Date(post.published_at).toLocaleDateString('fr-FR');
      console.log(`   - ${post.title} (${date})`);
    });
    console.log('');
  }
  
  // Redirects
  const { data: redirects } = await supabase
    .from('redirects')
    .select('from_path, to_path')
    .limit(3);
  
  if (redirects && redirects.length > 0) {
    console.log('🔀 Redirections (exemple) :');
    redirects.forEach(r => {
      console.log(`   - ${r.from_path} → ${r.to_path}`);
    });
    console.log('');
  }
}

async function testQuery() {
  console.log('🧪 Test de requête complexe...\n');
  
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        slug,
        category:categories(name, slug)
      `)
      .limit(1);
    
    if (error) {
      console.log('   ❌ Erreur:', error.message);
      return false;
    }
    
    if (posts && posts.length > 0) {
      console.log('   ✅ Requête avec JOIN réussie !');
      console.log('   📄 Exemple:');
      console.log(`      Titre: ${posts[0].title}`);
      console.log(`      Catégorie: ${posts[0].category?.name || 'N/A'}`);
      console.log('');
      return true;
    }
    
    console.log('   ⚠️  Aucun post trouvé\n');
    return false;
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
    return false;
  }
}

async function main() {
  console.log(`📍 URL: ${supabaseUrl}`);
  console.log(`🗂️  Projet: in-vivo-rebuild\n`);
  
  const connected = await checkConnection();
  
  if (!connected) {
    console.log('❌ Impossible de continuer sans connexion\n');
    process.exit(1);
  }
  
  const stats = await checkTables();
  await checkStorage();
  
  const hasData = Object.values(stats).some(s => s.count > 0);
  
  if (hasData) {
    await showSampleData();
    await testQuery();
  } else {
    console.log('⚠️  Aucune donnée trouvée dans les tables\n');
    console.log('💡 Importez les données :');
    console.log('   npm run supabase:import\n');
  }
  
  console.log('==========================================');
  console.log('✅ VÉRIFICATION TERMINÉE\n');
  
  // Résumé
  console.log('📊 RÉSUMÉ :');
  console.log(`   Connexion: ✅`);
  console.log(`   Categories: ${stats.categories?.count || 0} ligne(s)`);
  console.log(`   Posts: ${stats.posts?.count || 0} ligne(s)`);
  console.log(`   Pages: ${stats.pages?.count || 0} ligne(s)`);
  console.log(`   Redirects: ${stats.redirects?.count || 0} ligne(s)`);
  
  const totalRecords = Object.values(stats).reduce((sum, s) => sum + (s.count || 0), 0);
  
  if (totalRecords === 0) {
    console.log('\n⚠️  Base de données vide');
    console.log('   Exécutez: npm run supabase:setup\n');
  } else {
    console.log(`\n✅ ${totalRecords} enregistrements au total\n`);
    console.log('🎯 Tout est prêt pour Lovable ! 🚀\n');
  }
}

main().catch(console.error);
