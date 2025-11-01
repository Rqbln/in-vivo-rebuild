/**
 * Script d'analyse du site existant
 * Analyse la capture statique pour générer un rapport de structure
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

class SiteAnalyzer {
  constructor() {
    this.staticDir = path.join(__dirname, '..', 'site_static_mirror');
    this.outputDir = path.join(__dirname, '..', 'exports');
  }

  async analyzeSite() {
    console.log('🔍 Analyse du site capturé\n');

    if (!(await fs.pathExists(this.staticDir))) {
      console.error('❌ Dossier site_static_mirror non trouvé');
      console.log('💡 Lancez d\'abord: npm run export:static');
      return;
    }

    const report = {
      date: new Date().toISOString(),
      structure: {},
      files: {
        html: [],
        css: [],
        js: [],
        images: [],
        fonts: [],
        other: []
      },
      stats: {
        totalFiles: 0,
        totalSize: 0,
        byType: {}
      },
      pages: []
    };

    // Trouver tous les fichiers
    const allFiles = glob.sync('**/*', {
      cwd: this.staticDir,
      nodir: true
    });

    console.log(`📁 ${allFiles.length} fichiers trouvés\n`);

    // Analyser chaque fichier
    for (const file of allFiles) {
      const fullPath = path.join(this.staticDir, file);
      const stats = await fs.stat(fullPath);
      const ext = path.extname(file).toLowerCase();

      report.stats.totalFiles++;
      report.stats.totalSize += stats.size;

      // Catégoriser par type
      if (ext === '.html' || ext === '.htm') {
        report.files.html.push(file);
        await this.analyzePage(fullPath, file, report);
      } else if (ext === '.css') {
        report.files.css.push(file);
      } else if (ext === '.js') {
        report.files.js.push(file);
      } else if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'].includes(ext)) {
        report.files.images.push(file);
      } else if (['.woff', '.woff2', '.ttf', '.eot'].includes(ext)) {
        report.files.fonts.push(file);
      } else {
        report.files.other.push(file);
      }

      // Stats par type
      report.stats.byType[ext] = (report.stats.byType[ext] || 0) + 1;
    }

    // Générer le rapport
    await this.generateReport(report);
  }

  async analyzePage(filePath, relativePath, report) {
    try {
      const content = await fs.readFile(filePath, 'utf8');

      // Extraire le title
      const titleMatch = content.match(/<title>(.*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : 'Sans titre';

      // Extraire meta description
      const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
      const description = descMatch ? descMatch[1] : '';

      // Détecter le type de page
      let pageType = 'page';
      if (relativePath.includes('/blog/') || relativePath.includes('/article')) {
        pageType = 'blog-post';
      } else if (relativePath.includes('index.html') || relativePath === 'index.html') {
        pageType = 'homepage';
      } else if (relativePath.includes('/contact')) {
        pageType = 'contact';
      }

      report.pages.push({
        path: relativePath,
        title,
        description,
        type: pageType,
        size: (await fs.stat(filePath)).size
      });

    } catch (error) {
      // Ignorer les erreurs de parsing
    }
  }

  async generateReport(report) {
    console.log('\n📊 Statistiques du site:\n');
    console.log(`📄 Pages HTML: ${report.files.html.length}`);
    console.log(`🎨 Fichiers CSS: ${report.files.css.length}`);
    console.log(`⚙️  Fichiers JS: ${report.files.js.length}`);
    console.log(`🖼️  Images: ${report.files.images.length}`);
    console.log(`🔤 Fonts: ${report.files.fonts.length}`);
    console.log(`📦 Autres: ${report.files.other.length}`);
    console.log(`\n💾 Taille totale: ${(report.stats.totalSize / 1024 / 1024).toFixed(2)} MB`);

    // Sauvegarder le rapport
    await fs.writeJSON(
      path.join(this.outputDir, 'site-analysis.json'),
      report,
      { spaces: 2 }
    );

    // Générer un rapport Markdown lisible
    const markdown = this.generateMarkdownReport(report);
    await fs.writeFile(
      path.join(this.outputDir, 'site-analysis.md'),
      markdown
    );

    console.log(`\n✅ Rapport sauvegardé:`);
    console.log(`   - exports/site-analysis.json`);
    console.log(`   - exports/site-analysis.md`);
  }

  generateMarkdownReport(report) {
    const pages = report.pages.sort((a, b) => a.path.localeCompare(b.path));

    return `# Analyse du site In Vivo Expert

**Date d'analyse:** ${new Date(report.date).toLocaleString('fr-FR')}

## 📊 Statistiques globales

- **Total de fichiers:** ${report.stats.totalFiles}
- **Taille totale:** ${(report.stats.totalSize / 1024 / 1024).toFixed(2)} MB
- **Pages HTML:** ${report.files.html.length}
- **Feuilles de style CSS:** ${report.files.css.length}
- **Scripts JavaScript:** ${report.files.js.length}
- **Images:** ${report.files.images.length}
- **Fonts:** ${report.files.fonts.length}

## 📑 Liste des pages

${pages.map(page => `
### ${page.title}

- **Chemin:** \`${page.path}\`
- **Type:** ${page.type}
- **Description:** ${page.description || 'Aucune'}
- **Taille:** ${(page.size / 1024).toFixed(2)} KB
`).join('\n')}

## 🎨 Ressources CSS

${report.files.css.map(css => `- \`${css}\``).join('\n')}

## ⚙️ Scripts JavaScript

${report.files.js.map(js => `- \`${js}\``).join('\n')}

## 🖼️ Images principales

${report.files.images.slice(0, 20).map(img => `- \`${img}\``).join('\n')}

${report.files.images.length > 20 ? `\n... et ${report.files.images.length - 20} autres images` : ''}

---

*Rapport généré automatiquement*
`;
  }
}

// Exécution
if (require.main === module) {
  const analyzer = new SiteAnalyzer();
  analyzer.analyzeSite().catch(error => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = SiteAnalyzer;
