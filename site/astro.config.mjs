import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://shopmd.org',
  integrations: [
    starlight({
      title: 'SHOP.md',
      description: 'The open standard for AI-readable commerce.',
      lastUpdated: true,
      head: [
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          content: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'SHOP.md',
            url: 'https://shopmd.org',
            sameAs: ['https://github.com/shop-md/shop.md'],
          }),
        },
      ],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/shop-md/shop.md' },
      ],
      editLink: {
        baseUrl: 'https://github.com/shop-md/shop.md/edit/main/',
      },
      components: {
        Head: './src/components/Head.astro',
      },
      sidebar: [
        {
          label: 'Overview',
          items: [
            { label: 'Introduction', link: '/' },
            { label: 'Getting Started', link: '/getting-started/' },
          ],
        },
        {
          label: 'Specification',
          items: [
            { label: 'SHOP.md', link: '/spec/shop-md/' },
            { label: 'CATALOG.md', link: '/spec/catalog-md/' },
            { label: 'POLICIES.md', link: '/spec/policies-md/' },
            { label: 'BRAND.md', link: '/spec/brand-md/' },
          ],
        },
        {
          label: 'For Implementers',
          items: [
            { label: 'Validation', link: '/implement/validate/' },
          ],
        },
        {
          label: 'Examples',
          items: [
            { label: 'Acme Pet Supply', link: '/examples/acme-pet/' },
            { label: 'Nova Fashion', link: '/examples/nova-fashion/' },
            { label: 'Fold Electronics', link: '/examples/fold-electronics/' },
          ],
        },
        {
          label: 'Project',
          items: [
            { label: 'Contributing', link: '/contributing/' },
            { label: 'Maintainers', link: '/project/maintainers/' },
            { label: 'Changelog', link: '/project/changelog/' },
          ],
        },
      ],
    }),
  ],
});
