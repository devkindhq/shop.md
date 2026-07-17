import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');
const docsDir = join(__dirname, '../src/content/docs');

function stripFrontmatter(content) {
  if (!content.startsWith('---')) return content;
  const end = content.indexOf('---', 3);
  if (end === -1) return content;
  return content.slice(end + 3).trimStart();
}

function stripLeadingH1(content) {
  return content.replace(/^# .+\n/, '').trimStart();
}

async function writeDoc(dest, frontmatter, body) {
  const destPath = join(docsDir, dest);
  await mkdir(dirname(destPath), { recursive: true });
  const fm = Object.entries(frontmatter)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join('\n');
  await writeFile(destPath, `---\n${fm}\n---\n\n${body}`);
  console.log(`  wrote ${dest}`);
}

// Spec files: strip H1 (Starlight renders title from frontmatter), preserve body
const specs = [
  { src: 'spec/shop-md.md',      dest: 'spec/shop-md.md',      title: 'SHOP.md',      description: 'The open standard for AI-readable commerce context.' },
  { src: 'spec/catalog-md.md',   dest: 'spec/catalog-md.md',   title: 'CATALOG.md',   description: 'The queryable product catalogue endpoint standard for AI agents.' },
  { src: 'spec/policies-md.md',  dest: 'spec/policies-md.md',  title: 'POLICIES.md',  description: 'The store policy standard for AI-readable commerce.' },
  { src: 'spec/brand-md.md',     dest: 'spec/brand-md.md',     title: 'BRAND.md',     description: 'The brand identity and voice standard for AI-readable commerce.' },
];

// Example files: wrap raw content in a code block so readers see the real format
const examples = [
  { src: 'examples/acme-pet/shop.md',      dest: 'examples/acme-pet.md',      title: 'Acme Pet Supply',   store: 'a specialty grain-free and raw-diet pet food store' },
  { src: 'examples/nova-fashion/shop.md',  dest: 'examples/nova-fashion.md',  title: 'Nova Fashion',      store: 'a premium size-inclusive womenswear store' },
  { src: 'examples/fold-electronics/shop.md', dest: 'examples/fold-electronics.md', title: 'Fold Electronics', store: 'a refurbished consumer electronics store' },
];

console.log('Copying specs...');
for (const { src, dest, title, description } of specs) {
  const raw = await readFile(join(root, src), 'utf8');
  const body = stripLeadingH1(stripFrontmatter(raw));
  await writeDoc(dest, { title, description }, body);
}

console.log('Copying examples...');
for (const { src, dest, title, store } of examples) {
  const raw = await readFile(join(root, src), 'utf8');
  const body = `Complete SHOP.md implementation for ${store}.\n\n\`\`\`yaml\n${raw.trim()}\n\`\`\``;
  await writeDoc(dest, { title: `Example: ${title}`, description: `SHOP.md implementation for ${store}.` }, body);
}

console.log('Done.');
