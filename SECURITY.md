# Security Policy

## Reporting a vulnerability

Please don't report security vulnerabilities in public issues, pull requests or discussions.

Report them privately instead:

- **GitHub:** use **Report a vulnerability** on the repository's
  [Security tab](https://github.com/bitcoin-computer/monorepo/security).
- **Email:** or write to [clemens@bitcoincomputer.io](mailto:clemens@bitcoincomputer.io).

Please include:

- the package, and the version or commit you tested;
- the chain and network (for example LTC regtest);
- steps to reproduce, or a test that demonstrates the problem;
- what you think the impact is, and whether you've seen it outside a test network.

Please also say which parts you demonstrated and which you only read in the code.

We aim to acknowledge reports promptly, and we'll coordinate with you on when to
publish details and fixes. Please give us a reasonable time to fix the problem
before disclosing it. We publish impact notes and fixes as GitHub Security
Advisories on this repository.

## Testing

Test on regtest or testnet, with your own keys and funds. Don't use a
vulnerability against other people's contracts, funds or nodes, and don't test
on mainnet without asking us first.

## Supported versions

Security fixes go to the `staging` branch and are included in a release as soon
as practical. We currently publish only beta versions on npm; we patch the
latest published npm version. Older versions aren't patched.

## Scope

We welcome reports about anything in this repository, including:

- the smart contract packages (TBC20, TBC721, TBC777, Commodity, swap, chess
  and dao contracts);
- the library (`@bitcoin-computer/lib`) and the node (`packages/node`),
  including the obfuscated builds;
- `nakamotojs`, the apps and components;
- the node's Docker and configuration templates.

The example apps and templates get lower priority than the library, the node
and the contracts. Vulnerabilities in third-party dependencies should go to the
dependency's maintainers. Tell us as well if the problem affects this
repository.

## Deployed contracts

A contract's class code is fixed when the module is deployed or an object is
created. A fix to contract code in this repository only affects objects created
from the fixed code; objects that already exist keep the code they were created
with. A change to the client library can still change how existing code runs,
because `@bitcoin-computer/lib` is what evaluates it.

When a vulnerability affects deployed contracts, the advisory will say which
npm versions and module revisions are affected, and what holders can do — for
example migrate to a new module, or only upgrade the client library.
