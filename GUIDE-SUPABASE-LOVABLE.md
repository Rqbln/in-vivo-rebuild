# 🚀 Guide Intégration Supabase + Lovable

**Projet :** In Vivo Expert  
**Base de données :** `in-vivo-rebuild`  
**Supabase URL :** `https://whivezkkzwgagherygzu.supabase.co`  
**Date :** 1er novembre 2025

---

## 📋 Vue d'ensemble

Ce guide explique comment connecter votre contenu `lovable-ready/` à Supabase pour créer un site dynamique avec :
- ✅ Articles de blog stockés dans Supabase
- ✅ Catégories gérées en base de données
- ✅ Images servies via Supabase Storage
- ✅ API automatique pour tout votre contenu

---

## 🔑 Configuration initiale

### 1. Variables d'environnement

Créez un fichier `.env.local` dans votre projet Lovable :

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://whivezkkzwgagherygzu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoaXZlemtrendnYWdoZXJ5Z3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMTc0NDUsImV4cCI6MjA3NzU5MzQ0NX0.6N66-o2WJWtNfxqdKKPArXr-TQbHd2R2nFYikqyXnjE
```

⚠️ **Important :** Ajoutez `.env.local` à votre `.gitignore` !

### 2. Installation du client Supabase

```bash
npm install @supabase/supabase-js
```

### 3. Configuration du client

Créez `lib/supabase.ts` :

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
```

---

## 🗄️ Structure de la base de données

### Tables à créer dans Supabase

#### 1. Table `categories`

```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut lire
CREATE POLICY "Enable read access for all users" ON categories
  FOR SELECT USING (true);
```

#### 2. Table `posts`

```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author TEXT,
  category_id INTEGER REFERENCES categories(id),
  featured_image TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut lire les posts publiés
CREATE POLICY "Enable read access for published posts" ON posts
  FOR SELECT USING (published_at IS NOT NULL AND published_at <= NOW());

-- Index pour les performances
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_published ON posts(published_at);
```

#### 3. Table `pages` (pour les pages statiques)

```sql
CREATE TABLE pages (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut lire
CREATE POLICY "Enable read access for all users" ON pages
  FOR SELECT USING (published_at IS NOT NULL AND published_at <= NOW());
```

#### 4. Table `redirects` (pour les 301)

```sql
CREATE TABLE redirects (
  id SERIAL PRIMARY KEY,
  from_path TEXT UNIQUE NOT NULL,
  to_path TEXT NOT NULL,
  status_code INTEGER DEFAULT 301,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut lire
CREATE POLICY "Enable read access for all users" ON redirects
  FOR SELECT USING (true);

-- Index pour les performances
CREATE INDEX idx_redirects_from ON redirects(from_path);
```

---

## 📤 Import des données dans Supabase

### Script d'import automatique

Créez `scripts/import-to-supabase.js` :

