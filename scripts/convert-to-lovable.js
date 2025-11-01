/**
 * Script de conversion pour Lovable
 * Transforme les exports Kiubi en format compatible Lovable (React/Markdown)
 */

require('dotenv').config();
const fs = require('fs-extra');
const path = require('path');
const TurndownService = require('turndown');

class LovableConverter {
  constructor() {
    this.exportDir = path.join(__dirname, '..', 'exports');
    this.outputDir = path.join(__dirname, '..', 'lovable-ready');
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    });
  }

  async ensureOutputDirs() {
    const dirs = ['content', 'content/posts', 'content/pages', 'components', 'public/images'];
    for (const dir of dirs) {
      await fs.ensureDir(path.join(this.outputDir, dir));
    }
  }

  sanitizeFilename(title) {
    return title
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  convertHtmlToMarkdown(html) {
    if (!html) return '';
    return this.turndownService.turndown(html);
  }

  async convertPosts() {
    console.log('\n📝 Conversion des posts en Markdown...');
    
    const postsFile = path.join(this.exportDir, 'posts', 'all-posts.json');
    
    if (!(await fs.pathExists(postsFile))) {
      console.log('ℹ️  Pas de fichier posts trouvé');
      return;
    }
    
    const posts = await fs.readJSON(postsFile);
    let converted = 0;
    
    if (Array.isArray(posts)) {
      for (const post of posts) {
        const filename = this.sanitizeFilename(post.title || post.name || `post-${post.id}`);
        const content = this.convertHtmlToMarkdown(post.content || post.body || '');
        
        // Format frontmatter Markdown
        const markdown = `---
title: "${post.title || post.name || ''}"
date: ${post.created_at || post.date || new Date().toISOString()}
author: "${post.author || 'In Vivo Expert'}"
category: "${post.category || 'Non classé'}"
slug: ${filename}
excerpt: "${post.excerpt || post.summary || ''}"
featured_image: "${post.image || ''}"
---

${content}
`;
        
        await fs.writeFile(
          path.join(this.outputDir, 'content', 'posts', `${filename}.md`),
          markdown
        );
        
        converted++;
      }
    }
    
    console.log(`✅ ${converted} posts convertis en Markdown`);
  }

  async convertPages() {
    console.log('\n📄 Conversion des pages en Markdown...');
    
    const pagesFile = path.join(this.exportDir, 'pages', 'all-pages.json');
    
    if (!(await fs.pathExists(pagesFile))) {
      console.log('ℹ️  Pas de fichier pages trouvé');
      return;
    }
    
    const pages = await fs.readJSON(pagesFile);
    let converted = 0;
    
    if (Array.isArray(pages)) {
      for (const page of pages) {
        const filename = this.sanitizeFilename(page.title || page.name || `page-${page.id}`);
        const content = this.convertHtmlToMarkdown(page.content || page.body || '');
        
        const markdown = `---
title: "${page.title || page.name || ''}"
layout: ${page.template || 'default'}
slug: ${filename}
description: "${page.description || page.meta_description || ''}"
---

${content}
`;
        
        await fs.writeFile(
          path.join(this.outputDir, 'content', 'pages', `${filename}.md`),
          markdown
        );
        
        converted++;
      }
    }
    
    console.log(`✅ ${converted} pages converties en Markdown`);
  }

  async generateReactComponents() {
    console.log('\n⚛️  Génération des composants React de base...');
    
    // Composant Blog Post
    const blogPostComponent = `import React from 'react';

interface BlogPostProps {
  title: string;
  date: string;
  author: string;
  content: string;
  featuredImage?: string;
  category?: string;
}

export const BlogPost: React.FC<BlogPostProps> = ({
  title,
  date,
  author,
  content,
  featuredImage,
  category
}) => {
  return (
    <article className="blog-post">
      {featuredImage && (
        <img 
          src={featuredImage} 
          alt={title}
          className="featured-image"
        />
      )}
      <header>
        <h1>{title}</h1>
        <div className="meta">
          <time dateTime={date}>{new Date(date).toLocaleDateString('fr-FR')}</time>
          <span className="author">Par {author}</span>
          {category && <span className="category">{category}</span>}
        </div>
      </header>
      <div 
        className="content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  );
};
`;
    
    await fs.writeFile(
      path.join(this.outputDir, 'components', 'BlogPost.tsx'),
      blogPostComponent
    );
    
    // Composant Page
    const pageComponent = `import React from 'react';

interface PageProps {
  title: string;
  content: string;
  description?: string;
}

export const Page: React.FC<PageProps> = ({
  title,
  content,
  description
}) => {
  return (
    <div className="page">
      <header>
        <h1>{title}</h1>
        {description && <p className="description">{description}</p>}
      </header>
      <div 
        className="content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};
`;
    
    await fs.writeFile(
      path.join(this.outputDir, 'components', 'Page.tsx'),
      pageComponent
    );
    
    console.log('✅ Composants React générés');
  }

  async generateDataIndex() {
    console.log('\n📇 Génération de l\'index des données...');
    
    const index = {
      posts: [],
      pages: [],
      categories: []
    };
    
    // Index des posts
    const postsDir = path.join(this.outputDir, 'content', 'posts');
    if (await fs.pathExists(postsDir)) {
      const postFiles = await fs.readdir(postsDir);
      index.posts = postFiles.map(f => ({
        filename: f,
        slug: f.replace('.md', ''),
        path: `/content/posts/${f}`
      }));
    }
    
    // Index des pages
    const pagesDir = path.join(this.outputDir, 'content', 'pages');
    if (await fs.pathExists(pagesDir)) {
      const pageFiles = await fs.readdir(pagesDir);
      index.pages = pageFiles.map(f => ({
        filename: f,
        slug: f.replace('.md', ''),
        path: `/content/pages/${f}`
      }));
    }
    
    await fs.writeJSON(
      path.join(this.outputDir, 'content-index.json'),
      index,
      { spaces: 2 }
    );
    
    console.log('✅ Index généré');
  }

  async convert() {
    console.log('🚀 Conversion pour Lovable\n');
    
    await this.ensureOutputDirs();
    await this.convertPosts();
    await this.convertPages();
    await this.generateReactComponents();
    await this.generateDataIndex();
    
    // Copier les assets nécessaires
    console.log('\n📦 Préparation du package Lovable...');
    
    const readme = `# Site In Vivo Expert - Package Lovable

Ce package contient le contenu migré depuis Kiubi, prêt à être intégré dans Lovable.

## Structure

- \`content/posts/\` : Articles de blog en Markdown
- \`content/pages/\` : Pages statiques en Markdown
- \`components/\` : Composants React de base
- \`content-index.json\` : Index de tous les contenus

## Utilisation dans Lovable

1. Copiez le dossier \`content/\` dans votre projet Lovable
2. Importez les composants depuis \`components/\`
3. Utilisez \`content-index.json\` pour la navigation

## Prochaines étapes

- [ ] Adapter les styles CSS
- [ ] Configurer les routes
- [ ] Intégrer les images (voir exports/medias/)
- [ ] Configurer les redirections 301
- [ ] Tester tous les liens internes

Généré le: ${new Date().toISOString()}
`;
    
    await fs.writeFile(
      path.join(this.outputDir, 'README.md'),
      readme
    );
    
    console.log('\n✅ Conversion terminée !');
    console.log(`📁 Package Lovable prêt dans: ${this.outputDir}`);
    console.log('\n📋 Contenu généré:');
    console.log('   - Fichiers Markdown (posts & pages)');
    console.log('   - Composants React (BlogPost, Page)');
    console.log('   - Index JSON pour navigation');
    console.log('   - README avec instructions');
  }
}

// Exécution
if (require.main === module) {
  const converter = new LovableConverter();
  converter.convert().catch(error => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = LovableConverter;
