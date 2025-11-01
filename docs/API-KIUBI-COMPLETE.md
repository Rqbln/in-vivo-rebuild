# 📚 ANALYSE COMPLÈTE API KIUBI - 4240 LIGNES

**Date d'analyse :** `date`
**Source :** api.txt (documentation complète Kiubi API Front)
**Version :** API v1 (Public, sans authentification)

---

## 🎯 RÉSUMÉ EXÉCUTIF

L'API Kiubi Front est **publique** (pas d'authentification requise) mais **strictement limitée** :
- ✅ **Rate Limit :** 120 requêtes / 5 minutes
- ✅ **Pagination :** Maximum 20 items par page
- ✅ **Format :** Toutes les réponses suivent `{meta, error, data}`
- ✅ **Quota check :** `/rate.json` ne consomme PAS de quota

---

## 📋 ENDPOINTS ESSENTIELS POUR MIGRATION

### 1️⃣ **BLOG** (Articles)

#### GET `/blog/posts.json` 
**Récupère les articles du blog**
```javascript
Params: {
  limit: 20 (max),
  page: 0, 1, 2... (démarre à 0),
  sort: ['date', '-date', 'title', '-title', 'category', '-category', 'author', '-author'],
  extra_fields: ['texts'] // Inclut text1-text15
}
```
**Response:** 
```json
{
  "meta": {
    "success": true,
    "status_code": 200,
    "rate_limit": 120,
    "rate_remaining": 115,
    "link": {
      "first_page": "...",
      "previous_page": "...",
      "next_page": "...",
      "last_page": "..."
    },
    "items_count": 2500,
    "items_per_page": 20,
    "current_page": 0
  },
  "error": [],
  "data": [
    {
      "id": 123,
      "title": "Mon article",
      "slug": "mon-article",
      "content": "<p>Contenu HTML...</p>",
      "header": "Chapeau",
      "excerpt": "Résumé",
      "author": "Nom Auteur",
      "url": "https://...",
      "permalink": "https://...",
      "publication_date": "2024-01-15 10:30:00",
      "publication_date_timestamp": 1705315800,
      "category_id": 5,
      "category_slug": "actualites",
      "category_name": "Actualités",
      "thumb": {
        "id": 456,
        "url": "https://.../image.jpg",
        "url_miniature": "...",
        "url_vignette": "...",
        "url_g_miniature": "...",
        "url_g_vignette": "..."
      },
      "comments_count": 3,
      "has_comments_open": true,
      "is_pinned": false,
      "text1": "Champ custom 1",
      // ... text2 à text15
    }
  ]
}
```

#### GET `/blog/categories.json`
**Liste toutes les catégories du blog**
- Pas de pagination (retourne toutes les catégories)

#### GET `/blog/archives.json`
**Liste les archives par mois/année**

---

### 2️⃣ **SEARCH** (Recherche optimisée) ⭐

#### GET `/search/blog/posts.json` ⭐ OPTIMAL
**Recherche dans les articles - PLUS EFFICACE**
```javascript
Params: {
  term: '', // Vide = tous les posts
  fields: ['title', 'header', 'content'], // Restreindre champs
  is_pinned: true/false,
  limit: 20,
  page: 0,
  sort: ['date', '-date', 'title', 'category', 'author']
}
```
**Avantage :** Même structure que `/blog/posts.json` mais recherche optimisée

#### GET `/search/cms/pages.json` ⭐ OPTIMAL
**Recherche dans les pages du site**
```javascript
Params: {
  term: '', // Vide = toutes les pages
  fields: ['title', 'subtitle', 'text1', ..., 'text15'],
  limit: 20,
  page: 0,
  sort: ['page', '-page', 'date', '-date'],
  extra_fields: ['texts'] // IMPORTANT : inclut text1-text15
}
```
**Response data :**
```json
{
  "id": 789,
  "title": "À propos",
  "subtitle": "Sous-titre",
  "group": "pages-principales",
  "type": "page",
  "page_title": "Page parente",
  "page_slug": "parente",
  "url": "https://.../about",
  "is_home": false,
  "text1": "Contenu zone 1",
  "text2": "Contenu zone 2",
  // ... text3 à text15
}
```

---

### 3️⃣ **CMS** (Pages & Structure)

#### GET `/cms/posts.json`
**Billets de pages groupés**
```javascript
Params: {
  group_name: 'nom-du-groupe', // Requis
  limit: 20,
  page: 0,
  sort: ['title', 'position', 'rand', 'crea', '-crea'],
  extra_fields: ['texts']
}
```

#### GET `/cms/menus/{key}/pages.json`
**Arborescence complète d'un menu**
```javascript
Params: {
  key: 'menu-principal', // ID du menu
  depth: 1 // Profondeur (1, 2, 3...)
}
```
**Use case :** Récupérer navigation principale

