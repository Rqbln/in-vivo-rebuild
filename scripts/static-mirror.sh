#!/bin/zsh

# Script de capture miroir statique du site Kiubi
# Utilise wget pour récupérer toutes les pages et assets

set -e  # Arrêt en cas d'erreur

# Couleurs pour le terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}🌐 Capture miroir statique du site${NC}\n"

# Chargement des variables d'environnement
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
else
  echo "${RED}❌ Fichier .env non trouvé${NC}"
  echo "${YELLOW}💡 Copiez .env.example vers .env et configurez-le${NC}"
  exit 1
fi

SITE_URL="${SITE_URL:-https://www.in-vivo-expert.fr}"
OUTPUT_DIR="./site_static_mirror"

echo "${BLUE}Site cible: ${SITE_URL}${NC}"
echo "${BLUE}Répertoire de sortie: ${OUTPUT_DIR}${NC}\n"

# Vérification de wget
if ! command -v wget &> /dev/null; then
  echo "${RED}❌ wget n'est pas installé${NC}"
  echo "${YELLOW}💡 Installation avec Homebrew:${NC}"
  echo "   brew install wget"
  exit 1
fi

echo "${GREEN}📥 Début du téléchargement (cela peut prendre plusieurs minutes)...${NC}\n"

# Capture miroir avec wget
wget \
  --mirror \
  --convert-links \
  --page-requisites \
  --no-parent \
  --adjust-extension \
  --restrict-file-names=windows \
  --no-check-certificate \
  -e robots=off \
  --wait=1 \
  --random-wait \
  --user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" \
  --reject "*.ico,*.woff,*.woff2" \
  --directory-prefix="${OUTPUT_DIR}" \
  "${SITE_URL}"

echo "\n${GREEN}✅ Capture miroir terminée !${NC}"
echo "${BLUE}📁 Fichiers sauvegardés dans: ${OUTPUT_DIR}${NC}"

# Statistiques
echo "\n${BLUE}📊 Statistiques:${NC}"
FILE_COUNT=$(find "${OUTPUT_DIR}" -type f | wc -l | xargs)
DIR_COUNT=$(find "${OUTPUT_DIR}" -type d | wc -l | xargs)
TOTAL_SIZE=$(du -sh "${OUTPUT_DIR}" | cut -f1)

echo "   Fichiers: ${FILE_COUNT}"
echo "   Dossiers: ${DIR_COUNT}"
echo "   Taille totale: ${TOTAL_SIZE}"

# Liste des types de fichiers
echo "\n${BLUE}📑 Types de fichiers capturés:${NC}"
find "${OUTPUT_DIR}" -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -10

echo "\n${GREEN}✅ Capture terminée avec succès !${NC}"
