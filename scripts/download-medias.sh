#!/bin/bash
set -e
echo "🖼️  Téléchargement des médias Kiubi"
MEDIAS_JSON="./exports/medias/all-medias.json"
OUTPUT_DIR="./medias"
if [ ! -f "$MEDIAS_JSON" ]; then
  echo "❌ Fichier $MEDIAS_JSON non trouvé"
  exit 1
fi
mkdir -p "$OUTPUT_DIR"
echo "📥 Début du téléchargement..."
node scripts/download-medias.js
echo "✅ Script terminé"
