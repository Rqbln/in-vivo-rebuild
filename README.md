# In Vivo Expert - Refonte Kiubi → Lovable

Kit complet d'extraction et de migration pour le site d'expertise comptable in-vivo-expert.fr

## 🎯 Objectif

Migrer le site actuellement hébergé sur Kiubi/Amen vers Lovable avec :
- ✅ Récupération complète du contenu
- ✅ Conservation du SEO (redirections 301)
- ✅ Amélioration de l'architecture
- ✅ Intégration d'automatisation IA pour les articles

## 📁 Structure du projet

```
in-vivo-rebuild/
├── scripts/                    # Scripts d'extraction et conversion
│   ├── kiubi-api-export.js    # Export via API Kiubi
│   ├── static-mirror.sh       # Capture miroir wget
│   ├── extract-sitemap.js     # Parse sitemap + redirections
│   └── convert-to-lovable.js  # Conversion Markdown + React
├── exports/                    # Données extraites de Kiubi
│   ├── posts/                 # Articles JSON
│   ├── pages/                 # Pages JSON
│   ├── categories/            # Catégories
│   ├── medias/                # Liste médias
│   └── sitemap-urls.json      # URLs du site
├── site_static_mirror/        # Copie HTML complète du site
├── theme-kiubi/               # Templates et CSS Kiubi
├── lovable-ready/             # Package prêt pour Lovable
│   ├── content/
│   │   ├── posts/            # Articles en Markdown
│   │   └── pages/            # Pages en Markdown
│   └── components/           # Composants React
└── docs/                      # Documentation
    └── GUIDE-MIGRATION.md     # Guide étape par étape
```

## 🚀 In Vivo Expert - Kit Migration Kiubi → Lovable

