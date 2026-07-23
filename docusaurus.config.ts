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
          exclude: ['**/how-briefr-works/synced/**'],
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
    // Social preview — dedicated OG art can replace this later (Phase 4).
    image: 'img/favicon.ico',
    metadata: [
      {name: 'twitter:card', content: 'summary'},
      {
        name: 'description',
        content:
          'BRIEFR documentation — self-hosted CVE intelligence, detection engineering, and How BRIEFR Works learning tracks.',
      },
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
            {label: 'Roadmap', to: '/docs/roadmap'},
            {label: 'Release Notes', to: '/docs/release-notes'},
            {label: 'GitHub', href: 'https://github.com/Soldier0x0/briefr'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Sai Harsha Vardhan · BUSL-1.1 · Self-hosted — your data stays yours.`,
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
