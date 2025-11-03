# 💰 Page "Combien coûte un expert ?" - Guide d'implémentation

## 📍 Données structurées

**Fichier JSON :** `lovable-ready/data/pricing-missions.json`

Ce fichier contient toutes les informations pour créer la page de tarification avec :
- Les 2 options de financement (employeur vs CSE)
- Les missions détaillées pour chaque option
- Les URLs, slugs, et références légales
- Le call-to-action de contact

---

## 🎨 Structure de la page

### 1. Hero Section
```tsx
<section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
  <div className="container mx-auto px-4">
    <h1 className="text-4xl font-bold mb-4">Combien coûte un expert ?</h1>
    <p className="text-xl">
      Le coût des missions d'expertise dépend de qui les finance : 
      l'employeur ou le budget de fonctionnement du CSE.
    </p>
  </div>
</section>
```

### 2. Choix du financement (2 colonnes)

```tsx
import pricingData from '@/data/pricing-missions.json';

export default function PricingPage() {
  const [selectedOption, setSelectedOption] = useState<'employeur' | 'cse' | null>(null);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Choix initial */}
      {!selectedOption && (
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {pricingData.pricing_options.map(option => (
            <div 
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              className="border-2 border-gray-200 rounded-lg p-8 cursor-pointer hover:border-blue-500 hover:shadow-lg transition"
            >
              <h2 className="text-2xl font-bold mb-2">{option.title}</h2>
              <p className="text-gray-600 mb-4">{option.subtitle}</p>
              <p className="text-sm">{option.description}</p>
              <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                Voir les missions
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Missions détaillées */}
      {selectedOption && (
        <div>
          <button 
            onClick={() => setSelectedOption(null)}
            className="mb-6 text-blue-600 hover:underline"
          >
            ← Retour au choix
          </button>
          
          {pricingData.pricing_options
            .find(opt => opt.id === selectedOption)
            ?.missions.map(mission => (
              <MissionCard key={mission.id} mission={mission} />
            ))
          }
        </div>
      )}

      {/* CTA Contact */}
      <ContactCTA data={pricingData.contact_cta} />
    </div>
  );
}
```

### 3. Composant Mission Card

```tsx
interface Mission {
  id: string;
  title: string;
  url: string;
  description: string;
  legal_reference?: string;
  legal_requirement?: string;
  financing: string;
}

function MissionCard({ mission }: { mission: Mission }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4 hover:shadow-md transition">
      <h3 className="text-xl font-bold mb-2">{mission.title}</h3>
      <p className="text-gray-700 mb-4">{mission.description}</p>
      
      <div className="flex flex-wrap gap-4 text-sm mb-4">
        {mission.legal_reference && (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            📜 {mission.legal_reference}
          </span>
        )}
        {mission.legal_requirement && (
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
            ⚖️ {mission.legal_requirement}
          </span>
        )}
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
          💰 {mission.financing}
        </span>
      </div>

      <a 
        href={mission.url}
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        En savoir plus →
      </a>
    </div>
  );
}
```

### 4. CTA Contact

```tsx
function ContactCTA({ data }: { data: typeof pricingData.contact_cta }) {
  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-8 text-center mt-12">
      <h2 className="text-3xl font-bold mb-4">{data.title}</h2>
      <p className="text-lg mb-6">{data.description}</p>
      
      <div className="flex flex-col md:flex-row justify-center gap-4">
        <a 
          href={`tel:+33${data.phone.replace(/\s/g, '').substring(1)}`}
          className="bg-white text-orange-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100"
        >
          📞 {data.phone}
        </a>
        <a 
          href={`mailto:${data.email}`}
          className="bg-white text-orange-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100"
        >
          📧 {data.email}
        </a>
        <a 
          href="/contact"
          className="bg-blue-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-950"
        >
          {data.button_text}
        </a>
      </div>
    </div>
  );
}
```

---

## 📋 Routes à créer

1. **`/combien-coute-expert-ce`** - Page principale avec choix
2. **`/examen-des-comptes-annuels`** - Mission situation économique
3. **`/examen-des-comptes-previsionnels`** - Mission politique sociale
4. **`/examen-des-orientations-strategiques`** - Mission orientations stratégiques
5. **`/assistance-plan-de-licenciement`** - Mission PSE
6. **`/assistance-procedure-d-alerte`** - Mission droit d'alerte
7. **`/assistance-rapport-annuel-d-activite-de-gestion`** - Rapport annuel CSE
8. **`/assistance-compte-rendu-de-fin-de-mandat`** - Compte rendu fin de mandat

---

## 🔗 Redirections 301 nécessaires

Ajouter dans le fichier de redirections Lovable/Vercel :

```
/combien-coute-expert-ce.html -> /combien-coute-expert-ce
/examen-des-comptes-annuels.html -> /examen-des-comptes-annuels
/examen-des-comptes-previsionnels.html -> /examen-des-comptes-previsionnels
/examen-des-orientations-strategiques.html -> /examen-des-orientations-strategiques
/assistance-plan-de-licenciement.html -> /assistance-plan-de-licenciement
/assistance-procedure-d-alerte.html -> /assistance-procedure-d-alerte
/assistance-rapport-annuel-d-activite-de-gestion.html -> /assistance-rapport-annuel-d-activite-de-gestion
/assistance-compte-rendu-de-fin-de-mandat.html -> /assistance-compte-rendu-de-fin-de-mandat
```

---

## 💡 Fonctionnalités supplémentaires recommandées

### Breadcrumb
```tsx
<nav className="text-sm text-gray-600 mb-6">
  <a href="/" className="hover:underline">Accueil</a>
  <span className="mx-2">/</span>
  <span>Combien coûte un expert ?</span>
</nav>
```

### Notes légales (bas de page)
```tsx
<div className="bg-gray-50 rounded-lg p-6 mt-12">
  <h3 className="font-bold mb-4">À noter :</h3>
  <ul className="space-y-2">
    {pricingData.legal_notes.map((note, i) => (
      <li key={i} className="flex items-start">
        <span className="text-blue-600 mr-2">✓</span>
        <span className="text-gray-700">{note}</span>
      </li>
    ))}
  </ul>
</div>
```

### Filtres interactifs
```tsx
const [filter, setFilter] = useState<'all' | 'legal' | 'optional'>('all');

// Filtrer les missions par type
const filteredMissions = missions.filter(m => {
  if (filter === 'legal') return m.legal_reference;
  if (filter === 'optional') return m.legal_requirement === 'Facultatif';
  return true;
});
```

---

## ✅ Checklist d'implémentation

- [ ] Créer la page `/combien-coute-expert-ce` avec le JSON
- [ ] Implémenter le système de choix (employeur vs CSE)
- [ ] Créer les 8 pages de missions détaillées
- [ ] Ajouter les redirections 301
- [ ] Intégrer le CTA de contact avec liens cliquables
- [ ] Ajouter les notes légales en bas de page
- [ ] Tester les liens internes entre pages
- [ ] Vérifier la responsivité mobile
- [ ] Ajouter le breadcrumb de navigation
- [ ] Optimiser le SEO (meta tags, schema.org)

---

**Le fichier JSON est prêt à être utilisé directement par Lovable !** 🚀

Pas besoin de Supabase pour ce contenu statique, le JSON est plus simple et plus performant.
