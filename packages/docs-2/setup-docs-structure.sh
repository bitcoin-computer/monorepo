#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Bitcoin Computer — Documentation Structure Setup"
echo "This will DELETE the existing 'docs/' directory and create the new proposed structure."
echo ""
read -rp "Proceed? (y/N): " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "❌ Aborted."
    exit 0
fi

echo "🗑️  Removing old docs/ folder..."
rm -rf docs

echo "📁 Creating new directory structure + placeholder files..."

# Helper function: creates folder + .md file with frontmatter
create_doc() {
    local filepath="$1"
    local title="$2"
    mkdir -p "$(dirname "$filepath")"
    cat > "$filepath" <<EOF
---
title: "$title"
---

# $title
EOF
    echo "  ✓ $filepath"
}

# ========== TOP-LEVEL DOCS ==========
create_doc "docs/intro.md" "Introduction"
create_doc "docs/faq.md" "Frequently Asked Questions"
create_doc "docs/contributing.md" "Contributing"
create_doc "docs/legal.md" "Legal Notice"

# ========== GETTING STARTED ==========
create_doc "docs/getting-started/index.md" "Getting Started"
create_doc "docs/getting-started/quickstart.md" "Quickstart"
create_doc "docs/getting-started/installation.md" "Installation"
create_doc "docs/getting-started/browser.md" "Using in the Browser"
create_doc "docs/getting-started/nodejs.md" "Using with Node.js"
create_doc "docs/getting-started/running-a-local-node.md" "Running a Local Node"
create_doc "docs/getting-started/templates.md" "Project Templates"

# ========== CONCEPTS ==========
create_doc "docs/concepts/index.md" "Core Concepts"
create_doc "docs/concepts/how-it-works.md" "How It Works"
create_doc "docs/concepts/contract-class.md" "The Contract Class"
create_doc "docs/concepts/on-chain-objects.md" "On-Chain Objects"
create_doc "docs/concepts/ownership-and-access.md" "Ownership and Access Control"
create_doc "docs/concepts/transaction-encoding.md" "Transaction Encoding"
create_doc "docs/concepts/optimizations.md" "Optimizations"
create_doc "docs/concepts/fees.md" "Fees"

# ========== TUTORIALS ==========
create_doc "docs/tutorials/index.md" "Tutorials"
create_doc "docs/tutorials/simple-counter.md" "Simple Counter"
create_doc "docs/tutorials/decentralized-chat.md" "Decentralized Chat"
create_doc "docs/tutorials/fungible-tokens.md" "Fungible Tokens (TBC777)"
create_doc "docs/tutorials/programmable-escrow.md" "Programmable Escrow"
create_doc "docs/tutorials/vdf-games.md" "VDF Games & Verifiable Computation"

# ========== GUIDES ==========
create_doc "docs/guides/index.md" "Guides"
create_doc "docs/guides/writing-smart-contracts.md" "Writing Smart Contracts"
create_doc "docs/guides/testing-and-debugging.md" "Testing and Debugging"
create_doc "docs/guides/mocking-and-off-chain.md" "Mocking and Off-Chain Development"
create_doc "docs/guides/deployment-and-mainnet.md" "Deployment and Mainnet"
create_doc "docs/guides/security-best-practices.md" "Security Best Practices"
create_doc "docs/guides/multi-chain.md" "Multi-Chain Support"

# ========== REFERENCE ==========
create_doc "docs/reference/index.md" "API Reference"
create_doc "docs/reference/computer-class.md" "The Computer Class"
create_doc "docs/reference/node-api.md" "Node API Reference"
create_doc "docs/reference/comparison.md" "Comparison with Other Systems"
create_doc "docs/reference/examples.md" "Code Examples"
create_doc "docs/reference/legal.md" "Legal and Licensing"

# API methods subfolder
create_doc "docs/reference/api/index.md" "Computer API Methods"
create_doc "docs/reference/api/new.md" "new() — Creating a Computer"
create_doc "docs/reference/api/sync.md" "sync()"
create_doc "docs/reference/api/query.md" "query()"
create_doc "docs/reference/api/broadcast.md" "broadcast()"
create_doc "docs/reference/api/encode.md" "encode()"
create_doc "docs/reference/api/subscribe.md" "subscribe()"

# Note: Add any additional API method pages (deploy, decode, etc.) the same way.

# ========== FEATURES (new/highlight section) ==========
create_doc "docs/features/index.md" "Key Features"
create_doc "docs/features/programmable-escrow-and-inner-computer.md" "Programmable Escrow & Inner Computer"
create_doc "docs/features/tbc777-and-token-protocols.md" "TBC777 and Token Protocols"
create_doc "docs/features/verifiable-computation-with-vdf.md" "Verifiable Computation with VDF"
create_doc "docs/features/litvm-and-decentralization.md" "LitVM and Decentralization"

echo ""
echo "✅ Structure created successfully!"
echo ""
echo "Next steps:"
echo "  1. Update sidebars.ts with the new navigation (I can give you a ready-to-paste version)."
echo "  2. Tweak docusaurus.config.ts (title, navbar, theme, etc.)."
echo "  3. Start filling the .md files. We can migrate section-by-section from the current Retype site and refresh it with the latest features."
echo "  4. Run 'npm start' to preview."
echo ""
echo "The current docs site (Retype) has a relatively flat structure (Start, Tutorial, Smart Contract Language, Optimizations, Tx Format, Fees, Lib reference, Node API, Comparison, Legal). Your new hierarchy is a big, clean improvement."