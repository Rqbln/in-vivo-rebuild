# 🚀 Guide de Migration Kiubi → Lovable
## Site: In Vivo Expert

Ce guide vous accompagne étape par étape pour migrer votre site d'expertise comptable depuis Kiubi vers Lovable.

---

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Configuration initiale](#configuration-initiale)
3. [Extraction des données Kiubi](#extraction-des-données-kiubi)
4. [Récupération des templates](#récupération-des-templates)
5. [Conversion pour Lovable](#conversion-pour-lovable)
6. [Migration vers Lovable](#migration-vers-lovable)
7. [Basculement du domaine](#basculement-du-domaine)
8. [Dépannage](#dépannage)

---

## ✅ Prérequis

### Outils nécessaires

```bash
# Vérifier que Node.js est installé (v18+ recommandé)
node --version

# Installer wget pour la capture statique
brew install wget

# Installer les dépendances du projet
npm install
```

### Accès requis

- [ ] Accès administrateur au back-office Kiubi
- [ ] Clé API Kiubi (Back-office > Développeurs)
- [ ] Accès au control panel Amen (https://controlpanel.amen.fr)
- [ ] Compte Lovable actif

---

## ⚙️ Configuration initiale

### 1. Récupérer les identifiants API Kiubi

1. Connectez-vous au back-office Kiubi
2. Allez dans **Développeurs** > **API**
3. Créez une nouvelle clé API si nécessaire
4. Notez :
   - **Code site** (ex: `monsite123`)
   - **Token API** (ex: `abc123...`)

### 2. Configurer l'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer avec vos informations
nano .env
```

Remplissez les valeurs dans `.env` :

```bash
# Configuration API Kiubi
KIUBI_SITE_CODE=votre_code_site_ici
KIUBI_API_TOKEN=votre_token_api_ici
KIUBI_API_URL=https://api.kiubi.com/v1

# Configuration du site
SITE_URL=https://www.in-vivo-expert.fr
SITE_DOMAIN=in-vivo-expert.fr

# Options d'export (true/false)
EXPORT_POSTS=true
EXPORT_PAGES=true
EXPORT_CATEGORIES=true
EXPORT_MEDIAS=true
EXPORT_PRODUCTS=false
```

---

## 📥 Extraction des données Kiubi

### Option A : Export complet automatique

```bash
# Lance tous les exports en une fois
npm run export:all
```

### Option B : Exports individuels

#### 1. Export via API Kiubi

```bash
# Exporte posts, pages, catégories via l'API
npm run export:api
```

**Ce script récupère :**
- ✅ Articles/posts du blog
- ✅ Pages statiques
- ✅ Catégories
- ✅ Liste des médias (URLs)

**Fichiers générés :**
- `exports/posts/all-posts.json`
- `exports/pages/all-pages.json`
- `exports/categories/all-categories.json`
- `exports/medias/all-medias.json`
- `exports/export-report.json`

#### 2. Capture miroir statique

```bash
# Télécharge toutes les pages HTML + assets
npm run export:static
```

**Ce script récupère :**
- ✅ Toutes les pages HTML rendues
- ✅ CSS, JavaScript, fonts
- ✅ Images utilisées sur le site
- ✅ Structure de navigation

**Dossier généré :**
- `site_static_mirror/www.in-vivo-expert.fr/`

⏱️ **Durée estimée :** 5-15 minutes selon la taille du site

#### 3. Extraction du sitemap

```bash
# Parse sitemap.xml et crée les tables de redirection
npm run export:sitemap
```

**Fichiers générés :**
- `exports/sitemap-urls.json` - Liste complète des URLs
- `exports/redirects-301.json` - Table de redirections
- `exports/redirects-301.csv` - Format Excel
- `exports/_redirects` - Format Netlify
- `exports/vercel-redirects.json` - Format Vercel

---

## 🎨 Récupération des templates

### Depuis le back-office Kiubi

1. **Accéder aux templates :**
   - Back-office Kiubi > **Apparence** > **Thème**
   - Cliquez sur **Modifier le thème**

2. **Copier les gabarits :**
   - Parcourez les fichiers de template (`.html`, `.tpl`)
   - Copiez le contenu dans `theme-kiubi/`
   - Notez la structure :
     ```
     theme-kiubi/
     ├── layout.html
     ├── header.html
     ├── footer.html
     ├── blog/
     │   ├── post.html
     │   └── list.html
     └── css/
         └── style.css
     ```

3. **Télécharger les assets :**
   - CSS personnalisés
   - JavaScript custom
   - Fonts locales
   - Logos et icônes

### Export du thème (si disponible)

Si Kiubi permet l'export de thème complet :
- Back-office > Thème > **Exporter**
- Décompressez l'archive dans `theme-kiubi/`

---

## 🔄 Conversion pour Lovable

### Transformer les exports

```bash
# Convertit les données JSON en Markdown + React
npm run convert:lovable
```

**Ce script :**
1. ✅ Convertit les posts HTML → Markdown avec frontmatter
2. ✅ Convertit les pages HTML → Markdown
3. ✅ Génère des composants React (BlogPost, Page)
4. ✅ Crée un index JSON de navigation
5. ✅ Prépare un README d'instructions

**Package généré :**
```
lovable-ready/
├── content/
│   ├── posts/          # Articles en .md
│   └── pages/          # Pages en .md
├── components/
│   ├── BlogPost.tsx    # Composant article
│   └── Page.tsx        # Composant page
├── content-index.json  # Index navigation
└── README.md          # Instructions
```

### Vérifier la qualité de la conversion

```bash
# Compter les fichiers convertis
ls -l lovable-ready/content/posts/ | wc -l
ls -l lovable-ready/content/pages/ | wc -l

# Inspecter un exemple
cat lovable-ready/content/posts/exemple-article.md
```

---

## 🎯 Migration vers Lovable

### 1. Préparer le projet Lovable

1. **Créer un nouveau projet sur Lovable**
   - Allez sur https://lovable.dev
   - Créez un nouveau projet
   - Choisissez un template de base ou commencez vide

2. **Cloner le projet localement (optionnel)**
   ```bash
   # Si Lovable propose un export Git
   git clone <url-lovable-project>
   ```

### 2. Importer le contenu

**Méthode A : Upload direct dans Lovable**
1. Dans l'interface Lovable, créez la structure :
   ```
   src/
   ├── content/
   │   ├── posts/
   │   └── pages/
   └── components/
   ```

2. Uploadez les fichiers depuis `lovable-ready/`
   - Glissez-déposez les fichiers Markdown
   - Importez les composants React

**Méthode B : Via Git (si disponible)**
```bash
# Copier le contenu converti
cp -r lovable-ready/content/ <projet-lovable>/src/content/
cp -r lovable-ready/components/ <projet-lovable>/src/components/

# Commit et push
cd <projet-lovable>
git add .
git commit -m "Import contenu depuis Kiubi"
git push
```

### 3. Adapter les styles

1. **Récupérer les CSS Kiubi**
   ```bash
   # CSS sont dans la capture statique
   find site_static_mirror -name "*.css" -type f
   ```

2. **Convertir en Tailwind/CSS modules**
   - Analysez les styles existants
   - Recréez avec Tailwind (recommandé par Lovable)
   - Ou importez les CSS custom

3. **Tester le rendu**
   - Comparez avec la version Kiubi
   - Ajustez les breakpoints responsive
   - Vérifiez les animations

### 4. Configurer les routes

Créez `src/routes.ts` ou équivalent :

```typescript
import { contentIndex } from './content-index.json';

export const routes = [
  // Pages statiques
  ...contentIndex.pages.map(page => ({
    path: `/${page.slug}`,
    component: () => import(`./content/pages/${page.filename}`)
  })),
  
  // Articles de blog
  ...contentIndex.posts.map(post => ({
    path: `/blog/${post.slug}`,
    component: () => import(`./content/posts/${post.filename}`)
  }))
];
```

### 5. Importer les médias

```bash
# Les URLs des médias sont dans
cat exports/medias/all-medias.json

# Télécharger tous les médias
# (Créer un script ou manuel selon volume)
```

**Script de téléchargement des images :**

```javascript
// scripts/download-medias.js
const medias = require('../exports/medias/all-medias.json');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

async function downloadMedias() {
  for (const media of medias) {
    const url = media.url;
    const filename = path.basename(url);
    const dest = path.join(__dirname, '..', 'lovable-ready', 'public', 'images', filename);
    
    const response = await axios.get(url, { responseType: 'stream' });
    await fs.ensureDir(path.dirname(dest));
    response.data.pipe(fs.createWriteStream(dest));
  }
}

downloadMedias();
```

---

## 🌐 Basculement du domaine

### 1. Tester le site Lovable

1. **Preview Lovable**
   - URL temporaire fournie par Lovable
   - Testez toutes les pages
   - Vérifiez les formulaires

2. **Checklist pré-migration**
   - [ ] Toutes les pages s'affichent
   - [ ] Les images sont visibles
   - [ ] Les liens internes fonctionnent
   - [ ] Les formulaires (contact, devis) fonctionnent
   - [ ] SEO : meta tags, sitemap.xml
   - [ ] Performance : Lighthouse > 90

### 2. Configurer les redirections 301

**Sur Lovable/Netlify :**
```bash
# Copier le fichier _redirects
cp exports/_redirects lovable-ready/public/_redirects
```

**Sur Vercel :**
```bash
# Ajouter à vercel.json
cp exports/vercel-redirects.json lovable-ready/vercel.json
```

### 3. Modifier les DNS chez Amen

1. **Se connecter à Amen**
   - https://controlpanel.amen.fr
   - Identifiez-vous

2. **Accéder aux DNS**
   - Sélectionnez `in-vivo-expert.fr`
   - Gestion DNS

3. **Pointer vers Lovable**
   
   Lovable vous fournira les valeurs DNS à configurer, typiquement :
   
   ```
   Type  | Nom | Valeur                    | TTL
   ------|-----|---------------------------|-----
   A     | @   | <IP Lovable>              | 3600
   CNAME | www | <subdomain>.lovable.app   | 3600
   ```

4. **Attendre la propagation**
   - Délai : 1-48h (généralement < 4h)
   - Vérifier : `nslookup in-vivo-expert.fr`

### 4. Configurer HTTPS

- Lovable gère automatiquement Let's Encrypt
- Certificat SSL gratuit
- Force HTTPS dans les paramètres

### 5. Maintenir Kiubi temporairement

**Période de transition (7-30 jours) :**
- Gardez Kiubi actif
- Configurez un sous-domaine `old.in-vivo-expert.fr` vers Kiubi
- Comparez les deux versions
- Recueillez les retours utilisateurs

---

## 🔧 Dépannage

### Erreur API Kiubi "Unauthorized"

**Cause :** Token ou code site invalide

**Solution :**
```bash
# Vérifier le .env
cat .env | grep KIUBI

# Tester manuellement l'API
curl -H "Authorization: Bearer $KIUBI_API_TOKEN" \
     "https://api.kiubi.com/v1/sites/$KIUBI_SITE_CODE/cms/posts.json"
```

### Capture statique incomplète

**Cause :** Certaines pages nécessitent JavaScript

**Solution :**
```bash
# Utiliser HTTrack au lieu de wget
brew install httrack

httrack "https://www.in-vivo-expert.fr" \
  -O "./site_static_mirror" \
  -r6 \
  --ext-depth=2
```

### Images manquantes après import

**Cause :** URLs absolues Kiubi

**Solution :**
```bash
# Chercher les URLs Kiubi dans les Markdown
grep -r "kiubi" lovable-ready/content/

# Remplacer par URLs relatives
find lovable-ready/content -type f -exec sed -i '' 's|https://www.in-vivo-expert.fr/media/|/images/|g' {} +
```

### Conversion Markdown cassée

**Cause :** HTML complexe non supporté par Turndown

**Solution :**
- Éditer manuellement `lovable-ready/content/posts/problematic-post.md`
- Ou désactiver certains posts et les recréer dans Lovable

---

## 📞 Support

### Documentation Kiubi
- API Kiubi : https://www.kiubi.com/api/
- Support : support@kiubi.com

### Documentation Lovable
- Docs : https://docs.lovable.dev
- Community : Discord Lovable

### Ressources utiles
- Turndown (HTML→MD) : https://github.com/mixmark-io/turndown
- Vercel Redirects : https://vercel.com/docs/edge-network/redirects
- Netlify Redirects : https://docs.netlify.com/routing/redirects/

---

## ✅ Checklist finale

Avant de mettre en production :

- [ ] Tous les exports Kiubi réussis
- [ ] Capture statique complète
- [ ] Templates récupérés
- [ ] Conversion Lovable validée
- [ ] Contenu importé dans Lovable
- [ ] Styles adaptés et responsive
- [ ] Médias téléchargés et accessibles
- [ ] Redirections 301 configurées
- [ ] Tests sur URL preview Lovable
- [ ] SEO : meta tags, sitemap, robots.txt
- [ ] Analytics configuré (GA4)
- [ ] Formulaires testés
- [ ] DNS configurés chez Amen
- [ ] HTTPS actif
- [ ] Backup Kiubi conservé 30 jours

---

**Bon courage pour la migration ! 🚀**

Généré le: ${new Date().toLocaleDateString('fr-FR')}
