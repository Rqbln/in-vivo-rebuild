/**
 * Script d'export API Kiubi
 * Extrait les contenus (posts, pages, catégories) via l'API Kiubi
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

class KiubiExporter {
  constructor() {
    this.apiUrl = process.env.KIUBI_API_URL || 'https://www.in-vivo-expert.fr/api/v1';
    this.exportDir = path.join(__dirname, '..', 'exports');
    
    if (!this.apiUrl) {
      throw new Error('❌ KIUBI_API_URL doit être configuré dans .env');
    }

    // API Front publique - pas d'authentification requise
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });
  }

  async ensureExportDirs() {
    const dirs = ['posts', 'pages', 'categories', 'medias', 'products'];
    for (const dir of dirs) {
      await fs.ensureDir(path.join(this.exportDir, dir));
    }
  }

  async exportPosts() {
    if (process.env.EXPORT_POSTS !== 'true') return;
    
    console.log('\n📝 Export des articles/posts...');
    try {
      // API Front Kiubi - endpoint blog/posts.json
      const allPosts = [];
      let page = 0;
      let hasMore = true;
      
      // Pagination pour récupérer tous les posts
      const MAX_PAGES = 50; // Limite pour éviter le rate limit
      
      while (hasMore && page < MAX_PAGES) {
        console.log(`  → Page ${page + 1}...`);
        const response = await this.client.get('/blog/posts.json', {
          params: {
            page: page,
            limit: 20,
            sort: '-date'
          }
        });
        
        // L'API Kiubi retourne {meta, error, data}
        const responseData = response.data;
        const posts = responseData.data || [];
        
        if (!posts || posts.length === 0) {
          hasMore = false;
        } else {
          allPosts.push(...posts);
          console.log(`    ✓ ${posts.length} posts récupérés (total: ${allPosts.length})`);
          
          // Sauvegarder régulièrement pour ne pas perdre les données
          if (page % 10 === 0) {
            await fs.writeJSON(
              path.join(this.exportDir, 'posts', 'all-posts.json'),
              allPosts,
              { spaces: 2 }
            );
            console.log(`    💾 Sauvegarde intermédiaire (${allPosts.length} posts)`);
          }
          
          // Vérifier s'il y a une page suivante
          if (!responseData.meta?.link?.next_page) {
            hasMore = false;
          } else {
            page++;
          }
          
          // Pause plus longue pour éviter rate limit
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (page >= MAX_PAGES) {
        console.log(`⚠️  Limite de ${MAX_PAGES} pages atteinte (rate limit API)`);
      }
      
      await fs.writeJSON(
        path.join(this.exportDir, 'posts', 'all-posts.json'),
        allPosts,
        { spaces: 2 }
      );
      
      console.log(`✅ ${allPosts.length} posts exportés`);
      
      // Export individuel pour faciliter le parsing
      for (const post of allPosts) {
        await fs.writeJSON(
          path.join(this.exportDir, 'posts', `post-${post.id}.json`),
          post,
          { spaces: 2 }
        );
      }
      
      return allPosts;
    } catch (error) {
      console.error('❌ Erreur export posts:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', error.response.data);
      }
      return null;
    }
  }

  async exportPages() {
    if (process.env.EXPORT_PAGES !== 'true') return;
    
    console.log('\n📄 Export des pages (via recherche)...');
    try {
      // API Front Kiubi - utiliser /search/cms/pages.json
      // Pas de pagination explicite, on récupère tout ce qu'on peut
      const response = await this.client.get('/search/cms/pages.json', {
        params: {
          q: '' // Recherche vide pour tout récupérer
        }
      });
      const responseData = response.data;
      const pages = responseData.data || [];
      
      await fs.writeJSON(
        path.join(this.exportDir, 'pages', 'all-pages.json'),
        pages,
        { spaces: 2 }
      );
      
      console.log(`✅ ${pages.length} pages exportées`);
      
      for (const page of pages) {
        const pageId = page.id || page.slug || Math.random().toString(36).substring(7);
        await fs.writeJSON(
          path.join(this.exportDir, 'pages', `page-${pageId}.json`),
          page,
          { spaces: 2 }
        );
      }
      
      return pages;
    } catch (error) {
      console.error('❌ Erreur export pages:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
      }
      console.log('💡 Les pages seront récupérées via la capture statique');
      return null;
    }
  }

  async exportCategories() {
    if (process.env.EXPORT_CATEGORIES !== 'true') return;
    
    console.log('\n🗂️  Export des catégories...');
    try {
      // API Front Kiubi - endpoint blog/categories.json
      const response = await this.client.get('/blog/categories.json');
      const responseData = response.data;
      const categories = responseData.data || [];
      
      await fs.writeJSON(
        path.join(this.exportDir, 'categories', 'all-categories.json'),
        categories,
        { spaces: 2 }
      );
      
      console.log(`✅ ${categories.length} catégories exportées`);
      return categories;
    } catch (error) {
      console.error('❌ Erreur export catégories:', error.message);
      return null;
    }
  }

  async exportMedias() {
    if (process.env.EXPORT_MEDIAS !== 'true') return;
    
    console.log('\n🖼️  Extraction des URLs de médias depuis les posts...');
    
    // L'API Front ne liste pas directement les médias
    // On va extraire les URLs des images depuis les posts
    try {
      const postsFile = path.join(this.exportDir, 'posts', 'all-posts.json');
      
      if (!(await fs.pathExists(postsFile))) {
        console.log('ℹ️  Pas de posts exportés, impossible d\'extraire les médias');
        return null;
      }
      
      const posts = await fs.readJSON(postsFile);
      const mediaUrls = new Set();
      
      // Extraire les URLs des images depuis les posts
      for (const post of posts) {
        // Image de vignette
        if (post.thumb && post.thumb.url) {
          mediaUrls.add(post.thumb.url);
          if (post.thumb.url_miniature) mediaUrls.add(post.thumb.url_miniature);
          if (post.thumb.url_vignette) mediaUrls.add(post.thumb.url_vignette);
        }
        
        // Images dans le contenu HTML
        if (post.content) {
          const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
          let match;
          while ((match = imgRegex.exec(post.content)) !== null) {
            mediaUrls.add(match[1]);
          }
        }
      }
      
      const medias = Array.from(mediaUrls).map((url, index) => ({
        id: index + 1,
        url: url,
        filename: url.split('/').pop()
      }));
      
      await fs.writeJSON(
        path.join(this.exportDir, 'medias', 'all-medias.json'),
        medias,
        { spaces: 2 }
      );
      
      console.log(`✅ ${medias.length} URLs de médias extraites`);
      console.log('💡 Utilisez: npm run download:medias');
      return medias;
    } catch (error) {
      console.error('❌ Erreur extraction médias:', error.message);
      return null;
    }
  }

  async exportProducts() {
    if (process.env.EXPORT_PRODUCTS !== 'true') return;
    
    console.log('\n🛍️  Export des produits (si boutique)...');
    try {
      // API Front Kiubi - endpoint catalog/products.json
      const response = await this.client.get('/catalog/products.json');
      const responseData = response.data;
      const products = responseData.data || [];
      
      await fs.writeJSON(
        path.join(this.exportDir, 'products', 'all-products.json'),
        products,
        { spaces: 2 }
      );
      
      console.log(`✅ ${products.length} produits exportés`);
      return products;
    } catch (error) {
      console.log('ℹ️  Pas de produits ou endpoint non disponible');
      return null;
    }
  }

  async exportAll() {
    console.log('🚀 Début de l\'export API Kiubi Front\n');
    console.log(`API: ${this.apiUrl}`);
    
    await this.ensureExportDirs();
    
    const results = {
      posts: await this.exportPosts(),
      pages: await this.exportPages(),
      categories: await this.exportCategories(),
      medias: await this.exportMedias(),
      products: await this.exportProducts()
    };
    
    // Rapport d'export
    const report = {
      date: new Date().toISOString(),
      apiUrl: this.apiUrl,
      results: {
        posts: results.posts?.length || 0,
        pages: results.pages?.length || 0,
        categories: results.categories?.length || 0,
        medias: results.medias?.length || 0,
        products: results.products?.length || 0
      }
    };
    
    await fs.writeJSON(
      path.join(this.exportDir, 'export-report.json'),
      report,
      { spaces: 2 }
    );
    
    console.log('\n✅ Export terminé !');
    console.log('\n📊 Rapport:');
    console.log(JSON.stringify(report.results, null, 2));
    console.log(`\n📁 Fichiers exportés dans: ${this.exportDir}`);
  }
}

// Exécution
if (require.main === module) {
  const exporter = new KiubiExporter();
  exporter.exportAll().catch(error => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = KiubiExporter;