```javascript
import { createClient } from '@supabase/supabase-js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration Supabase
const supabaseUrl = 'https://whivezkkzwgagherygzu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoaXZlemtrendnYWdoZXJ5Z3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMTc0NDUsImV4cCI6MjA3NzU5MzQ0NX0.6N66-o2WJWtNfxqdKKPArXr-TQbHd2R2nFYikqyXnjE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importCategories() {
  console.log('📁 Import des catégories...');
  
  const categoriesPath = path.join(__dirname, '../lovable-ready/data/categories.json');
  const categories = await fs.readJson(categoriesPath);
  
  for (const category of categories) {
    const { data, error } = await supabase
      .from('categories')
      .upsert({
        slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
        name: category.name,
        description: category.description || null
      }, { onConflict: 'slug' });
    
    if (error) {
      console.error(`❌ Erreur pour ${category.name}:`, error.message);
    } else {
      console.log(`✅ ${category.name}`);
    }
  }
}

async function importPosts() {
  console.log('\n📝 Import des posts...');
  
  const postsDir = path.join(__dirname, '../lovable-ready/content/posts');
  const postFiles = await fs.readdir(postsDir);
  
  // D'abord, récupérer les IDs des catégories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, name');
  
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat.name] = cat.id;
    categoryMap[cat.slug] = cat.id;
  });
  
  for (const file of postFiles) {
    if (!file.endsWith('.md')) continue;
    
    const filePath = path.join(postsDir, file);
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Parser le frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!frontmatterMatch) continue;
    
    const frontmatter = {};
    frontmatterMatch[1].split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
        frontmatter[key.trim()] = value;
      }
    });
    
    const postContent = frontmatterMatch[2].trim();
    
    // Trouver l'ID de la catégorie
    const categoryId = categoryMap[frontmatter.category] || null;
    
    const { data, error } = await supabase
      .from('posts')
      .upsert({
        title: frontmatter.title,
        slug: frontmatter.slug || file.replace('.md', ''),
        content: postContent,
        excerpt: frontmatter.excerpt || null,
        author: frontmatter.author || 'In Vivo Expert',
        category_id: categoryId,
        featured_image: frontmatter.image || null,
        published_at: frontmatter.date || new Date().toISOString()
      }, { onConflict: 'slug' });
    
    if (error) {
      console.error(`❌ Erreur pour ${frontmatter.title}:`, error.message);
    } else {
      console.log(`✅ ${frontmatter.title}`);
    }
  }
}

async function importRedirects() {
  console.log('\n🔀 Import des redirections...');
  
  const redirectsPath = path.join(__dirname, '../lovable-ready/config/redirects-301.json');
  const redirects = await fs.readJson(redirectsPath);
  
  for (const redirect of redirects) {
    const { data, error } = await supabase
      .from('redirects')
      .upsert({
        from_path: redirect.from,
        to_path: redirect.to,
        status_code: 301
      }, { onConflict: 'from_path' });
    
    if (error) {
      console.error(`❌ Erreur pour ${redirect.from}:`, error.message);
    } else {
      console.log(`✅ ${redirect.from} → ${redirect.to}`);
    }
  }
}

async function main() {
  console.log('🚀 Import des données vers Supabase\n');
  
  await importCategories();
  await importPosts();
  await importRedirects();
  
  console.log('\n✅ Import terminé !');
}

main().catch(console.error);
```

### Exécution de l'import

```bash
node scripts/import-to-supabase.js
```

---

## 📦 Upload des images vers Supabase Storage

### 1. Créer un bucket dans Supabase

Dans le dashboard Supabase :
1. Allez dans **Storage**
2. Créez un nouveau bucket : `images`
3. Rendez-le **public**

### 2. Script d'upload

Créez `scripts/upload-images-supabase.js` :

```javascript
import { createClient } from '@supabase/supabase-js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseUrl = 'https://whivezkkzwgagherygzu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoaXZlemtrendnYWdoZXJ5Z3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMTc0NDUsImV4cCI6MjA3NzU5MzQ0NX0.6N66-o2WJWtNfxqdKKPArXr-TQbHd2R2nFYikqyXnjE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadImages() {
  console.log('🖼️  Upload des images vers Supabase Storage...\n');
  
  const imagesDir = path.join(__dirname, '../lovable-ready/public/images');
  const imageFiles = await fs.readdir(imagesDir);
  
  for (const file of imageFiles) {
    if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) continue;
    
    const filePath = path.join(imagesDir, file);
    const fileBuffer = await fs.readFile(filePath);
    
    const { data, error } = await supabase.storage
      .from('images')
      .upload(file, fileBuffer, {
        contentType: `image/${path.extname(file).slice(1)}`,
        upsert: true
      });
    
    if (error) {
      console.error(`❌ ${file}:`, error.message);
    } else {
      const publicUrl = supabase.storage
        .from('images')
        .getPublicUrl(file).data.publicUrl;
      
      console.log(`✅ ${file}`);
      console.log(`   URL: ${publicUrl}\n`);
    }
  }
  
  console.log('✅ Upload terminé !');
}

uploadImages().catch(console.error);
```

