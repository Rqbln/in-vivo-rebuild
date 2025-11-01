# 🚀 Configuration Supabase - In Vivo Expert

## 📋 Vue d'ensemble rapide

Ce guide vous permet de connecter votre projet `lovable-ready/` à Supabase en quelques étapes.

---

## ⚡ Quick Start (5 minutes)

### 1. Créer les tables dans Supabase

1. Ouvrez le **SQL Editor** dans Supabase Dashboard
2. Copiez le contenu de `supabase-schema.sql`
3. Exécutez le script
4. ✅ Vos tables sont créées !

**OU via CLI :**
```bash
# Si vous avez supabase CLI
supabase db reset
supabase db push
```

### 2. Créer le bucket pour les images

1. Allez dans **Storage** dans Supabase Dashboard
2. Créez un nouveau bucket : `images`
3. **Important :** Rendez-le **PUBLIC** ✅

### 3. Installer la dépendance Supabase

```bash
npm install @supabase/supabase-js
```

### 4. Importer les données

```bash
# Importer catégories + posts + redirections
npm run supabase:import

# Uploader les images
npm run supabase:upload:images

# OU tout en une fois
npm run supabase:setup
```

### 5. ✅ C'est prêt !

Vos données sont maintenant dans Supabase. Vous pouvez les vérifier dans le Dashboard.

---

## 🔑 Configuration de votre projet

### Variables d'environnement

Ajoutez dans votre projet Lovable (fichier `.env.local`) :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://whivezkkzwgagherygzu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoaXZlemtrendnYWdoZXJ5Z3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMTc0NDUsImV4cCI6MjA3NzU5MzQ0NX0.6N66-o2WJWtNfxqdKKPArXr-TQbHd2R2nFYikqyXnjE
```

⚠️ **Important :** Ajoutez `.env.local` à votre `.gitignore` !

### Client Supabase

Créez `lib/supabase.ts` dans votre projet Lovable :

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
```

---

## 📊 Structure de la base

### Tables créées

| Table | Description | Nombre de lignes |
|-------|-------------|------------------|
| `categories` | Catégories blog | 3 |
| `posts` | Articles de blog | 20 |
| `pages` | Pages statiques | 0 (à ajouter) |
| `redirects` | Redirections 301 | 73 |

### Relations

```
categories (1) ──< (N) posts
```

### Colonnes principales

**posts :**
- `id` : Identifiant unique
- `title` : Titre de l'article
- `slug` : URL-friendly (ex: `mon-article`)
- `content` : Contenu en Markdown
- `excerpt` : Résumé
- `author` : Auteur
- `category_id` : Référence à `categories`
- `featured_image` : URL de l'image (Supabase Storage)
- `published_at` : Date de publication

**categories :**
- `id` : Identifiant unique
- `slug` : URL-friendly
- `name` : Nom affiché
- `description` : Description

**redirects :**
- `from_path` : Ancien chemin (ex: `/blog/old`)
- `to_path` : Nouveau chemin (ex: `/blog/new`)
- `status_code` : 301 (permanent) ou 302 (temporaire)

---

## 🎨 Exemples d'utilisation

### Récupérer tous les posts

```typescript
import { supabase } from '@/lib/supabase';

const { data: posts, error } = await supabase
  .from('posts')
  .select(`
    *,
    category:categories(name, slug)
  `)
  .order('published_at', { ascending: false });
```

### Récupérer un post par slug

```typescript
const { data: post, error } = await supabase
  .from('posts')
  .select(`
    *,
    category:categories(name, slug)
  `)
  .eq('slug', 'mon-article')
  .single();
```

### Rechercher dans les posts

```typescript
const { data: results, error } = await supabase
  .from('posts')
  .select('*')
  .or(`title.ilike.%${query}%,content.ilike.%${query}%`);
```

### Filtrer par catégorie

```typescript
const { data: posts, error } = await supabase
  .from('posts')
  .select(`
    *,
    category:categories!inner(name, slug)
  `)
  .eq('category.slug', 'actualites');
```

### Vérifier les redirections (middleware)

