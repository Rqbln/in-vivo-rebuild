-- =============================================
-- SCHEMA SUPABASE POUR IN VIVO EXPERT
-- =============================================
-- Projet: in-vivo-rebuild
-- Date: 2025-11-01
-- Description: Tables pour blog, pages et redirections
-- =============================================

-- =============================================
-- 1. TABLE CATEGORIES
-- =============================================

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut lire
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
CREATE POLICY "Enable read access for all users" ON categories
  FOR SELECT USING (true);

-- Policy: Seuls les authentifiés peuvent modifier (optionnel)
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON categories;
CREATE POLICY "Enable insert for authenticated users only" ON categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON categories;
CREATE POLICY "Enable update for authenticated users only" ON categories
  FOR UPDATE USING (auth.role() = 'authenticated');

COMMENT ON TABLE categories IS 'Catégories des articles de blog';
COMMENT ON COLUMN categories.slug IS 'URL-friendly identifier (ex: actualites, fiscalite)';
COMMENT ON COLUMN categories.name IS 'Nom affiché de la catégorie';

-- =============================================
-- 2. TABLE POSTS (Articles de blog)
-- =============================================

CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author TEXT DEFAULT 'In Vivo Expert',
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  featured_image TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author);

-- Index pour la recherche full-text
CREATE INDEX IF NOT EXISTS idx_posts_title_search ON posts USING gin(to_tsvector('french', title));
CREATE INDEX IF NOT EXISTS idx_posts_content_search ON posts USING gin(to_tsvector('french', content));

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut lire les posts publiés
DROP POLICY IF EXISTS "Enable read access for published posts" ON posts;
CREATE POLICY "Enable read access for published posts" ON posts
  FOR SELECT USING (
    published_at IS NOT NULL 
    AND published_at <= NOW()
  );

