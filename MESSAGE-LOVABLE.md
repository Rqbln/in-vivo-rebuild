# 🚀 Demande de refonte complète - In Vivo Expert

## 📋 Contexte du projet

Je souhaite faire la **refonte complète** du site web d'expertise comptable **In Vivo Expert** actuellement hébergé sur Kiubi/Amen.

**Site actuel :** https://www.in-vivo-expert.fr  
**Objectif :** Recréer entièrement le site sur Lovable avec une architecture moderne et performante.

---

## 🗄️ Base de données Supabase (PRÊTE)

Toutes les données sont déjà importées et opérationnelles dans Supabase :

### Configuration de connexion

```
Project URL: https://whivezkkzwgagherygzu.supabase.co

Clé publique (anon):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoaXZlemtrendnYWdoZXJ5Z3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMTc0NDUsImV4cCI6MjA3NzU5MzQ0NX0.6N66-o2WJWtNfxqdKKPArXr-TQbHd2R2nFYikqyXnjE
```

### Données disponibles

✅ **4 catégories** (table `categories`)
- Non classé
- Générale
- Actualités comptables
- Actualités juridiques

✅ **20 articles de blog** (table `posts`)
- Titre, slug, contenu (Markdown), excerpt, auteur, catégorie
- Dates de publication
- Images associées

✅ **20 images** (Supabase Storage - bucket `images`)
- Toutes publiques et accessibles
- URL format : `https://whivezkkzwgagherygzu.supabase.co/storage/v1/object/public/images/[nom].jpg`

✅ **Tables SQL créées** avec Row Level Security activé
- Lecture publique pour tous
- Requêtes avec JOIN fonctionnelles

---

## 📁 Fichiers sources disponibles

### GitHub Repository
**https://github.com/Rqbln/in-vivo-rebuild**

### Structure du projet

#### 1. **Package prêt pour Lovable** (`lovable-ready/`)

```
lovable-ready/
├── content/posts/           # 20 articles Markdown avec frontmatter YAML
├── public/images/           # 20 images JPG (50KB à 5.5MB)
├── public/_redirects        # 73 redirections 301 (format Netlify)
├── components/
│   ├── BlogPost.tsx        # Composant React pour afficher un article
│   └── Page.tsx            # Composant React pour pages statiques
├── config/
│   ├── site-config.json    # Configuration du site (nom, logo, contacts, adresse)
│   ├── redirects-301.json  # Redirections format JSON
│   ├── vercel-redirects.json  # Redirections format Vercel
│   └── sitemap-urls.json   # 73 URLs du site original
├── data/
│   └── categories.json     # 3 catégories
├── content-index.json      # Index de navigation (tous les posts)
├── README.md               # Guide d'intégration Lovable
└── MANIFEST.txt            # Inventaire complet
```

#### 2. **Données brutes exportées** (`exports/`)

```
exports/
├── config/
│   └── site-config.json    # Préférences Kiubi (nom, logo, contacts, etc.)
├── posts/
│   ├── all-posts.json      # 60 articles (format JSON Kiubi)
│   └── post-{id}.json      # Fichiers individuels
├── categories/
│   └── all-categories.json # Catégories
├── medias/
│   └── all-medias.json     # 100 URLs d'images
├── sitemap-urls.json       # 73 URLs
├── _redirects              # Redirections Netlify
├── redirects-301.json      # Redirections JSON
└── vercel-redirects.json   # Redirections Vercel
```

#### 3. **Capture statique complète** (`site_static_mirror/`)

- **89 pages HTML** capturées via wget
- **224 fichiers** au total (HTML, CSS, JS, images)
- Backup complet du site actuel

#### 4. **Documentation** (`docs/`)

```
docs/
├── API-KIUBI-COMPLETE.md      # 4240 lignes d'analyse API
├── GUIDE-MIGRATION.md         # Guide migration A→Z
├── GUIDE-EXPORT-V2.md         # Guide export optimisé
└── GUIDE-SUPABASE-LOVABLE.md  # Guide intégration Supabase (complet)
```

---

## 🎯 Ce que je souhaite

### Refonte complète avec Lovable

1. **Architecture moderne**
   - Site React/Next.js rapide et performant
   - Design moderne et responsive
   - SEO optimisé

2. **Intégration Supabase**
   - Connexion à la base de données existante
   - Affichage dynamique des articles de blog
   - Gestion des catégories
   - Images servies via Supabase Storage

3. **Fonctionnalités principales**
   - **Page d'accueil** : Présentation du cabinet + articles récents
   - **Blog** : Liste des articles avec filtrage par catégorie
   - **Pages articles** : Affichage complet avec Markdown
   - **Navigation** : Menu avec catégories
   - **Recherche** : Recherche dans les articles (optionnel)
   - **Contact** : Formulaire de contact
   - **À propos** : Présentation du cabinet

