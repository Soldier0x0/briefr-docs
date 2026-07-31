import path from 'path';
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

function briefrTailwindPlugin() {
  return {
    name: 'briefr-tailwind',
    configurePostCss(postcssOptions: {plugins: unknown[]}) {
      postcssOptions.plugins.push(require('@tailwindcss/postcss'));
      return postcssOptions;
    },
    configureWebpack() {
      return {resolve: {alias: {'@': path.resolve(__dirname, 'src')}}};
    },
  };
}

const config: Config = {
  title: 'BRIEFR',
  tagline: 'Self-hosted CVE intelligence and detection engineering',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
    faster: true,
  },

  // Cloudflare Workers custom domain (docs.projectjupiter.in) serves at site root.
  url: 'https://docs.projectjupiter.in',
  baseUrl: '/',
  organizationName: 'Soldier0x0',
  projectName: 'briefr-docs',
  trailingSlash: false,

  headTags: [
    {tagName: 'meta', attributes: {name: 'robots', content: 'index, follow'}},
    {
      tagName: 'link',
      attributes: {rel: 'canonical', href: 'https://docs.projectjupiter.in/'},
    },
    {
      tagName: 'script',
      attributes: {type: 'application/ld+json'},
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'BRIEFR Documentation',
        url: 'https://docs.projectjupiter.in/',
        description:
          'Official documentation for BRIEFR — self-hosted CVE intelligence and detection engineering.',
        publisher: {
          '@type': 'Organization',
          name: 'BRIEFR',
          url: 'https://github.com/Soldier0x0/briefr',
        },
      }),
    },
  ],

  // migrate.cjs rewrites every cross-repo link, so broken links are always a
  // regression — fail the build rather than ship them.
  onBrokenLinks: 'throw',

  // .md files render as CommonMark (no MDX parsing) so migrated docs with
  // literal < and { survive; .mdx files still get full MDX.
  markdown: {
    format: 'detect',
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/Soldier0x0/briefr-docs/tree/main/',
          exclude: ['**/how-briefr-works/synced/**', '**/superpowers/**'],
        },
        blog: false,
        theme: {
          customCss: ['./src/css/custom.css', './src/css/tailwind.css'],
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [briefrTailwindPlugin],

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        indexBlog: false,
        docsRouteBasePath: '/docs',
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],

  themeConfig: {
    image: 'img/og-image.png',
    metadata: [
      {name: 'twitter:card', content: 'summary_large_image'},
      {name: 'twitter:site', content: '@Soldier0x0'},
      {
        name: 'description',
        content:
          'Official BRIEFR documentation — install, operate, and extend self-hosted CVE intelligence. User guide, admin runbooks, API reference, security notes, and learning pathways.',
      },
      {
        property: 'og:title',
        content: 'BRIEFR Documentation',
      },
      {
        property: 'og:description',
        content:
          'Self-hosted CVE intelligence and detection engineering — official guides, API reference, and learning tracks.',
      },
      {property: 'og:type', content: 'website'},
      {property: 'og:url', content: 'https://docs.projectjupiter.in/'},
      {property: 'og:site_name', content: 'BRIEFR Docs'},
      {name: 'keywords', content: 'BRIEFR, CVE, vulnerability intelligence, detection engineering, Sigma, self-hosted, security operations'},
    ],
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'BRIEFR',
      hideOnScroll: false,
      items: [
        {to: '/docs/user-guide', label: 'User', position: 'left'},
        {to: '/docs/admin-guide', label: 'Admin', position: 'left'},
        {to: '/docs/pathways', label: 'Pathways', position: 'left'},
        {to: '/docs/how-briefr-works', label: 'Learn', position: 'left'},
        {to: '/docs/developer-guide', label: 'Developer', position: 'left'},
        {to: '/docs/api-reference', label: 'API', position: 'left'},
        {to: '/docs/security-guide', label: 'Security', position: 'left'},
        {to: '/docs/faq', label: 'FAQ', position: 'right'},
        {
          href: 'https://briefrdemo.projectjupiter.in',
          label: 'Live demo',
          position: 'right',
        },
        {
          href: 'https://github.com/Soldier0x0/briefr',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Guides',
          items: [
            {label: 'User Guide', to: '/docs/user-guide'},
            {label: 'Administrator Guide', to: '/docs/admin-guide'},
            {label: 'Pathways', to: '/docs/pathways'},
            {label: 'How BRIEFR Works', to: '/docs/how-briefr-works'},
            {label: 'Developer Guide', to: '/docs/developer-guide'},
            {label: 'Security Guide', to: '/docs/security-guide'},
          ],
        },
        {
          title: 'Reference',
          items: [
            {label: 'API Reference', to: '/docs/api-reference'},
            {label: 'Integrations', to: '/docs/integrations'},
            {label: 'Source deep-dives', to: '/docs/how-briefr-works/intel-lifecycle/sources'},
            {label: 'FAQ', to: '/docs/faq'},
          ],
        },
        {
          title: 'Project',
          items: [
            {
              label: 'Live demo',
              href: 'https://briefrdemo.projectjupiter.in',
            },
            {label: 'Getting started', to: '/docs/getting-started'},
            {label: 'Product status', to: '/docs/product-status'},
            {label: 'Roadmap', to: '/docs/roadmap'},
            {label: 'Release Notes', to: '/docs/release-notes'},
            {label: 'GitHub', href: 'https://github.com/Soldier0x0/briefr'},
          ],
        },
        {
          title: 'Legal',
          items: [
            {label: 'About this site', to: '/docs/legal/about-this-site'},
            {label: 'Privacy Policy', to: '/docs/legal/privacy-policy'},
            {label: 'Terms of Use', to: '/docs/legal/terms-of-use'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Sai Harsha Vardhan · Apache-2.0 · Self-hosted — your data stays yours. · Not a substitute for professional security advice.`,
    },
    prism: {
      theme: prismThemes.oneDark,
      darkTheme: prismThemes.oneDark,
      additionalLanguages: [
        'bash',
        'json',
        'python',
        'yaml',
        'sql',
        'toml',
        'nginx',
        'powershell',
        'docker',
      ],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
