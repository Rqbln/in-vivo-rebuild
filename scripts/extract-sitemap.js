/**
 * Script d'extraction du sitemap.xml
 * Parse le sitemap et génère la liste des URLs pour les redirections 301
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const xml2js = require('xml2js');

class SitemapExtractor {
  constructor() {
    this.siteUrl = process.env.SITE_URL || 'https://www.in-vivo-expert.fr';
    this.exportDir = path.join(__dirname, '..', 'exports');
  }

  async fetchSitemap() {
    console.log(`\n🗺️  Récupération du sitemap depuis ${this.siteUrl}/sitemap.xml`);
    
    try {
      const response = await axios.get(`${this.siteUrl}/sitemap.xml`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du sitemap:', error.message);
      
      // Essayer aussi sitemap_index.xml
      try {
        console.log('🔄 Tentative avec sitemap_index.xml...');
        const response = await axios.get(`${this.siteUrl}/sitemap_index.xml`);
        return response.data;
      } catch (err) {
        throw new Error('Impossible de récupérer le sitemap');
      }
    }
  }

  async parseSitemap(xmlContent) {
    console.log('\n📝 Parsing du sitemap XML...');
    
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlContent);
    
    const urls = [];
    
    // Gestion sitemap standard
    if (result.urlset && result.urlset.url) {
      for (const url of result.urlset.url) {
        urls.push({
          loc: url.loc[0],
          lastmod: url.lastmod ? url.lastmod[0] : null,
          changefreq: url.changefreq ? url.changefreq[0] : null,
          priority: url.priority ? url.priority[0] : null
        });
      }
    }
    
    // Gestion sitemap index (multiple sitemaps)
    if (result.sitemapindex && result.sitemapindex.sitemap) {
      console.log('📚 Sitemap index détecté, récupération des sous-sitemaps...');
      
      for (const sitemap of result.sitemapindex.sitemap) {
        const sitemapUrl = sitemap.loc[0];
        console.log(`  → ${sitemapUrl}`);
        
        try {
          const response = await axios.get(sitemapUrl);
          const subUrls = await this.parseSitemap(response.data);
          urls.push(...subUrls);
        } catch (error) {
          console.error(`  ❌ Erreur sur ${sitemapUrl}:`, error.message);
        }
      }
    }
    
    return urls;
  }

  generateRedirectsTable(urls) {
    console.log('\n🔀 Génération de la table de redirections...');
    
    const redirects = urls.map(url => {
      const oldPath = new URL(url.loc).pathname;
      // Vous devrez adapter le nouveau chemin selon votre structure Lovable
      const newPath = oldPath; // À personnaliser
      
      return {
        oldUrl: url.loc,
        oldPath: oldPath,
        newPath: newPath,
        status: 301,
        lastmod: url.lastmod,
        priority: url.priority
      };
    });
    
    return redirects;
  }

  async exportResults(urls, redirects) {
    await fs.ensureDir(this.exportDir);
    
    // Export des URLs brutes
    await fs.writeJSON(
      path.join(this.exportDir, 'sitemap-urls.json'),
      urls,
      { spaces: 2 }
    );
    
    // Export de la table de redirections
    await fs.writeJSON(
      path.join(this.exportDir, 'redirects-301.json'),
      redirects,
      { spaces: 2 }
    );
    
    // Export CSV pour Excel/Google Sheets
    const csvLines = ['Old URL,Old Path,New Path,Status,Last Modified,Priority'];
    redirects.forEach(r => {
      csvLines.push(`"${r.oldUrl}","${r.oldPath}","${r.newPath}",${r.status},"${r.lastmod || ''}","${r.priority || ''}"`);
    });
    
    await fs.writeFile(
      path.join(this.exportDir, 'redirects-301.csv'),
      csvLines.join('\n')
    );
    
    // Export format Netlify _redirects
    const netlifyRedirects = redirects
      .map(r => `${r.oldPath} ${r.newPath} ${r.status}`)
      .join('\n');
    
    await fs.writeFile(
      path.join(this.exportDir, '_redirects'),
      netlifyRedirects
    );
    
    // Export format Vercel vercel.json
    const vercelConfig = {
      redirects: redirects.map(r => ({
        source: r.oldPath,
        destination: r.newPath,
        permanent: true
      }))
    };
    
    await fs.writeJSON(
      path.join(this.exportDir, 'vercel-redirects.json'),
      vercelConfig,
      { spaces: 2 }
    );
    
    console.log('\n✅ Fichiers exportés:');
    console.log('   - sitemap-urls.json (liste complète des URLs)');
    console.log('   - redirects-301.json (table de redirections)');
    console.log('   - redirects-301.csv (format Excel)');
    console.log('   - _redirects (format Netlify)');
    console.log('   - vercel-redirects.json (format Vercel)');
  }

  async extract() {
    console.log('🚀 Extraction du sitemap\n');
    console.log(`Site: ${this.siteUrl}`);
    
    try {
      const xmlContent = await this.fetchSitemap();
      const urls = await this.parseSitemap(xmlContent);
      
      console.log(`\n✅ ${urls.length} URLs trouvées`);
      
      const redirects = this.generateRedirectsTable(urls);
      await this.exportResults(urls, redirects);
      
      // Rapport
      const report = {
        date: new Date().toISOString(),
        siteUrl: this.siteUrl,
        totalUrls: urls.length,
        sample: urls.slice(0, 5).map(u => u.loc)
      };
      
      await fs.writeJSON(
        path.join(this.exportDir, 'sitemap-report.json'),
        report,
        { spaces: 2 }
      );
      
      console.log(`\n📁 Fichiers sauvegardés dans: ${this.exportDir}`);
      console.log('\n💡 Prochaines étapes:');
      console.log('   1. Vérifiez les URLs dans sitemap-urls.json');
      console.log('   2. Adaptez les chemins dans redirects-301.json selon votre nouvelle structure');
      console.log('   3. Utilisez _redirects ou vercel-redirects.json lors du déploiement');
      
    } catch (error) {
      console.error('\n❌ Erreur:', error.message);
      process.exit(1);
    }
  }
}

// Exécution
if (require.main === module) {
  const extractor = new SitemapExtractor();
  extractor.extract().catch(error => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = SitemapExtractor;