#### GET `/cms/pages/{slug}/children.json`
**Pages enfants d'une page**
```javascript
Params: {
  slug: 'services', // Slug de la page parente
  depth: 1
}
```

#### GET `/cms/pages/{slug}/parent.json`
**Page parente d'une page**

#### GET `/cms/pages/{slug}/posts.json`
**Billets attachés à une page**
```javascript
Params: {
  slug: 'actualites',
  children: true, // Inclut billets des enfants
  group_name: 'news',
  limit: 20,
  page: 0,
  extra_fields: ['texts']
}
```

---

### 4️⃣ **MEDIA** (Images & Fichiers)

#### GET `/media/files/{media_id}.json`
**Détails d'un média spécifique**
```json
{
  "id": 12345,
  "type": "image",
  "name": "Logo",
  "description": "Logo société",
  "original_name": "logo.png",
  "mime": "image/png",
  "weight": 45678,
  "width": 800,
  "height": 600,
  "url": "https://.../media/logo.png",
  "thumb": {
    "url": "...",
    "url_miniature": "...",
    "url_vignette": "..."
  }
}
```

#### GET `/media/folders/{key}`
**Médias d'un dossier**
```javascript
Params: {
  key: 'photos-equipe', // ID du dossier
  sort: ['alpha', '-date'],
  limit: 20,
  page: 0,
  extra_fields: ['thumb']
}
```
**Use case :** Télécharger tous les médias d'un dossier spécifique

---

### 5️⃣ **PREFS** (Configuration) ⭐ IMPORTANT

#### GET `/prefs/site.json` ⭐
**Configuration générale du site**
```json
{
  "site_name": "In Vivo Expert",
  "site_excerpt": "Cabinet d'expertise comptable",
  "site_description": "Description longue...",
  "site_logo_url": "https://.../logo.png",
  "is_contact_page_active": true,
  "company_name": "In Vivo Expert SARL",
  "company_address": "123 rue...",
  "company_zipcode": "75001",
  "company_city": "Paris",
  "company_country": "France",
  "company_phone": "01 23 45 67 89",
  "company_mobile": "06 12 34 56 78",
  "company_fax": "01 23 45 67 90",
  "theme": "nom-du-theme"
}
```

#### GET `/prefs/blog.json`
**Configuration du blog**
```json
{
  "has_comments_open": true,
  "has_comments_anonymous": false,
  "has_captcha": true,
  "is_active": true
}
```

#### GET `/prefs/medias.json`
**Tailles d'images**
```json
{
  "g_vignette_width": 800,
  "g_vignette_height": 600,
  "vignette_width": 400,
  "vignette_height": 300,
  "g_miniature_width": 200,
  "g_miniature_height": 150,
  "miniature_width": 100,
  "miniature_height": 75
}
```

---

### 6️⃣ **RATE** (Quota) ⭐ CRUCIAL

#### GET `/rate.json`
**Vérifier quota disponible - NE CONSOMME PAS DE REQUÊTE !**
```json
{
  "data": {
    "rate_limit": 120,
    "rate_remaining": 87,
    "reset_time": 1705316400
  }
}
```
**Usage :** Vérifier avant chaque batch de 50 requêtes

---

## 🚫 ENDPOINTS NON DISPONIBLES

Ces endpoints n'existent **PAS** dans l'API Front :
- ❌ `/site/pages.json` (utiliser `/search/cms/pages.json`)
- ❌ `/pages.json` direct
- ❌ Endpoints nécessitant authentification (API Developer)

---

## 📊 STRUCTURE RÉPONSE STANDARD

**Toutes** les réponses suivent ce format :

```json
{
  "meta": {
    "success": true,
    "status_code": 200,
    "rate_limit": 120,
    "rate_remaining": 95,
    "link": {
      "first_page": "/blog/posts.json?page=0",
      "previous_page": null,
      "next_page": "/blog/posts.json?page=1",
      "last_page": "/blog/posts.json?page=125"
    },
    "items_count": 2500,
    "items_per_page": 20,
    "current_page": 0
  },
  "error": [],
  "data": [ /* ... données ... */ ]
}
```

### Codes d'erreur courants :
- `4001` : Paramètre manquant
- `4002` : Données invalides
- `4401` : Ressource introuvable
- `4307` : Authentification requise
- `4308` / `4310` : Accès refusé

---

## ⚡ STRATÉGIE D'EXTRACTION OPTIMALE

### **Plan A : API Search (RECOMMANDÉ)**

