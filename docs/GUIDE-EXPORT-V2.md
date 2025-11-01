# 🚀 GUIDE RAPIDE - EXPORT OPTIMISÉ V2

**Version :** 2.0 - Optimisée après analyse complète API (4240 lignes)
**Date :** Janvier 2025

---

## ⚡ DÉMARRAGE RAPIDE (30 secondes)

```bash
# 1. Lancer l'export optimisé
npm run export:api:v2

# 2. Surveiller le terminal - le script affiche :
#    - Quota disponible en temps réel
#    - Progression détaillée
#    - Sauvegardes incrémentales
#    - Estimations de temps
```

---

## 📊 CE QUE FAIT LE SCRIPT V2

### ✅ Améliorations par rapport à V1

1. **Monitoring quota en temps réel**
   - Vérifie `/rate.json` (ne consomme PAS de quota)
   - Affiche requêtes restantes tous les 50 appels
   - Pause automatique si quota < 10

2. **Endpoints optimisés**
   - `/search/blog/posts.json` au lieu de `/blog/posts.json`
   - `/search/cms/pages.json` avec `extra_fields=texts`
   - Export configuration site (`/prefs/*`)

3. **Sauvegardes sécurisées**
   - Sauvegarde incrémentale tous les 10 pages
   - Pas de perte de données en cas d'erreur
   - Rapport d'export détaillé

4. **Gestion intelligente du rate limit**
   - Délai 1 seconde entre requêtes
   - Pause 5 minutes si quota faible
   - Limite de sécurité à 50 pages par run

---

## 📁 STRUCTURE D'EXPORT

```
exports/
├── config/
│   └── site-config.json          # ✨ NOUVEAU : Prefs site + blog + medias
├── categories/
│   └── all-categories.json
├── pages/
│   ├── all-pages.json             # ✨ AVEC text1-text15
│   └── page-{id}.json
├── posts/
│   ├── all-posts.json
│   └── post-{id}.json
├── medias/
│   └── all-medias.json            # ✨ URLs depuis posts ET pages
└── export-report-v2.json          # ✨ Rapport détaillé
```

---

## 🎯 SCÉNARIOS D'UTILISATION

### Scénario 1 : Export complet (site moyen)

**Votre site :** ~2000 articles + 50 pages

```bash
npm run export:api:v2
```

**Durée estimée :** 5-8 minutes
**Requêtes :** ~105 (100 posts + 3 pages + 2 config)
**Quota utilisé :** 87% (reste 15 requêtes)

---

### Scénario 2 : Gros site (rate limit)

**Votre site :** 5000+ articles

Le script s'arrêtera automatiquement à 50 pages (1000 posts) :

```bash
npm run export:api:v2
# ⏸️  Pause automatique après 50 pages
# 💾 Données sauvegardées dans exports/posts/all-posts.json

# Attendez 5 minutes puis relancer
npm run export:api:v2
```

**Alternative recommandée :**
```bash
# Utilisez wget pour éviter rate limit
npm run export:static
```

---

### Scénario 3 : Export hybride (OPTIMAL)

**Combinaison API + wget**

```bash
# 1. API pour données structurées (JSON)
npm run export:api:v2

# 2. wget pour backup HTML complet
npm run export:static

# 3. Téléchargement médias
npm run download:medias

# 4. Conversion Lovable
npm run convert:lovable
```

---

## 🔍 COMPRENDRE LES LOGS

### Logs normaux (tout va bien ✅)

```
╔════════════════════════════════════════════════════════╗
║   🚀 KIUBI API EXPORTER V2 - VERSION OPTIMISÉE       ║
╚════════════════════════════════════════════════════════╝

📍 API URL: https://www.in-vivo-expert.fr/api/v1
📁 Export vers: /Users/.../exports

📊 Quota disponible: 120 requêtes
⏱️  Reset dans: 300 secondes

⚙️  Export configuration du site...
  ✓ Préférences site récupérées
  ✓ Préférences blog récupérées
  ✓ Préférences médias récupérées
✅ Configuration exportée

🗂️  Export des catégories...
✅ 8 catégories exportées

📄 Export des pages du site...
   Stratégie: endpoint /search/cms/pages.json avec extra_fields

  → Récupération des pages...
  📊 45 pages trouvées (3 pages API)

  ✓ Page 1/3 (20 pages) - Total: 20
  ✓ Page 2/3 (20 pages) - Total: 40
  ✓ Page 3/3 (5 pages) - Total: 45

✅ 45 pages exportées

📝 Export des articles de blog...
   Stratégie: endpoint /search/blog/posts.json pour efficacité maximale

  → Récupération info totales...
  📊 2340 articles trouvés (117 pages)
  ⏱️  Temps estimé: 3 minutes

  ✓ Page 1/117 (20 posts) - Total: 20
  ✓ Page 2/117 (20 posts) - Total: 40
  ...
  ✓ Page 10/117 (20 posts) - Total: 200
  💾 Sauvegarde incrémentale (200 posts)
  
  ✓ Page 20/117 (20 posts) - Total: 400
  💾 Sauvegarde incrémentale (400 posts)
  
  ...
  
  📊 Quota actuel: 65 requêtes
  
  ✓ Page 50/117 (20 posts) - Total: 1000

⚠️  Limite de sécurité atteinte (50 pages)
💡 Relancez le script après 5 minutes pour continuer

✅ 1000 posts exportés sur 2340 trouvés

🖼️  Extraction des URLs de médias...
  ✓ 345 médias trouvés dans les posts
  ✓ 23 médias supplémentaires dans les pages
✅ 368 URLs de médias extraites
💡 Utilisez: npm run download:medias pour télécharger

╔════════════════════════════════════════════════════════╗
║   ✅ EXPORT TERMINÉ                                   ║
╚════════════════════════════════════════════════════════╝

📊 RAPPORT D'EXPORT:
{
  "config": "exported",
  "posts": 1000,
  "pages": 45,
  "categories": 8,
  "medias": 368
}

💡 ÉTAPES SUIVANTES:
   1. npm run export:static  → Capture wget du site complet
   2. npm run download:medias → Téléchargement des images
   3. npm run convert:lovable → Conversion format Lovable

📊 Quota restant: 54 requêtes
```

