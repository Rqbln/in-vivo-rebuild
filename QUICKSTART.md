# Guide de démarrage rapide

## ⚡ Démarrage en 5 minutes

### 1️⃣ Configuration initiale (2 min)

```bash
# Installer les dépendances
npm install

# Configurer vos identifiants Kiubi
cp .env.example .env
```

**Éditez `.env` et remplissez :**
```bash
KIUBI_SITE_CODE=votre_code_site    # Depuis back-office Kiubi
KIUBI_API_TOKEN=votre_token_api    # Depuis Développeurs > API
SITE_URL=https://www.in-vivo-expert.fr
```

### 2️⃣ Extraire tout le contenu (3 min)

```bash
# Lance tous les exports automatiquement
npm run export:all
```

**Ce qui se passe :**
- ✅ Extraction API Kiubi (posts, pages, catégories)
- ✅ Capture miroir statique HTML complet
- ✅ Extraction sitemap + génération redirections 301

### 3️⃣ Convertir pour Lovable (< 1 min)

```bash
npm run convert:lovable
```

**Résultat :**
- 📁 `lovable-ready/` contient tout le nécessaire pour Lovable
- 📝 Markdown avec frontmatter
- ⚛️ Composants React
- 🗂️ Index de navigation

### 4️⃣ Récupérer les templates Kiubi (manuel)

Dans le back-office Kiubi :
1. Apparence > Thème > Modifier
2. Copiez les fichiers de template dans `theme-kiubi/`
3. Téléchargez les CSS custom

---

## 🎯 Prochaines étapes

1. **Vérifier les exports**
   ```bash
   ls -lh exports/
   cat exports/export-report.json
   ```

2. **Analyser la capture statique**
   ```bash
   npm run analyze:site  # Génère un rapport détaillé
   ```

3. **Consulter le guide complet**
   - [`docs/GUIDE-MIGRATION.md`](docs/GUIDE-MIGRATION.md)

4. **Importer dans Lovable**
   - Suivez la section "Migration vers Lovable" du guide

---

## 📋 Commandes disponibles

| Commande | Durée | Description |
|----------|-------|-------------|
| `npm run export:api` | ~30s | API Kiubi (posts, pages) |
| `npm run export:static` | 5-15min | Capture miroir wget |
| `npm run export:sitemap` | ~10s | Sitemap + redirections |
| `npm run export:all` | 5-15min | Tout en une fois ⚡ |
| `npm run convert:lovable` | ~30s | Conversion Markdown + React |
| `npm run analyze:site` | ~1min | Analyse capture statique |
| `npm run download:medias` | variable | Télécharge les images/médias |

---

## ❓ Besoin d'aide ?

### Erreur "KIUBI_API_TOKEN" non défini
→ Vérifiez que `.env` est bien configuré

### wget non installé
```bash
brew install wget
```

### Capture statique lente
→ Normal, le site est téléchargé entièrement (peut prendre 10-15 min)

### Plus de détails
→ Consultez [`docs/GUIDE-MIGRATION.md`](docs/GUIDE-MIGRATION.md)

---

**Bonne migration ! 🚀**
