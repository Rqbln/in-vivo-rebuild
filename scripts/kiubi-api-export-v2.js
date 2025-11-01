/**
 * Script d'export API Kiubi - VERSION OPTIMISÉE v2
 * Basé sur l'analyse complète de la documentation API (4240 lignes)
 * 
 * STRATÉGIES D'OPTIMISATION :
 * 1. Utilise /search endpoints pour récupération plus efficace
 * 2. Monitoring du quota via /rate.json (ne consomme PAS de requête)
 * 3. Sauvegardes incrémentales pour éviter perte de données
 * 4. Gestion intelligente du rate limit (120 req/5min)
 * 5. Export de la configuration du site (/prefs)
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

class KiubiExporterV2 {
  constructor() {
    this.apiUrl = process.env.KIUBI_API_URL || 'https://www.in-vivo-expert.fr/api/v1';
    this.exportDir = path.join(__dirname, '..', 'exports');
    this.maxPagesPerCall = 50; // Limite de sécurité
    
    if (!this.apiUrl) {
      throw new Error('❌ KIUBI_API_URL doit être configuré dans .env');
    }

    // API Front publique - pas d'authentification requise
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      timeout: 30000
    });
  }

  async ensureExportDirs() {
    const dirs = ['posts', 'pages', 'categories', 'medias', 'products', 'config'];
    for (const dir of dirs) {
      await fs.ensureDir(path.join(this.exportDir, dir));
    }
  }

  async checkQuota() {
    try {
      // Endpoint spécial qui NE CONSOMME PAS de quota
      const response = await this.client.get('/rate.json');
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch (error) {
      console.log('⚠️  Impossible de vérifier le quota');
    }
    return null;
  }

  async waitForQuota(seconds = 300) {
    console.log(`⏸️  Pause de ${seconds}s pour recharge du quota...`);
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
    console.log('▶️  Reprise de l\'export...');
  }

  async exportSiteConfig() {
    console.log('\n⚙️  Export configuration du site...');
    
    const config = {};
    
    try {
      // Préférences du site
      const siteResponse = await this.client.get('/prefs/site.json');
      if (siteResponse.data && siteResponse.data.data) {
        config.site = siteResponse.data.data;
        console.log('  ✓ Préférences site récupérées');
      }
    } catch (error) {
      console.log('  ℹ️  Préférences site non disponibles');
    }
    
    try {
      // Préférences blog
      const blogResponse = await this.client.get('/prefs/blog.json');
      if (blogResponse.data && blogResponse.data.data) {
        config.blog = blogResponse.data.data;
        console.log('  ✓ Préférences blog récupérées');
      }
    } catch (error) {
      console.log('  ℹ️  Préférences blog non disponibles');
    }
    
    try {
      // Préférences médias
      const mediaResponse = await this.client.get('/prefs/medias.json');
      if (mediaResponse.data && mediaResponse.data.data) {
        config.medias = mediaResponse.data.data;
        console.log('  ✓ Préférences médias récupérées');
      }
    } catch (error) {
      console.log('  ℹ️  Préférences médias non disponibles');
    }
    
    await fs.writeJSON(
      path.join(this.exportDir, 'config', 'site-config.json'),
      config,
      { spaces: 2 }
    );
    
    console.log('✅ Configuration exportée');
    return config;
  }

  async exportPosts() {
    if (process.env.EXPORT_POSTS !== 'true') return;
    
    console.log('\n📝 Export des articles de blog...');
    console.log('   Stratégie: endpoint /blog/posts.json avec pagination optimisée\n');
    
    try {
      const allPosts = [];
      let page = 0;
      let hasMore = true;
      let totalItems = 0;
      
      // Vérification quota initial
      const quota = await this.checkQuota();
      if (quota) {
        console.log(`📊 Quota initial: ${quota.rate_remaining || 'N/A'} requêtes disponibles`);
      }
      
      // Première requête pour connaître le total
      console.log('  → Récupération info totales...');
      const initialResponse = await this.client.get('/blog/posts.json', {
        params: {
          limit: 20,
          page: 0,
          sort: '-date'
        }
      });
      
      const initialData = initialResponse.data;
      if (initialData && initialData.data) {
        allPosts.push(...initialData.data);
        
        if (initialData.meta && initialData.meta.items_count) {
          totalItems = initialData.meta.items_count;
          const totalPages = Math.ceil(totalItems / 20);
          console.log(`  📊 ${totalItems} articles trouvés (${totalPages} pages)`);
          console.log(`  ⏱️  Temps estimé: ${Math.ceil(totalPages * 1.2 / 60)} minutes\n`);
          
          page = 1; // On a déjà page 0
          
          // Récupération des pages suivantes
          while (hasMore && page < Math.min(totalPages, this.maxPagesPerCall)) {
            // Vérification quota tous les 50 appels
            if (page % 50 === 0) {
              const currentQuota = await this.checkQuota();
              if (currentQuota && currentQuota.rate_remaining) {
                console.log(`\n  📊 Quota actuel: ${currentQuota.rate_remaining} requêtes`);
                
                if (currentQuota.rate_remaining < 10) {
                  console.log('  ⚠️  Quota faible - sauvegarde et pause...');
                  await fs.writeJSON(
                    path.join(this.exportDir, 'posts', 'all-posts.json'),
                    allPosts,
                    { spaces: 2 }
                  );
                  await this.waitForQuota(300); // 5 minutes
                }
              }
            }
            
            const response = await this.client.get('/blog/posts.json', {
              params: {
                limit: 20,
                page: page,
                sort: '-date'
              }
            });
            
            const responseData = response.data;
            if (responseData && responseData.data && responseData.data.length > 0) {
              allPosts.push(...responseData.data);
              console.log(`  ✓ Page ${page + 1}/${totalPages} (${responseData.data.length} posts) - Total: ${allPosts.length}`);
              
              // Sauvegarde incrémentale tous les 10 pages
              if ((page + 1) % 10 === 0) {
                await fs.writeJSON(
                  path.join(this.exportDir, 'posts', 'all-posts.json'),
                  allPosts,
                  { spaces: 2 }
                );
                console.log(`  💾 Sauvegarde incrémentale (${allPosts.length} posts)\n`);
              }
              
              page++;
            } else {
              hasMore = false;
            }
            
            // Délai pour respecter rate limit
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          if (page >= this.maxPagesPerCall) {
            console.log(`\n⚠️  Limite de sécurité atteinte (${this.maxPagesPerCall} pages)`);
            console.log('💡 Relancez le script après 5 minutes pour continuer');
          }
        }
      }
      
      // Sauvegarde finale
      await fs.writeJSON(
        path.join(this.exportDir, 'posts', 'all-posts.json'),
        allPosts,
        { spaces: 2 }
      );
      
      console.log(`\n✅ ${allPosts.length} posts exportés sur ${totalItems} trouvés`);
      
      // Export individuel
      console.log('  → Export fichiers individuels...');
      for (const post of allPosts) {
        await fs.writeJSON(
          path.join(this.exportDir, 'posts', `post-${post.id}.json`),
          post,
          { spaces: 2 }
        );
      }
      console.log('  ✓ Fichiers individuels créés');
      
      return allPosts;
    } catch (error) {
      console.error('\n❌ Erreur export posts:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Détail:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  }

  async exportPages() {
    if (process.env.EXPORT_PAGES !== 'true') return;
    
    console.log('\n📄 Export des pages du site...');
    console.log('   Stratégie: endpoint /search/cms/pages.json avec extra_fields\n');
    
    try {
      const allPages = [];
      let page = 0;
      let hasMore = true;
      
      // Première requête
      console.log('  → Récupération des pages...');
      const initialResponse = await this.client.get('/search/cms/pages.json', {
        params: {
          term: '*', // Wildcard pour toutes les pages
          limit: 20,
          page: 0,
          extra_fields: 'texts' // Inclut text1-text15
        }
      });
      
      const initialData = initialResponse.data;
      if (initialData && initialData.data) {
        allPages.push(...initialData.data);
        
        if (initialData.meta && initialData.meta.items_count) {
          const totalItems = initialData.meta.items_count;
          const totalPages = Math.ceil(totalItems / 20);
          console.log(`  📊 ${totalItems} pages trouvées (${totalPages} pages API)\n`);
          
          page = 1;
          
          // Récupération des pages suivantes
          while (hasMore && page < Math.min(totalPages, this.maxPagesPerCall)) {
            const response = await this.client.get('/search/cms/pages.json', {
              params: {
                term: '*',
                limit: 20,
                page: page,
                extra_fields: 'texts'
              }
            });
            
            const responseData = response.data;
            if (responseData && responseData.data && responseData.data.length > 0) {
              allPages.push(...responseData.data);
              console.log(`  ✓ Page ${page + 1}/${totalPages} (${responseData.data.length} pages) - Total: ${allPages.length}`);
              
              // Sauvegarde incrémentale
              if ((page + 1) % 10 === 0) {
                await fs.writeJSON(
                  path.join(this.exportDir, 'pages', 'all-pages.json'),
                  allPages,
                  { spaces: 2 }
                );
                console.log(`  💾 Sauvegarde incrémentale\n`);
              }
              
              page++;
            } else {
              hasMore = false;
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      // Sauvegarde finale
      await fs.writeJSON(
        path.join(this.exportDir, 'pages', 'all-pages.json'),
        allPages,
        { spaces: 2 }
      );
      
      console.log(`\n✅ ${allPages.length} pages exportées`);
      
      // Export individuel
      for (const pg of allPages) {
        const pageId = pg.id || pg.page_slug || Math.random().toString(36).substring(7);
        await fs.writeJSON(
          path.join(this.exportDir, 'pages', `page-${pageId}.json`),
          pg,
          { spaces: 2 }
        );
      }
      
      return allPages;
    } catch (error) {
      console.error('\n❌ Erreur export pages:', error.message);
      console.log('💡 Les pages seront récupérées via wget (npm run export:static)');
      return null;
    }
  }

  async exportCategories() {
    if (process.env.EXPORT_CATEGORIES !== 'true') return;
    
    console.log('\n🗂️  Export des catégories...');
    try {
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
    
    console.log('\n🖼️  Extraction des URLs de médias...');
    
    try {
      const postsFile = path.join(this.exportDir, 'posts', 'all-posts.json');
      const pagesFile = path.join(this.exportDir, 'pages', 'all-pages.json');
      
      const mediaUrls = new Set();
      
      // Médias depuis les posts
      if (await fs.pathExists(postsFile)) {
        const posts = await fs.readJSON(postsFile);
        
        for (const post of posts) {
          // Vignettes
          if (post.thumb) {
            if (post.thumb.url) mediaUrls.add(post.thumb.url);
            if (post.thumb.url_miniature) mediaUrls.add(post.thumb.url_miniature);
            if (post.thumb.url_vignette) mediaUrls.add(post.thumb.url_vignette);
            if (post.thumb.url_g_miniature) mediaUrls.add(post.thumb.url_g_miniature);
            if (post.thumb.url_g_vignette) mediaUrls.add(post.thumb.url_g_vignette);
          }
          
          // Images dans le contenu
          if (post.content) {
            const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
            let match;
            while ((match = imgRegex.exec(post.content)) !== null) {
              mediaUrls.add(match[1]);
            }
          }
        }
        
        console.log(`  ✓ ${mediaUrls.size} médias trouvés dans les posts`);
      }
      
      // Médias depuis les pages
      if (await fs.pathExists(pagesFile)) {
        const pages = await fs.readJSON(pagesFile);
        const initialSize = mediaUrls.size;
        
        for (const page of pages) {
          // Champs text1-text15
          for (let i = 1; i <= 15; i++) {
            const textField = page[`text${i}`];
            if (textField) {
              const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
              let match;
              while ((match = imgRegex.exec(textField)) !== null) {
                mediaUrls.add(match[1]);
              }
            }
          }
        }
        
        console.log(`  ✓ ${mediaUrls.size - initialSize} médias supplémentaires dans les pages`);
      }
      
      const medias = Array.from(mediaUrls).map((url, index) => ({
        id: index + 1,
        url: url,
        filename: url.split('/').pop().split('?')[0] // Enlever query string
      }));
      
      await fs.writeJSON(
        path.join(this.exportDir, 'medias', 'all-medias.json'),
        medias,
        { spaces: 2 }
      );
      
      console.log(`✅ ${medias.length} URLs de médias extraites`);
      console.log('💡 Utilisez: npm run download:medias pour télécharger');
      return medias;
    } catch (error) {
      console.error('❌ Erreur extraction médias:', error.message);
      return null;
    }
  }

  async exportAll() {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║   🚀 KIUBI API EXPORTER V2 - VERSION OPTIMISÉE       ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log(`📍 API URL: ${this.apiUrl}`);
    console.log(`📁 Export vers: ${this.exportDir}\n`);
    
    await this.ensureExportDirs();
    
    // Quota initial
    const initialQuota = await this.checkQuota();
    if (initialQuota) {
      console.log(`📊 Quota disponible: ${initialQuota.rate_remaining || 'N/A'} requêtes`);
      console.log(`⏱️  Reset dans: ${initialQuota.rate_limit || 'N/A'} secondes\n`);
    }
    
    const results = {
      config: await this.exportSiteConfig(),
      categories: await this.exportCategories(),
      pages: await this.exportPages(),
      posts: await this.exportPosts(),
      medias: await this.exportMedias()
    };
    
    // Rapport final
    const report = {
      date: new Date().toISOString(),
      apiUrl: this.apiUrl,
      version: '2.0-optimized',
      results: {
        config: results.config ? 'exported' : 'failed',
        posts: results.posts?.length || 0,
        pages: results.pages?.length || 0,
        categories: results.categories?.length || 0,
        medias: results.medias?.length || 0
      }
    };
    
    await fs.writeJSON(
      path.join(this.exportDir, 'export-report-v2.json'),
      report,
      { spaces: 2 }
    );
    
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║   ✅ EXPORT TERMINÉ                                   ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log('📊 RAPPORT D\'EXPORT:');
    console.log(JSON.stringify(report.results, null, 2));
    console.log('\n💡 ÉTAPES SUIVANTES:');
    console.log('   1. npm run export:static  → Capture wget du site complet');
    console.log('   2. npm run download:medias → Téléchargement des images');
    console.log('   3. npm run convert:lovable → Conversion format Lovable\n');
    
    // Quota final
    const finalQuota = await this.checkQuota();
    if (finalQuota) {
      console.log(`📊 Quota restant: ${finalQuota.rate_remaining || 'N/A'} requêtes\n`);
    }
  }
}

// Exécution
if (require.main === module) {
  const exporter = new KiubiExporterV2();
  exporter.exportAll().catch(error => {
    console.error('\n╔════════════════════════════════════════════════════════╗');
    console.error('║   ❌ ERREUR FATALE                                    ║');
    console.error('╚════════════════════════════════════════════════════════╝\n');
    console.error(error);
    console.error('\n💾 Vérifiez exports/ pour données partielles sauvegardées\n');
    process.exit(1);
  });
}

module.exports = KiubiExporterV2;
