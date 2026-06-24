import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

/**
 * Bitcoin Computer Documentation Sidebar
 * Clean, logical structure matching the new docs/ folder layout.
 */
const sidebars: SidebarsConfig = {
  // Main documentation sidebar
  docs: [
    // 1. Introduction
    {
      type: "doc",
      id: "intro",
      label: "Introduction",
    },

    // 2. Getting Started
    {
      type: "category",
      label: "Getting Started",
      link: {
        type: "doc",
        id: "getting-started/index",
      },
      collapsed: false,
      items: [
        "getting-started/quickstart",
        "getting-started/installation",
        "getting-started/browser",
        "getting-started/nodejs",
        "getting-started/running-a-local-node",
        "getting-started/templates",
      ],
    },

    // 3. Core Concepts
    {
      type: "category",
      label: "Core Concepts",
      link: {
        type: "doc",
        id: "concepts/index",
      },
      collapsed: true,
      items: [
        "concepts/how-it-works",
        "concepts/contract-class",
        "concepts/on-chain-objects",
        "concepts/ownership-and-access",
        "concepts/transaction-encoding",
        "concepts/optimizations",
        "concepts/fees",
      ],
    },

    // 4. Tutorials (hands-on learning)
    {
      type: "category",
      label: "Tutorials",
      link: {
        type: "doc",
        id: "tutorials/index",
      },
      collapsed: true,
      items: [
        "tutorials/simple-counter",
        "tutorials/decentralized-chat",
        "tutorials/fungible-tokens",
        "tutorials/programmable-escrow",
        "tutorials/vdf-games",
      ],
    },

    // 5. Guides (deeper practical guidance)
    {
      type: "category",
      label: "Guides",
      link: {
        type: "doc",
        id: "guides/index",
      },
      collapsed: true,
      items: [
        "guides/writing-smart-contracts",
        "guides/testing-and-debugging",
        "guides/mocking-and-off-chain",
        "guides/deployment-and-mainnet",
        "guides/security-best-practices",
        "guides/multi-chain",
      ],
    },

    // 6. Key Features (highlight recent & powerful capabilities)
    {
      type: "category",
      label: "Key Features",
      link: {
        type: "doc",
        id: "features/index",
      },
      collapsed: true,
      items: [
        "features/programmable-escrow-and-inner-computer",
        "features/tbc777-and-token-protocols",
        "features/verifiable-computation-with-vdf",
      ],
    },

    // 7. API Reference
    {
      type: "category",
      label: "API Reference",
      link: {
        type: "doc",
        id: "reference/index",
      },
      collapsed: true,
      items: [
        "reference/computer-class",
        {
          type: "category",
          label: "Computer API Methods",
          link: {
            type: "doc",
            id: "reference/api/index",
          },
          collapsed: true,
          items: [
            "reference/api/new",
            "reference/api/sync",
            "reference/api/query",
            "reference/api/broadcast",
            "reference/api/encode",
            "reference/api/subscribe",
            // Add more methods here as you create the pages:
            // 'reference/api/deploy',
            // 'reference/api/decode',
            // 'reference/api/...'
          ],
        },
        "reference/node-api",
        "reference/comparison",
        "reference/examples",
        "reference/legal",
      ],
    },

    // 8. FAQ, Contributing & Legal (top-level for visibility)
    "faq",
    "contributing",
    "legal",
  ],
};

export default sidebars;