4. **SEO & Performance**
   - Redirections 301 pour préserver le référencement (73 URLs)
   - Meta tags optimisés
   - Images optimisées
   - URLs propres et SEO-friendly

5. **Design souhaité**
   - Professionnel et sobre (cabinet comptable)
   - Couleurs : À définir (actuellement bleu/blanc sur le site)
   - Typographie claire et lisible
   - Mise en avant de l'expertise

---

## 📊 Informations du cabinet

**D'après `site-config.json` :**

- **Nom :** In Vivo Expert
- **Activité :** Expertise comptable pour CSE (Comités Sociaux et Économiques)
- **Adresse :** 55 rue Ledru Rollin, 92260 FONTENAY AUX ROSES
- **Téléphone :** 06.11.54.38.73
- **Email :** À récupérer du site actuel

---

## 🔧 Support technique fourni

### Scripts d'automatisation disponibles

```bash
# Tester la connexion Supabase
npm run supabase:test

# Réimporter les données si besoin
npm run supabase:import

# Uploader les images
npm run supabase:upload:images
```

### Documentation complète

- **README-SUPABASE.md** : Quick start Supabase (5 minutes)
- **GUIDE-SUPABASE-LOVABLE.md** : Guide complet avec exemples de code
- **MIGRATION-COMPLETE.md** : Récapitulatif de toute la migration

### Exemples de code fournis

**Récupérer les posts :**
```typescript
import { supabase } from '@/lib/supabase';

const { data: posts } = await supabase
  .from('posts')
  .select(`*, category:categories(name, slug)`)
  .order('published_at', { ascending: false });
```

**Afficher un post :**
```typescript
const { data: post } = await supabase
  .from('posts')
  .select(`*, category:categories(name, slug)`)
  .eq('slug', 'mon-article')
  .single();
```

---

## 📝 Pages à créer

### Pages principales

1. **/** - Accueil
   - Hero section avec présentation
   - Articles récents (3-5)
   - Call-to-action contact

2. **/blog** - Liste des articles
   - Grille d'articles avec image, titre, excerpt
   - Filtrage par catégorie
   - Pagination

3. **/blog/[slug]** - Article individuel
   - Titre, date, auteur, catégorie
   - Image principale
   - Contenu Markdown complet
   - Partage social (optionnel)

4. **/a-propos** - À propos
   - Présentation du cabinet
   - Expertise CSE
   - Valeurs

5. **/contact** - Contact
   - Formulaire
   - Coordonnées
   - Carte (optionnel)

### Pages secondaires (89 pages HTML à convertir)

Les 89 pages capturées dans `site_static_mirror/` peuvent être converties progressivement :
- Formations
- Assistance comptable
- Examen de comptabilité
- Contrôle de comptabilité
- Etc.

---

## ✅ Checklist de réalisation

### Phase 1 : Setup initial
- [ ] Créer le projet Lovable
- [ ] Configurer Supabase (variables d'environnement)
- [ ] Installer `@supabase/supabase-js`
- [ ] Créer `lib/supabase.ts`

### Phase 2 : Structure de base
- [ ] Layout principal avec header/footer
- [ ] Navigation avec menu
- [ ] Design system (couleurs, typographie)
- [ ] Composants de base (Button, Card, etc.)

### Phase 3 : Pages principales
- [ ] Page d'accueil
- [ ] Liste des articles (/blog)
- [ ] Page article individuelle (/blog/[slug])
- [ ] Page à propos
- [ ] Page contact

### Phase 4 : Fonctionnalités
- [ ] Intégration Supabase pour les posts
- [ ] Affichage des images depuis Supabase Storage
- [ ] Filtrage par catégorie
- [ ] Recherche (optionnel)
- [ ] Middleware pour redirections 301

### Phase 5 : Optimisation
- [ ] SEO (meta tags, sitemap)
- [ ] Performance (images, lazy loading)
- [ ] Responsive design
- [ ] Tests sur mobile/desktop

### Phase 6 : Déploiement
- [ ] Configuration du domaine in-vivo-expert.fr
- [ ] Vérification des redirections 301
- [ ] Tests finaux
- [ ] Mise en production

---

## 🎨 Inspirations design (optionnel)

- Site actuel : https://www.in-vivo-expert.fr
- Style souhaité : Professionnel, sobre, moderne
- Public cible : CSE, élus, responsables RH

---

## 📞 Contact

Pour toute question sur les données ou l'architecture, tout est documenté dans le repo GitHub :
**https://github.com/Rqbln/in-vivo-rebuild**

---

## 🚀 Prêt à démarrer !

Toutes les données sont en place, la base Supabase est opérationnelle, les fichiers sont organisés et documentés.

**Je souhaite que Lovable crée une refonte complète et moderne de ce site d'expertise comptable en utilisant toutes ces ressources.**

Merci ! 🙏
