const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const mdPostsDir = path.join(repoRoot, 'lovable-ready', 'content', 'posts');
const supabaseUrl = 'https://whivezkkzwgagherygzu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoaXZlemtrendnYWdoZXJ5Z3p1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjAxNzQ0NSwiZXhwIjoyMDc3NTkzNDQ1fQ.5UuFbIyoXTQcTNvV0U90-UfCyH0xcpHAVE2LLuu5oaA';

function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return {};
  const lines = m[1].split('\n');
  const fm = {};
  lines.forEach(line => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.substr(0, idx).trim();
    let value = line.substr(idx+1).trim();
    value = value.replace(/^['\"]|['\"]$/g, '');
    fm[key] = value;
  });
  return fm;
}

(async () => {
  const files = fs.readdirSync(mdPostsDir).filter(f => f.endsWith('.md'));
  let updated = 0;
  for (const f of files) {
    const p = path.join(mdPostsDir, f);
    const txt = fs.readFileSync(p, 'utf8');
    const fm = parseFrontmatter(txt);
    const slug = fm.slug || f.replace('.md','');
    const featured = fm.featured_image || fm.image || '';
    if (!featured) continue;

    const url = `${supabaseUrl}/rest/v1/posts?slug=eq.${encodeURIComponent(slug)}`;
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ featured_image: featured })
      });
      if (!res.ok) {
        const text = await res.text();
        console.error(`Failed update ${slug}: ${res.status} ${res.statusText}\n${text}`);
      } else {
        const body = await res.json();
        if (Array.isArray(body) && body.length > 0) {
          updated++;
          console.log(`Updated ${slug} -> ${featured}`);
        } else {
          console.warn(`No row updated for ${slug} (maybe not found in DB)`);
        }
      }
    } catch (e) {
      console.error('Request error', e.message);
    }
  }
  console.log(`\nDone. ${updated} posts updated in Supabase (featured_image).`);
})();
