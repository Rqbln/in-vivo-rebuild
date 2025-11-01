# 🖼️ Images des articles de blog - Informations importantes

## ✅ Statut actuel
Les **20 images des articles** sont déjà uploadées dans **Supabase Storage** et les données en base sont à jour.

## 📍 Localisation des images
**Bucket Supabase Storage :** `images` (public)  
**URL de base :** `https://whivezkkzwgagherygzu.supabase.co/storage/v1/object/public/images/`

**Liste complète des 20 images disponibles :**
```
1042.jpg  1302.jpg  1312.jpg  1322.jpg  1352.jpg
1532.jpg  1602.jpg  1612.jpg  1642.jpg  1652.jpg
1672.jpg  1682.jpg  1692.jpg  1702.jpg  1812.jpg
1992.jpg  2032.jpg  2192.jpg  862.jpg   972.jpg
```

## 🔗 Mapping images ↔ articles

Chaque article dans la table `posts` de Supabase a son champ `featured_image` correctement rempli avec l'URL complète.

**Exemples :**
```sql
-- Article: "Comment réussir vos NAO ?"
featured_image: https://whivezkkzwgagherygzu.supabase.co/storage/v1/object/public/images/1602.jpg

-- Article: "Bien choisir son expert CSE ne s'improvise pas !"
featured_image: https://whivezkkzwgagherygzu.supabase.co/storage/v1/object/public/images/1652.jpg

-- Article: "Suivez votre calendrier économique du CSE"
featured_image: https://whivezkkzwgagherygzu.supabase.co/storage/v1/object/public/images/2192.jpg
```

## 💡 Comment afficher les images

**Dans vos composants React :**

```tsx
// Récupération des posts avec leurs images
const { data: posts } = await supabase
  .from('posts')
  .select('*, category:categories(name)')
  .order('published_at', { ascending: false });

// Affichage dans un composant
{posts?.map(post => (
  <article key={post.id}>
    {post.featured_image && (
      <img 
        src={post.featured_image} 
        alt={post.title}
        className="w-full h-48 object-cover rounded-lg"
      />
    )}
    <h2>{post.title}</h2>
    <p>{post.excerpt}</p>
  </article>
))}
```

## 📋 Vérifications à faire

1. ✅ Les URLs d'images sont complètes et publiques (pas besoin d'authentification)
2. ✅ Le bucket `images` est configuré en **public**
3. ✅ 19 articles sur 20 ont une image (l'article "L'expert-comptable CSE : Un allié précieux pour ouvrir les yeux !" n'avait pas d'image dans l'export Kiubi original)

## 🎨 Recommandations UI/UX

- **Page Blog (liste)** : Afficher les `featured_image` en vignettes (aspect ratio 16:9)
- **Page Article (détail)** : Afficher l'image en hero en haut de l'article
- **Fallback** : Si `featured_image` est vide/null, utiliser une image placeholder ou ne rien afficher
- **Optimisation** : Les images ont des tailles variables (50KB à 5.5MB), envisager un lazy loading

## 🔍 Test rapide

Pour vérifier qu'une image fonctionne, ouvrez directement dans le navigateur :
```
https://whivezkkzwgagherygzu.supabase.co/storage/v1/object/public/images/862.jpg
```

Toutes les images sont accessibles et servent correctement ! 🚀

---

**Besoin d'aide ?** Les images sont toutes listées dans `exports/supabase-images-urls.json` si vous avez besoin du mapping complet.
