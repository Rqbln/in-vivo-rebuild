const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const postsJsonPath = path.join(repoRoot, 'exports', 'posts', 'all-posts.json');
const imagesJsonPath = path.join(repoRoot, 'exports', 'supabase-images-urls.json');
const mdPostsDir = path.join(repoRoot, 'lovable-ready', 'content', 'posts');

function normalizeSlug(s) {
  if (!s) return '';
  return s.toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .replace(/-+/g, '-');
}

function safeReadJson(p) {
  if (!fs.existsSync(p)) return null;
  const txt = fs.readFileSync(p, 'utf8');
  try { return JSON.parse(txt); } catch (e) { console.error('JSON parse error', p, e); return null; }
}

const posts = safeReadJson(postsJsonPath);
const images = safeReadJson(imagesJsonPath);
if (!posts) { console.error('Missing posts JSON at', postsJsonPath); process.exit(1); }
if (!images) { console.error('Missing images JSON at', imagesJsonPath); process.exit(1); }

// Build filename -> url map from images export
const imgMap = {};
images.forEach(i => { imgMap[i.filename] = i.url; });

// Read md files in dir
const mdFiles = fs.readdirSync(mdPostsDir).filter(f => f.endsWith('.md'));
const fileSlugMap = {};
mdFiles.forEach(f => {
  const name = f.replace(/\.md$/, '');
  fileSlugMap[normalizeSlug(name)] = f;
});

const updatedFiles = [];

posts.forEach(p => {
  const thumbId = p.thumb && p.thumb.id;
  if (!thumbId) return; // no image for this post
  const filename = `${thumbId}.jpg`;
  const imageUrl = imgMap[filename] || `https://whivezkkzwgagherygzu.supabase.co/storage/v1/object/public/images/${filename}`;

  // normalize slug from export
  const rawSlug = p.slug || p.permalink || p.url || p.title;
  const norm = normalizeSlug(rawSlug);

  // try to find matching md file by slug
  let mdFile = fileSlugMap[norm];

  // if not found, try matching by title-based filename
  if (!mdFile) {
    const titleBased = normalizeSlug(p.title);
    mdFile = fileSlugMap[titleBased];
  }

  if (!mdFile) {
    // try more fuzzy: find a file that contains the slug as prefix
    mdFile = mdFiles.find(f => normalizeSlug(f.replace('.md','')).startsWith(norm));
  }

  if (!mdFile) {
    console.warn(`No markdown file found for post id=${p.id} title='${p.title}' (slug:${p.slug})`);
    return;
  }

  const mdPath = path.join(mdPostsDir, mdFile);
  let content = fs.readFileSync(mdPath, 'utf8');

  // replace featured_image line in frontmatter
  const newLine = `featured_image: "${imageUrl}"`;
  if (/^featured_image:\s*".*"/m.test(content) || /^featured_image:\s*'.*'/m.test(content) || /^featured_image:\s*.*$/m.test(content)) {
    content = content.replace(/^featured_image:.*$/m, newLine);
  } else {
    // insert after excerpt line if present
    if (/^excerpt:.*$/m.test(content)) {
      content = content.replace(/(^excerpt:.*$)/m, `$1\n${newLine}`);
    } else {
      // insert into frontmatter block after the first line
      content = content.replace(/^(---\n)/, `$1${newLine}\n`);
    }
  }

  fs.writeFileSync(mdPath, content, 'utf8');
  updatedFiles.push({ mdFile, imageUrl });
});

console.log(`Updated ${updatedFiles.length} markdown files:`);
updatedFiles.forEach(u => console.log(` - ${u.mdFile} -> ${u.imageUrl}`));

if (updatedFiles.length === 0) console.log('No files updated.');

module.exports = { updatedFiles };