-- Policy: Les authentifiés peuvent tout voir (pour l'admin)
DROP POLICY IF EXISTS "Enable full access for authenticated users" ON posts;
CREATE POLICY "Enable full access for authenticated users" ON posts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Seuls les authentifiés peuvent modifier
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON posts;
CREATE POLICY "Enable insert for authenticated users only" ON posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON posts;
CREATE POLICY "Enable update for authenticated users only" ON posts
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON posts;
CREATE POLICY "Enable delete for authenticated users only" ON posts
  FOR DELETE USING (auth.role() = 'authenticated');

COMMENT ON TABLE posts IS 'Articles de blog du site In Vivo Expert';
COMMENT ON COLUMN posts.slug IS 'URL-friendly identifier unique';
COMMENT ON COLUMN posts.content IS 'Contenu en Markdown';
COMMENT ON COLUMN posts.excerpt IS 'Résumé court de l''article';
COMMENT ON COLUMN posts.featured_image IS 'URL de l''image principale';
COMMENT ON COLUMN posts.published_at IS 'Date de publication (NULL = brouillon)';

-- =============================================
-- 3. TABLE PAGES (Pages statiques)
-- =============================================

CREATE TABLE IF NOT EXISTS pages (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  meta_title TEXT,
  meta_description TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(published_at);

-- Enable Row Level Security
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut lire les pages publiées
DROP POLICY IF EXISTS "Enable read access for published pages" ON pages;
CREATE POLICY "Enable read access for published pages" ON pages
  FOR SELECT USING (
    published_at IS NOT NULL 
    AND published_at <= NOW()
  );

-- Policy: Seuls les authentifiés peuvent modifier
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON pages;
CREATE POLICY "Enable insert for authenticated users only" ON pages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON pages;
CREATE POLICY "Enable update for authenticated users only" ON pages
  FOR UPDATE USING (auth.role() = 'authenticated');

COMMENT ON TABLE pages IS 'Pages statiques du site (à propos, contact, etc.)';
COMMENT ON COLUMN pages.content IS 'Contenu en Markdown ou HTML';
COMMENT ON COLUMN pages.description IS 'Description courte de la page';

-- =============================================
-- 4. TABLE REDIRECTS (Redirections 301)
-- =============================================

CREATE TABLE IF NOT EXISTS redirects (
  id SERIAL PRIMARY KEY,
  from_path TEXT UNIQUE NOT NULL,
  to_path TEXT NOT NULL,
  status_code INTEGER DEFAULT 301,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances (CRITIQUE pour le middleware)
CREATE INDEX IF NOT EXISTS idx_redirects_from ON redirects(from_path);
CREATE INDEX IF NOT EXISTS idx_redirects_active ON redirects(is_active) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut lire les redirections actives
DROP POLICY IF EXISTS "Enable read access for active redirects" ON redirects;
CREATE POLICY "Enable read access for active redirects" ON redirects
  FOR SELECT USING (is_active = true);

-- Policy: Seuls les authentifiés peuvent modifier
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON redirects;
CREATE POLICY "Enable insert for authenticated users only" ON redirects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON redirects;
CREATE POLICY "Enable update for authenticated users only" ON redirects
  FOR UPDATE USING (auth.role() = 'authenticated');

COMMENT ON TABLE redirects IS 'Redirections 301 pour la préservation SEO';
COMMENT ON COLUMN redirects.from_path IS 'Ancien chemin (ex: /blog/ancien-article)';
COMMENT ON COLUMN redirects.to_path IS 'Nouveau chemin (ex: /blog/nouveau-article)';
COMMENT ON COLUMN redirects.status_code IS 'Code HTTP (301 permanent, 302 temporaire)';
COMMENT ON COLUMN redirects.is_active IS 'Activer/désactiver la redirection';

-- =============================================
-- 5. FONCTION DE MAJ AUTOMATIQUE updated_at
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour categories
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour posts
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour pages
DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour redirects
DROP TRIGGER IF EXISTS update_redirects_updated_at ON redirects;
CREATE TRIGGER update_redirects_updated_at
  BEFORE UPDATE ON redirects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 6. VUES UTILES
-- =============================================

-- Vue: Posts avec catégorie
CREATE OR REPLACE VIEW posts_with_category AS
SELECT 
  p.*,
  c.name AS category_name,
  c.slug AS category_slug
FROM posts p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.published_at IS NOT NULL 
  AND p.published_at <= NOW()
ORDER BY p.published_at DESC;

COMMENT ON VIEW posts_with_category IS 'Posts publiés avec informations de catégorie';

-- Vue: Posts récents
CREATE OR REPLACE VIEW recent_posts AS
SELECT 
  p.id,
  p.title,
  p.slug,
  p.excerpt,
  p.author,
  p.featured_image,
  p.published_at,
  c.name AS category_name,
  c.slug AS category_slug
FROM posts p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.published_at IS NOT NULL 
  AND p.published_at <= NOW()
ORDER BY p.published_at DESC
LIMIT 10;

COMMENT ON VIEW recent_posts IS '10 posts les plus récents';

-- =============================================
-- 7. DONNÉES INITIALES (OPTIONNEL)
-- =============================================

-- Catégorie par défaut
INSERT INTO categories (slug, name, description) 
VALUES ('non-classe', 'Non classé', 'Articles sans catégorie spécifique')
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- 8. GRANTS (PERMISSIONS)
-- =============================================

-- Permettre l'accès public en lecture via l'API
GRANT SELECT ON categories TO anon;
GRANT SELECT ON posts TO anon;
GRANT SELECT ON pages TO anon;
GRANT SELECT ON redirects TO anon;

-- Permettre l'accès complet aux utilisateurs authentifiés
GRANT ALL ON categories TO authenticated;
GRANT ALL ON posts TO authenticated;
GRANT ALL ON pages TO authenticated;
GRANT ALL ON redirects TO authenticated;

-- Permettre l'utilisation des séquences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================
-- FIN DU SCHEMA
-- =============================================

-- Afficher un résumé
DO $$
BEGIN
  RAISE NOTICE '✅ Schema créé avec succès !';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tables créées :';
  RAISE NOTICE '   - categories';
  RAISE NOTICE '   - posts';
  RAISE NOTICE '   - pages';
  RAISE NOTICE '   - redirects';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Row Level Security activé sur toutes les tables';
  RAISE NOTICE '📈 Index de performance créés';
  RAISE NOTICE '🔍 Index full-text pour la recherche';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Prochaines étapes :';
  RAISE NOTICE '   1. Exécutez scripts/import-to-supabase.js';
  RAISE NOTICE '   2. Exécutez scripts/upload-images-supabase.js';
  RAISE NOTICE '   3. Vérifiez les données dans le dashboard';
END $$;
