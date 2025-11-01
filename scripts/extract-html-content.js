import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseDir = path.join(__dirname, '../site_static_mirror/www.in-vivo-expert.fr');

// Liste des pages à extraire
const pages = [
  'combien-coute-expert-ce.html',
  'nous-recrutons.html',
  'formations.html',
  'about.html',
  'examen-des-comptes-annuels.html',
  'examen-des-comptes-previsionnels.html',
  'examen-des-orientations-strategiques.html',
  'assistance-de-la-commission-economique.html',
  'assistance-procedure-d-alerte.html',
  'assistance-plan-de-licenciement.html',
  'assistance-operations-de-concentration.html',
  'assistance-rapport-annuel-d-activite-de-gestion.html',
  'assistance-compte-rendu-de-fin-de-mandat.html',
  'contrat-d-assistance-permanente.html'
];

// Fonction pour extraire le contenu textuel d'un HTML
function extractContent(html) {
  // Extraire les balises <article class="post_simple"> et leur contenu
  const articles = [];
  const articleRegex = /<article class="post_simple">([\s\S]*?)<\/article>/g;
  let match;
  
  while ((match = articleRegex.exec(html)) !== null) {
    const articleContent = match[1];
    
    // Extraire le titre (h1 ou h2)
    const titleMatch = articleContent.match(/<h[12]>(.*?)<\/h[12]>/);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : '';
    
    // Extraire le contenu
    const contentMatch = articleContent.match(/<article class="post_content">([\s\S]*?)<\/article>/);
    let content = contentMatch ? contentMatch[1] : '';
    
    // Nettoyer le HTML mais garder la structure
    content = content
      .replace(/<script[\s\S]*?<\/script>/g, '')
      .replace(/<style[\s\S]*?<\/style>/g, '')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<\/p>/g, '\n\n')
      .replace(/<p[^>]*>/g, '')
      .replace(/<\/li>/g, '\n')
      .replace(/<li[^>]*>/g, '- ')
      .replace(/<ul[^>]*>/g, '\n')
      .replace(/<\/ul>/g, '\n')
      .replace(/<a[^>]*>(.*?)<\/a>/g, '$1')
      .replace(/<[^>]*>/g, '')
      .replace(/&eacute;/g, 'é')
      .replace(/&egrave;/g, 'è')
      .replace(/&agrave;/g, 'à')
      .replace(/&ugrave;/g, 'ù')
      .replace(/&ocirc;/g, 'ô')
      .replace(/&ucirc;/g, 'û')
      .replace(/&ccedil;/g, 'ç')
      .replace(/&rsquo;/g, "'")
      .replace(/&lsquo;/g, "'")
      .replace(/&ldquo;/g, '"')
      .replace(/&rdquo;/g, '"')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/\n\n\n+/g, '\n\n')
      .trim();
    
    if (title && title !== 'ne surtout pas supprimer ce billet. contient l\'image de fond') {
      articles.push({ title, content });
    }
  }
  
  return articles;
}

async function main() {
  console.log('\n📄 EXTRACTION DU CONTENU HTML\n');
  
  const results = {};
  
  for (const page of pages) {
    const filePath = path.join(baseDir, page);
    
    if (!await fs.pathExists(filePath)) {
      console.log(`⚠️  ${page} - Non trouvé`);
      continue;
    }
    
    const html = await fs.readFile(filePath, 'latin1'); // Encodage correct pour Kiubi
    const articles = extractContent(html);
    
    results[page] = articles;
    console.log(`✅ ${page} - ${articles.length} section(s) extraite(s)`);
  }
  
  // Sauvegarder en JSON
  const exportPath = path.join(__dirname, '../exports/pages-content.json');
  await fs.writeJson(exportPath, results, { spaces: 2 });
  
  // Sauvegarder en Markdown
  let markdown = '# 📄 CONTENU DES PAGES HTML - IN VIVO EXPERT\n\n';
  markdown += `Extraction effectuée le ${new Date().toLocaleDateString('fr-FR')}\n\n`;
  markdown += '---\n\n';
  
  for (const [page, articles] of Object.entries(results)) {
    markdown += `## 📄 ${page.replace('.html', '').replace(/-/g, ' ').toUpperCase()}\n\n`;
    
    articles.forEach((article, index) => {
      if (article.title) {
        markdown += `### ${article.title}\n\n`;
      }
      markdown += `${article.content}\n\n`;
      if (index < articles.length - 1) {
        markdown += '---\n\n';
      }
    });
    
    markdown += '\n---\n\n';
  }
  
  const mdPath = path.join(__dirname, '../PAGES-CONTENT.md');
  await fs.writeFile(mdPath, markdown, 'utf-8');
  
  console.log('\n✅ Extraction terminée !');
  console.log('📁 Fichiers créés :');
  console.log('   - exports/pages-content.json');
  console.log('   - PAGES-CONTENT.md\n');
}

main();