```typescript
const { data: redirect } = await supabase
  .from('redirects')
  .select('to_path, status_code')
  .eq('from_path', request.nextUrl.pathname)
  .eq('is_active', true)
  .single();

if (redirect) {
  return NextResponse.redirect(
    new URL(redirect.to_path, request.url),
    redirect.status_code
  );
}
```

---

## 🖼️ URLs des images

Après upload dans Supabase Storage, vos images seront accessibles à :

```
https://whivezkkzwgagherygzu.supabase.co/storage/v1/object/public/images/[nom-fichier].jpg
```

**Exemple :**
```
https://whivezkkzwgagherygzu.supabase.co/storage/v1/object/public/images/862.jpg
```

Ces URLs sont automatiquement utilisées dans le champ `featured_image` des posts.

---

## 📋 Checklist de déploiement

### Dans Supabase Dashboard

- [ ] Projet `in-vivo-rebuild` créé ✅
- [ ] Script SQL `supabase-schema.sql` exécuté
- [ ] Tables créées et visibles
- [ ] Bucket `images` créé
- [ ] Bucket `images` rendu PUBLIC ✅
- [ ] Row Level Security activé sur toutes les tables
- [ ] Policies de lecture publique créées

### Import des données

- [ ] `npm install @supabase/supabase-js` exécuté
- [ ] Script `import-to-supabase.js` exécuté
- [ ] 3 catégories importées
- [ ] 20 posts importés
- [ ] 73 redirections importées
- [ ] Script `upload-images-supabase.js` exécuté
- [ ] 20 images uploadées
- [ ] Vérification dans le dashboard

### Dans votre projet Lovable

- [ ] `.env.local` créé avec les clés Supabase
- [ ] `lib/supabase.ts` créé
- [ ] Composants mis à jour pour utiliser Supabase
- [ ] Test en local réussi
- [ ] Variables d'environnement ajoutées sur Vercel/Netlify
- [ ] Déploiement en production
- [ ] Test des redirections 301

---

## 🔍 Vérifications

### Tester les données

```bash
# Dans le SQL Editor de Supabase
SELECT COUNT(*) FROM categories;  -- Devrait retourner 3
SELECT COUNT(*) FROM posts;       -- Devrait retourner 20
SELECT COUNT(*) FROM redirects;   -- Devrait retourner 73
```

### Tester les images

Ouvrez dans votre navigateur :
```
https://whivezkkzwgagherygzu.supabase.co/storage/v1/object/public/images/862.jpg
```

Si l'image s'affiche ✅, tout fonctionne !

---

## 🆘 Problèmes courants

### ❌ "Invalid API key"
- Vérifiez que la clé dans `.env.local` est correcte
- Utilisez `NEXT_PUBLIC_` pour les variables côté client

### ❌ "relation does not exist"
- Les tables n'ont pas été créées
- Exécutez `supabase-schema.sql` dans le SQL Editor

### ❌ Images ne s'affichent pas
- Le bucket n'est pas public → Le rendre public
- Le bucket n'existe pas → Le créer dans Storage

### ❌ "No rows returned"
- Row Level Security bloque l'accès
- Vérifiez les policies (doivent permettre SELECT pour `anon`)

### ❌ "permission denied for table"
- Problème de grants
- Ré-exécutez la section GRANTS du fichier SQL

---

## 📚 Documentation complète

Pour plus de détails, consultez :
- **`GUIDE-SUPABASE-LOVABLE.md`** : Guide complet pas à pas
- **`supabase-schema.sql`** : Schéma SQL avec commentaires
- **Documentation Supabase :** https://supabase.com/docs

---

## 🎯 Support

**Projet GitHub :** https://github.com/Rqbln/in-vivo-rebuild

**Supabase Dashboard :**
```
URL: https://whivezkkzwgagherygzu.supabase.co
Projet: in-vivo-rebuild
```

---

## ✅ Résumé

1. ✅ Créez les tables avec `supabase-schema.sql`
2. ✅ Créez le bucket `images` (PUBLIC)
3. ✅ Installez `@supabase/supabase-js`
4. ✅ Exécutez `npm run supabase:setup`
5. ✅ Configurez `.env.local` dans Lovable
6. ✅ Utilisez `supabase` dans vos composants
7. ✅ Déployez ! 🚀

**Bon développement ! 💪**