---

### Logs avec rate limit (pause automatique ⏸️)

```
  ✓ Page 109/117 (20 posts) - Total: 2180
  
  📊 Quota actuel: 8 requêtes
  ⚠️  Quota faible - sauvegarde et pause...
  💾 Sauvegarde incrémentale (2180 posts)
  ⏸️  Pause de 300s pour recharge du quota...
  ▶️  Reprise de l'export...
  
  ✓ Page 110/117 (20 posts) - Total: 2200
```

---

### Logs d'erreur (problème ❌)

```
❌ Erreur export posts: Request failed with status code 429

╔════════════════════════════════════════════════════════╗
║   ❌ ERREUR FATALE                                    ║
╚════════════════════════════════════════════════════════╝

💾 Vérifiez exports/ pour données partielles sauvegardées
```

**Solution :** Les données sont sauvegardées ! Attendez 5 minutes et relancez.

---

## 🆘 DÉPANNAGE

### Problème : "Rate limit exceeded"

```bash
# Vérifier le quota actuel
curl https://www.in-vivo-expert.fr/api/v1/rate.json

# Attendre 5 minutes puis relancer
npm run export:api:v2
```

---

### Problème : Export incomplet

```bash
# Vérifier ce qui a été sauvegardé
ls -lh exports/posts/
cat exports/export-report-v2.json

# Relancer (reprendra automatiquement)
npm run export:api:v2
```

---

### Problème : Trop lent / timeout

```bash
# Utiliser wget au lieu de l'API
npm run export:static
```

---

## 📈 COMPARAISON V1 vs V2

| Critère | V1 (ancien) | V2 (optimisé) |
|---------|-------------|---------------|
| **Endpoints** | `/blog/posts.json` | `/search/blog/posts.json` ✅ |
| **Monitoring quota** | ❌ Non | ✅ En temps réel |
| **Sauvegardes** | ❌ Finale seulement | ✅ Incrémentales (10 pages) |
| **Config site** | ❌ Non | ✅ `/prefs/*` |
| **Extra fields** | ❌ Non | ✅ text1-text15 |
| **Gestion erreurs** | ❌ Perte de données | ✅ Données sauvées |
| **Pause auto** | ❌ Non | ✅ Si quota < 10 |
| **Rapport** | ❌ Basique | ✅ Détaillé |

---

## 💡 TIPS & ASTUCES

### 1. Vérifier quota AVANT export

```bash
curl https://www.in-vivo-expert.fr/api/v1/rate.json | jq
```

### 2. Exporter par étapes

```bash
# Jour 1 : Config + catégories + pages (léger)
EXPORT_POSTS=false npm run export:api:v2

# Jour 2 : Posts (lourd)
EXPORT_CATEGORIES=false EXPORT_PAGES=false npm run export:api:v2
```

### 3. Surveiller en temps réel

```bash
# Terminal 1 : Export
npm run export:api:v2

# Terminal 2 : Surveillance
watch -n 5 'ls -lh exports/posts/ | tail -5'
```

### 4. Backup avant conversion

```bash
# Sauvegarder exports/
tar -czf exports-backup-$(date +%Y%m%d).tar.gz exports/

# Puis convertir
npm run convert:lovable
```

---

## 📚 DOCUMENTATION COMPLÈTE

- 📖 **Analyse API complète** : `docs/API-KIUBI-COMPLETE.md`
- 📘 **Guide migration** : `docs/GUIDE-MIGRATION.md`
- 📗 **README principal** : `README.md`
- 📕 **Quickstart** : `QUICKSTART.md`

---

## 🎯 PROCHAINES ÉTAPES

Après export réussi :

```bash
# 1. Vérifier les données
cat exports/export-report-v2.json

# 2. Capture statique (backup)
npm run export:static

# 3. Télécharger médias
npm run download:medias

# 4. Convertir pour Lovable
npm run convert:lovable

# 5. Envoyer sur Lovable
# (voir docs/GUIDE-MIGRATION.md section 4)
```

---

**Bon export ! 🚀**