### Exécution de l'upload

```bash
node scripts/upload-images-supabase.js
```

---

## 🎨 Utilisation dans Lovable

### Composant Liste de Posts

Créez `components/BlogList.tsx` :

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  published_at: string;
  featured_image: string;
  category: {
    name: string;
    slug: string;
  };
}

export default function BlogList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          slug,
          excerpt,
          author,
          published_at,
          featured_image,
          category:categories(name, slug)
        `)
        .order('published_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Erreur:', error);
      } else {
        setPosts(data || []);
      }
      
      setLoading(false);
    }

    fetchPosts();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <article key={post.id} className="border rounded-lg p-6 hover:shadow-lg transition">
          {post.featured_image && (
            <img 
              src={post.featured_image} 
              alt={post.title}
              className="w-full h-48 object-cover rounded mb-4"
            />
          )}
          
          <div className="text-sm text-gray-500 mb-2">
            {post.category?.name} • {new Date(post.published_at).toLocaleDateString('fr-FR')}
          </div>
          
          <h2 className="text-xl font-bold mb-2">
            <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
              {post.title}
            </Link>
          </h2>
          
          <p className="text-gray-600 mb-4">{post.excerpt}</p>
          
          <Link 
            href={`/blog/${post.slug}`}
            className="text-blue-600 hover:underline"
          >
            Lire la suite →
          </Link>
        </article>
      ))}
    </div>
  );
}
```

### Page Article Individuel

Créez `app/blog/[slug]/page.tsx` :

```typescript
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function BlogPost({ params }: PageProps) {
  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      *,
      category:categories(name, slug)
    `)
    .eq('slug', params.slug)
    .single();

  if (error || !post) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="text-sm text-gray-500 mb-2">
          {post.category?.name} • {new Date(post.published_at).toLocaleDateString('fr-FR')}
        </div>
        
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        
        <div className="text-gray-600">Par {post.author}</div>
      </header>

      {post.featured_image && (
        <img 
          src={post.featured_image} 
          alt={post.title}
          className="w-full h-96 object-cover rounded-lg mb-8"
        />
      )}

      <div className="prose prose-lg max-w-none">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}

// Générer les pages statiques au build
export async function generateStaticParams() {
  const { data: posts } = await supabase
    .from('posts')
    .select('slug');

  return posts?.map((post) => ({
    slug: post.slug,
  })) || [];
}
```

### Middleware pour les redirections 301

Créez `middleware.ts` :

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Vérifier s'il y a une redirection pour ce chemin
  const { data: redirect } = await supabase
    .from('redirects')
    .select('to_path, status_code')
    .eq('from_path', path)
    .single();

  if (redirect) {
    return NextResponse.redirect(
      new URL(redirect.to_path, request.url),
      redirect.status_code
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
```

---

## 🔍 Fonctionnalités avancées

### Recherche de posts

```typescript
async function searchPosts(query: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('published_at', { ascending: false });

  return data;
}
```

### Filtrage par catégorie

```typescript
async function getPostsByCategory(categorySlug: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      category:categories!inner(name, slug)
    `)
    .eq('category.slug', categorySlug)
    .order('published_at', { ascending: false });

  return data;
}
```

### Pagination

```typescript
async function getPaginatedPosts(page = 1, perPage = 10) {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('published_at', { ascending: false });

  return {
    posts: data,
    totalPosts: count,
    totalPages: Math.ceil((count || 0) / perPage),
    currentPage: page
  };
}
```

---

## 📊 Dashboard Admin (optionnel)

### Protection avec Row Level Security

```sql
-- Policy pour les admins uniquement
CREATE POLICY "Enable insert for authenticated users only" ON posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON posts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON posts
  FOR DELETE USING (auth.role() = 'authenticated');
