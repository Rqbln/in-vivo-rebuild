# 📞 Informations de contact & Logo - In Vivo Expert

## 📍 Coordonnées officielles

### Entreprise
**Nom :** In Vivo Expert  
**Slogan :** Votre expert CSE

### Adresse
```
47 Route de Montlhéry
91400 ORSAY
France
```

### Contact
**Téléphone :** 01 75 43 80 80  
**Fax :** 01 55 04 93 98

**Emails :**
- Contact général : `pqueriaux@in-vivo-expert.fr`
- Consultations stratégiques : `consultstrat@in-vivo-expert.fr`

---

## 🎨 Logo

### Fichier logo
**✅ Disponible sur Supabase Storage**

**URL publique :**
```
https://whivezkkzwgagherygzu.supabase.co/storage/v1/object/public/images/logo-invivo-expert.png
```

**Caractéristiques :**
- Format : PNG avec transparence (RGBA)
- Dimensions : 345 × 92 pixels
- Poids : 7.7 KB
- Qualité : Haute résolution pour web

### Utilisation dans le site

**Header (navigation) :**
```tsx
<img 
  src="https://whivezkkzwgagherygzu.supabase.co/storage/v1/object/public/images/logo-invivo-expert.png" 
  alt="In Vivo Expert - Votre expert CSE"
  className="h-12 w-auto"
/>
```

**Footer :**
```tsx
<img 
  src="https://whivezkkzwgagherygzu.supabase.co/storage/v1/object/public/images/logo-invivo-expert.png" 
  alt="In Vivo Expert"
  className="h-10 w-auto opacity-90"
/>
```

**Favicon :** 
À générer à partir du logo PNG (formats recommandés : 32x32, 64x64, 180x180)

---

## 📄 Sections contact à créer

### 1. Footer (toutes les pages)
```tsx
<footer className="bg-gray-900 text-white">
  <div className="container mx-auto px-4 py-8">
    <div className="grid md:grid-cols-3 gap-8">
      {/* Logo & Description */}
      <div>
        <img src="https://whivezkkzwgagherygzu.supabase.co/storage/v1/object/public/images/logo-invivo-expert.png" alt="In Vivo Expert" className="h-10 mb-4" />
        <p className="text-gray-400">Votre expert CSE</p>
      </div>
      
      {/* Contact */}
      <div>
        <h3 className="font-bold mb-4">Contact</h3>
        <p className="text-gray-400">
          47 Route de Montlhéry<br />
          91400 ORSAY<br />
          France
        </p>
        <p className="mt-4 text-gray-400">
          Tél : <a href="tel:+33175438080" className="hover:text-white">01 75 43 80 80</a><br />
          Fax : 01 55 04 93 98
        </p>
      </div>
      
      {/* Email */}
      <div>
        <h3 className="font-bold mb-4">Email</h3>
        <p className="text-gray-400">
          <a href="mailto:pqueriaux@in-vivo-expert.fr" className="hover:text-white">
            pqueriaux@in-vivo-expert.fr
          </a>
        </p>
      </div>
    </div>
  </div>
</footer>
```

### 2. Page Contact
Créer une page `/contact` avec :
- Formulaire de contact
- Carte Google Maps (47 Route de Montlhéry, 91400 ORSAY)
- Toutes les informations de contact affichées
- Lien vers `mailto:pqueriaux@in-vivo-expert.fr`
- Lien vers `tel:+33175438080`

### 3. Meta tags (SEO)
```html
<meta property="og:phone_number" content="01 75 43 80 80" />
<meta property="og:locale" content="fr_FR" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="In Vivo Expert" />
```

---

## ✅ Checklist d'intégration

- [ ] Logo ajouté dans le header (toutes les pages)
- [ ] Logo ajouté dans le footer (toutes les pages)
- [ ] Favicon généré depuis le logo
- [ ] Page contact créée avec formulaire
- [ ] Numéro de téléphone cliquable (`tel:` link)
- [ ] Email cliquable (`mailto:` link)
- [ ] Carte Google Maps intégrée
- [ ] Meta tags OpenGraph ajoutés
- [ ] Adresse complète visible dans le footer
- [ ] Fax mentionné (optionnel, peut être omis si non utilisé)

---

**Note :** Le logo est maintenant disponible sur Supabase Storage à l'URL publique suivante :
```
https://whivezkkzwgagherygzu.supabase.co/storage/v1/object/public/images/logo-invivo-expert.png
```
Vous pouvez l'utiliser directement dans tous vos composants React ! 🎨
