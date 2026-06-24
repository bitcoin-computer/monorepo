import { PrismTheme, themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// ============================================
// Bitcoin Computer — Custom Prism Themes
// ============================================

const prismLightTheme: PrismTheme = {
  plain: {
    color: "#393939",
    backgroundColor: "#f8f9fa", // clean light code background
  },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: {
        color: "#999999",
        fontStyle: "italic",
      },
    },
    {
      types: ["punctuation", "operator"],
      style: { color: "#393939" },
    },
    {
      types: [
        "property",
        "tag",
        "boolean",
        "number",
        "constant",
        "symbol",
        "deleted",
      ],
      style: { color: "#FF7D00" }, // Warning orange
    },
    {
      types: ["selector", "attr-name", "string", "char", "builtin", "inserted"],
      style: { color: "#009536" }, // Success green
    },
    {
      types: ["atrule", "attr-value", "keyword"],
      style: { color: "#0039cc" }, // Primary blue
    },
    {
      types: ["function", "class-name"],
      style: { color: "#002A99" }, // Darker blue for distinction
    },
    {
      types: ["regex", "important"],
      style: { color: "#FF1500" }, // Danger red
    },
    {
      types: ["variable"],
      style: { color: "#0046FF" },
    },
  ],
};

const prismDarkTheme: PrismTheme = {
  plain: {
    color: "#f1f1f1",
    backgroundColor: "#1a1a1a",
  },
  styles: [
    {
      types: ["comment", "prolog", "doctype", "cdata"],
      style: {
        color: "#9ca3af", // ← Much better contrast + distinction
        fontStyle: "italic",
      },
    },
    {
      types: ["punctuation", "operator"],
      style: { color: "#d1d5db" },
    },
    {
      types: [
        "property",
        "tag",
        "boolean",
        "number",
        "constant",
        "symbol",
        "deleted",
      ],
      style: { color: "#ffbeaf" },
    },
    {
      types: ["selector", "attr-name", "string", "char", "builtin", "inserted"],
      style: { color: "#0cbf50" },
    },
    {
      types: ["atrule", "attr-value", "keyword"],
      style: { color: "#a7bfff" },
    },
    {
      types: ["function", "class-name"],
      style: { color: "#c8d8ff" },
    },
    {
      types: ["regex", "important"],
      style: { color: "#ff7864" },
    },
    {
      types: ["variable"],
      style: { color: "#A7BFFF" },
    },
  ],
};

const config: Config = {
  title: "Bitcoin Computer",
  tagline:
    "Build secure, decentralized smart contract applications on Bitcoin and Litecoin",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://docs.bitcoincomputer.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub org and project (used for edit links, etc.)
  organizationName: "bitcoin-computer",
  projectName: "monorepo",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/bitcoin-computer/monorepo/edit/main/docs-2/",
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          // Useful for large docs sites
          // routeBasePath: '/', // uncomment if you want docs at the root (no /docs prefix)
        },
        blog: false, // We are not using the blog feature for now
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/bitcoin-computer-social-card.jpg",
    navbar: {
      title: "Bitcoin Computer",
      logo: {
        alt: "Bitcoin Computer Logo",
        src: "img/logo.svg", // ← Light mode logo
        srcDark: "img/logo-dark.svg", // ← Dark mode logo (optional)
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docs",
          position: "left",
          label: "Documentation",
        },
        {
          to: "/docs/features",
          label: "Key Features",
          position: "left",
        },
        {
          href: "https://github.com/bitcoin-computer/monorepo",
          label: "GitHub",
          position: "right",
        },
        {
          href: "https://t.me/thebitcoincomputer",
          label: "Community",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Documentation",
          items: [
            {
              label: "Getting Started",
              to: "/docs/getting-started",
            },
            {
              label: "Tutorials",
              to: "/docs/tutorials",
            },
            {
              label: "API Reference",
              to: "/docs/reference",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Telegram",
              href: "https://t.me/thebitcoincomputer",
            },
            {
              label: "X",
              href: "https://x.com/BTC_Computer",
            },
            {
              label: "GitHub Discussions",
              href: "https://github.com/bitcoin-computer/monorepo/discussions",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/bitcoin-computer/monorepo",
            },
            {
              label: "Legal Notice",
              to: "/docs/legal",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} BCDB Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismLightTheme,
      darkTheme: prismDarkTheme,
      additionalLanguages: ["bash", "diff", "json", "typescript"],
    },
    colorMode: {
      defaultMode: "light",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