```

### Interface d'administration simple

```typescript
// components/AdminPostForm.tsx
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [slug, setSlug] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { data, error } = await supabase
      .from('posts')
      .insert({
        title,
        slug,
        content,
        published_at: new Date().toISOString()
      });

    if (error) {
      alert('Erreur: ' + error.message);
    } else {
      alert('Post créé avec succès !');
      setTitle('');
      setContent('');
      setSlug('');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6">
      <div className="mb-4">
        <label className="block mb-2">Titre</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">Contenu (Markdown)</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border rounded px-3 py-2 h-64"
          required
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Publier
      </button>
    </form>
  );
}
```

---

## ✅ Checklist complète

### Configuration Supabase
- [ ] Créer le projet `in-vivo-rebuild` sur Supabase ✅ (déjà fait)
- [ ] Copier l'URL et la clé API ✅ (déjà fait)
- [ ] Créer les tables (categories, posts, pages, redirects)
- [ ] Activer Row Level Security
- [ ] Créer les policies de lecture publique
- [ ] Créer le bucket `images` dans Storage
- [ ] Rendre le bucket public

### Import des données
- [ ] Configurer `.env.local` avec les clés Supabase
- [ ] Installer `@supabase/supabase-js`
- [ ] Exécuter `scripts/import-to-supabase.js`
- [ ] Exécuter `scripts/upload-images-supabase.js`
- [ ] Vérifier les données dans le dashboard Supabase

### Intégration Lovable
- [ ] Créer `lib/supabase.ts`
- [ ] Créer les composants React (`BlogList`, `BlogPost`)
- [ ] Créer les pages dynamiques (`/blog/[slug]`)
- [ ] Configurer le middleware pour les redirections 301
- [ ] Installer `react-markdown` pour l'affichage
- [ ] Tester en local

### Déploiement
- [ ] Ajouter les variables d'environnement sur Vercel/Netlify
- [ ] Déployer l'application
- [ ] Vérifier que tout fonctionne en production
- [ ] Tester les redirections 301
- [ ] Configurer le domaine `in-vivo-expert.fr`

---

## 🎯 Avantages de cette architecture

### ✅ Performance
- Requêtes ultra-rapides avec Supabase (PostgREST)
- Cache automatique
- CDN pour les images

### ✅ Scalabilité
- Base de données PostgreSQL robuste
- Pas de limite de posts/pages
- API automatique

### ✅ SEO
- Redirections 301 gérées dynamiquement
- URLs propres
- Metadata personnalisable

### ✅ Maintenance
- Contenu éditable via dashboard Supabase
- Pas besoin de rebuild pour ajouter du contenu
- Backup automatique

### ✅ Sécurité
- Row Level Security
- Clés API sécurisées
- HTTPS par défaut

---

## 📚 Ressources

**Documentation Supabase :**
- https://supabase.com/docs
- https://supabase.com/docs/guides/database
- https://supabase.com/docs/guides/storage

**Exemples de code :**
- https://github.com/supabase/supabase/tree/master/examples

**Support :**
- Discord Supabase : https://discord.supabase.com
- Documentation Lovable : (lien de votre plateforme)

---

## 🆘 Dépannage

### Erreur "Invalid API key"
- Vérifiez que la clé dans `.env.local` est correcte
- Utilisez bien `NEXT_PUBLIC_` pour les variables côté client

### Images ne s'affichent pas
- Vérifiez que le bucket est **public**
- Testez l'URL publique dans le navigateur

### Posts vides
- Vérifiez les policies RLS
- Assurez-vous que `published_at` est défini

### Redirections ne fonctionnent pas
- Vérifiez que le middleware est bien en place
- Testez les chemins dans la table `redirects`

---

## 🎊 Conclusion

Avec cette configuration, vous avez un site complètement dynamique :
- ✅ Tous vos posts stockés dans Supabase
- ✅ API automatique pour tout votre contenu
- ✅ Images optimisées et servies via CDN
- ✅ Redirections 301 dynamiques pour le SEO
- ✅ Possibilité d'ajouter du contenu sans rebuild

**Prochaine étape :** Exécuter les scripts d'import ! 🚀

---

*Guide créé pour le projet in-vivo-rebuild*  
*Date : 2025-11-01*