```javascript
// 1. Configuration du site
GET /prefs/site.json
GET /prefs/blog.json
GET /prefs/medias.json

// 2. Catégories (pas de pagination)
GET /blog/categories.json

// 3. Pages (avec text1-15)
GET /search/cms/pages.json?term=&limit=20&page=0&extra_fields=texts
// Pagination jusqu'à items_count

// 4. Articles blog
GET /search/blog/posts.json?term=&limit=20&page=0
// Pagination jusqu'à items_count
// Vérifier /rate.json tous les 50 appels

// 5. Médias
// Extraire URLs depuis posts.thumb et pages.text1-15
```

### **Gestion du Rate Limit**

```javascript
async function safeExport() {
  let requestCount = 0;
  
  while (hasMore) {
    // Check quota tous les 50 appels
    if (requestCount % 50 === 0) {
      const quota = await axios.get('/rate.json');
      if (quota.data.data.rate_remaining < 10) {
        console.log('Pause 5 minutes...');
        await sleep(300000); // 5 min
      }
    }
    
    // Requête normale
    const response = await axios.get(endpoint);
    requestCount++;
    
    // Sauvegarde incrémentale tous les 10 pages
    if (requestCount % 10 === 0) {
      await saveData(data);
    }
    
    // Délai entre requêtes
    await sleep(1000); // 1 seconde
  }
}
```

### **Plan B : Hybride (OPTIMAL pour gros sites)**

1. **API** pour données structurées (blog, catégories, config)
2. **wget** pour capture HTML complète (backup)
3. **Combinaison** pour validation croisée

```bash
# API pour JSON structuré
npm run export:api

# wget pour HTML complet (pas de rate limit)
npm run export:static

# Médias
npm run download:medias
```

---

## 🔍 ENDPOINTS BONUS (non utilisés pour migration)

### Forms (Formulaires Dismoi?)
- `GET /forms/{key}.json` - Structure formulaire
- `POST /forms/{key}.json` - Envoyer réponse

### Geo (Géolocalisation)
- `GET /geo/countries.json` - Liste pays
- `GET /geo/countries/{id}/regions.json` - Régions

### Session (Authentification utilisateurs)
- `GET /session.json` - Session courante
- `PUT /session.json` - Connexion
- `DELETE /session.json` - Déconnexion

### Users (Membres)
- `GET /users/{id}.json` - Profil membre
- `GET /users/{id}/addresses.json` - Adresses
- `GET /users/{id}/orders.json` - Commandes

### Catalog (E-commerce - non pertinent pour site comptable)
- `GET /catalog/products.json`
- `GET /catalog/categories.json`
- ...

---

## 💡 BONNES PRATIQUES

### ✅ À FAIRE
1. **Toujours vérifier** `meta.items_count` pour connaître le total
2. **Checker `/rate.json`** tous les 50 appels (ne consomme pas de quota)
3. **Sauvegarder incrémentalement** tous les 10 pages
4. **Utiliser `extra_fields=texts`** pour récupérer text1-15 des pages
5. **Délai 1 seconde** minimum entre requêtes
6. **Pause 5 minutes** si `rate_remaining < 10`

### ❌ À ÉVITER
1. Ne **PAS** faire 120 requêtes d'un coup
2. Ne **PAS** oublier les sauvegardes incrémentales
3. Ne **PAS** utiliser `/blog/posts.json` directement (préférer `/search/blog/posts.json`)
4. Ne **PAS** chercher `/site/pages.json` (n'existe pas)
5. Ne **PAS** négliger le champ `extra_fields`

---

## 📈 ESTIMATION TEMPS D'EXPORT

Pour un site moyen (2500 posts + 100 pages) :

```
Configuration : 3 requêtes = 3 secondes
Catégories : 1 requête = 1 seconde
Pages : 5 requêtes (100/20) = 5 secondes
Posts : 125 requêtes (2500/20) = 125 secondes

Total : ~134 requêtes = ~3 minutes
```

**Avec rate limit :**
- 120 req/5min
- Pause après 110 requêtes
- **Temps réel : ~8-10 minutes** pour export complet

---

## 🎯 RÉSULTAT ATTENDU

```
exports/
├── config/
│   └── site-config.json (prefs site + blog + medias)
├── categories/
│   └── all-categories.json
├── pages/
│   ├── all-pages.json (avec text1-15)
│   └── page-{id}.json (individuel)
├── posts/
│   ├── all-posts.json (complet avec content HTML)
│   └── post-{id}.json (individuel)
└── medias/
    └── all-medias.json (URLs extraites)
```

---

## 📝 NOTES IMPORTANTES

1. **API Front = Public** : Pas de token requis, mais rate limit strict
2. **Format images** : 5 tailles disponibles (url, miniature, vignette, g_miniature, g_vignette)
3. **Contenu HTML** : Champ `content` des posts est en HTML, à convertir en Markdown
4. **Champs custom** : `text1` à `text15` pour posts ET pages
5. **Pagination** : Toujours commence à `page=0`, max 20 items

---

**Fin de l'analyse - Document généré à partir de api.txt (4240 lignes)**