**Version :** 2.0 (Optimisée)
**Site source :** [in-vivo-expert.fr](https://www.in-vivo-expert.fr)
**Plateforme actuelle :** Kiubi (hébergé sur Amen)
**Plateforme cible :** Lovable

---

## ⚡ DÉMARRAGE RAPIDE (2 MINUTES)

```bash
# 1. Installation
npm install

# 2. Configuration
cp .env.example .env
# Éditer .env si besoin (déjà pré-configuré)

# 3. Export optimisé V2 (RECOMMANDÉ)
npm run export:api:v2

# 4. Conversion Lovable
npm run convert:lovable
```

**✨ NOUVEAU V2 :** Monitoring quota en temps réel + sauvegardes incrémentales + endpoints optimisés

---

## 📚 DOCUMENTATION

| Document | Description |
|----------|-------------|
| 📗 **[QUICKSTART.md](./QUICKSTART.md)** | Guide 5 minutes pour démarrer |
| 📘 **[GUIDE-MIGRATION.md](./docs/GUIDE-MIGRATION.md)** | Migration complète A→Z |
| 📖 **[API-KIUBI-COMPLETE.md](./docs/API-KIUBI-COMPLETE.md)** | Analyse complète API (4240 lignes) ✨ |
| 🚀 **[GUIDE-EXPORT-V2.md](./docs/GUIDE-EXPORT-V2.md)** | Utilisation export optimisé ✨ |

---

## 🎯 NOUVELLE VERSION 2.0

### Améliorations majeures

✅ **Monitoring quota temps réel** via `/rate.json`  
✅ **Endpoints optimisés** (`/search/*` au lieu de endpoints directs)  
✅ **Sauvegardes incrémentales** tous les 10 pages  
✅ **Export configuration** (`/prefs/site.json`, `/prefs/blog.json`)  
✅ **Extra fields** automatiques (`text1-text15` pour pages)  
✅ **Pause intelligente** si quota < 10  
✅ **Rapport détaillé** d'export  

### Scripts disponibles

```bash
# Export API V2 (RECOMMANDÉ - nouveau)
npm run export:api:v2

# Export API V1 (ancien - conservé)
npm run export:api

# Capture statique (wget)
npm run export:static

# Extraction sitemap + redirects 301
npm run export:sitemap

# Conversion pour Lovable
npm run convert:lovable

# Téléchargement médias
npm run download:medias

# Analyse site statique
npm run analyze:site

# Tout en un (API V2 + static + sitemap)
npm run export:all
```

---

## 📋 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run export:api` | Extrait contenus via API Kiubi (posts, pages, catégories) |
| `npm run export:static` | Capture miroir statique complet du site (wget) |
| `npm run export:sitemap` | Parse sitemap.xml et crée les tables de redirections 301 |
| `npm run convert:lovable` | Convertit les exports en format Lovable (MD + React) |
| `npm run export:all` | Lance tous les exports (API + static + sitemap) |

## 🔑 Configuration requise

### Accès Kiubi

Obtenez depuis le back-office Kiubi :
- **Code site** (ex: `invivo123`)
- **Token API** (Développeurs > API)

### Outils locaux

```bash
# Node.js v18+
node --version

# wget (pour capture statique)
brew install wget

# (Optionnel) HTTrack en alternative à wget
brew install httrack
```

## 📖 Documentation détaillée

- **[Guide de migration complet](docs/GUIDE-MIGRATION.md)** - Étapes détaillées A à Z
- **[API Kiubi](https://www.kiubi.com/api/)** - Documentation officielle
- **[Lovable Docs](https://docs.lovable.dev)** - Documentation Lovable

## 🎨 Ce qui est récupéré

### ✅ Via API Kiubi
- Articles de blog (titre, contenu, date, auteur, catégorie)
- Pages statiques
- Catégories
- Liste des médias (URLs)
- Métadonnées SEO

### ✅ Via capture statique
- HTML rendu de toutes les pages
- CSS, JavaScript, fonts
- Images et assets
- Structure de navigation

### ✅ Via sitemap
- Liste complète des URLs
- Tables de redirections 301 (formats: JSON, CSV, Netlify, Vercel)

### ✅ Généré pour Lovable
- Fichiers Markdown avec frontmatter
- Composants React (BlogPost, Page)
- Index de navigation JSON
- Structure de dossiers prête à l'emploi

## 🔄 Workflow de migration

```
1. EXTRACTION KIUBI
   └─> API Export + Static Mirror + Sitemap
   
2. CONVERSION
   └─> HTML → Markdown + React Components
   
3. IMPORT LOVABLE
   └─> Upload contenu + Configurer routes
   
4. ADAPTATION
   └─> Styles + Médias + Formulaires
   
5. BASCULEMENT
   └─> DNS Amen → Lovable + Redirections 301
```

## 🌐 Basculement du domaine

1. **Configurer Lovable** avec le domaine `in-vivo-expert.fr`
2. **Modifier DNS chez Amen** :
   ```
   A     @ → <IP Lovable>
   CNAME www → <subdomain>.lovable.app
   ```
3. **Activer HTTPS** (automatique avec Lovable)
4. **Tester les redirections 301**

Détails complets : [Guide Migration - Section Basculement](docs/GUIDE-MIGRATION.md#basculement-du-domaine)

## 🐛 Dépannage

### Erreur "Unauthorized" API Kiubi
→ Vérifiez `KIUBI_API_TOKEN` dans `.env`

### Capture wget incomplète
→ Essayez HTTrack ou ajustez les paramètres wget

### Images manquantes
→ Téléchargez manuellement depuis `exports/medias/all-medias.json`

Plus de solutions : [Guide Migration - Dépannage](docs/GUIDE-MIGRATION.md#dépannage)

## 📊 Statut du projet

- [x] Structure projet créée
- [x] Script export API Kiubi
- [x] Script capture statique
- [x] Script extraction sitemap
- [x] Script conversion Lovable
- [x] Documentation complète
- [ ] Récupération credentials Kiubi
- [ ] Exécution des exports
- [ ] Import dans Lovable
- [ ] Tests et validation
- [ ] Basculement DNS

## 🤝 Contribution

Ce projet est spécifique à la migration in-vivo-expert.fr, mais les scripts peuvent être réutilisés pour d'autres migrations Kiubi.

## 📝 Licence

Privé - In Vivo Expert

## 📞 Contact

Pour questions sur la migration : support@in-vivo-expert.fr

---

**Dernière mise à jour :** ${new Date().toLocaleDateString('fr-FR')}
