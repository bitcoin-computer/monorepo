# bitcoin-computer-node-js-boilerplate

[![TypeScript version][ts-badge]][typescript-4-5]
[![Node.js version][nodejs-badge]][nodejs]
[![APLv2][license-badge]][license]
<!-- [![Build Status - GitHub Actions][gha-badge]][gha-ci] -->

👩🏻‍💻 A template for using the [Bitcoin Computer][bitcoin-computer] with [Node.js][nodejs]. Adapted from [node-typescript-boilerplate][node-typescript-boilerplate].

🏃🏽 All basic tools included and configured:

- [Bitcoin Computer 0.8][bitcoin-computer] to write smart contracts on Bitcoin
- [TypeScript][typescript] [4.5][typescript-4-5] for type safe smart contract development
- [ESLint][eslint] to ensure compliance with coding standards
- [Jest][jest] for fast unit testing and code coverage
- [Prettier][prettier] to enforce consistent coding style
- NPM [scripts](#available-scripts) for common operations
- Simple example of Bitcoin Computer smart contract code and unit test

✊ Free as in speech: available under the MIT license.

## Getting Started

This project is intended to be used with the latest Active LTS release of [Node.js][nodejs].

### Use as a repository template

To start, just click the **[Use template][repo-template-action]** link (or the green button). Start adding your code in the `src` and unit tests in the `test` directories.

### Clone repository

To clone the repository, use the following commands:

```sh
git clone https://github.com/bitcoin-computer/bitcoin-computer-node-js-boilerplate
cd bitcoin-computer-node-js-boilerplate
yarn install
```
<!--
### Download latest release

Download and unzip the current **main** branch or one of the tags:

```sh
wget https://github.com/bitcoin-computer/bitcoin-computer-node-js-boilerplate/archive/main.zip -O bitcoin-computer-node-js-boilerplate.zip
unzip bitcoin-computer-node-js-boilerplate.zip && rm bitcoin-computer-node-js-boilerplate.zip
```
-->

## Available Scripts

- `clean` - remove coverage data, Jest cache and transpiled files
- `prebuild` - lint source files and tests before building
- `build` - transpile TypeScript to ES6
- `build:watch` - interactive watch mode to automatically transpile source files
- `lint` - lint source files and tests
- `test` - run tests
- `types` - run type checks
- `test:watch` - interactive watch mode to automatically re-run tests

## License

Licensed under the MIT license. See the [LICENSE](https://github.com/bitcoin-computer/bitcoin-computer-node-js-boilerplate/blob/master/LICENSE) file for details.

[ts-badge]: https://img.shields.io/badge/TypeScript-4.5-blue.svg
[nodejs-badge]: https://img.shields.io/badge/Node.js->=%2016.13-blue.svg
[nodejs]: https://nodejs.org/dist/latest-v14.x/docs/api/
[gha-badge]: https://github.com/bitcoin-computer/bitcoin-computer-node-js-boilerplate/actions/workflows/nodejs.yml/badge.svg
[bitcoin-computer]: http://bitcoincomputer.io/
[node-typescript-boilerplate]: https://github.com/jsynowiec/node-typescript-boilerplate
[gha-ci]: https://github.com/bitcoin-computer/bitcoin-computer-node-js-boilerplate/actions/workflows/nodejs.yml
[typescript]: https://www.typescriptlang.org/
[typescript-4-5]: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html
[license-badge]: https://img.shields.io/badge/license-APLv2-blue.svg
[license]: https://github.com/bitcoin-computer/bitcoin-computer-node-js-boilerplate/blob/main/LICENSE
[jest]: https://facebook.github.io/jest/
[eslint]: https://github.com/eslint/eslint
[wiki-js-tests]: https://github.com/bitcoin-computer/bitcoin-computer-node-js-boilerplate/wiki/Unit-tests-in-plain-JavaScript
[prettier]: https://prettier.io
[volta]: https://volta.sh
[volta-getting-started]: https://docs.volta.sh/guide/getting-started
[volta-tomdale]: https://twitter.com/tomdale/status/1162017336699838467?s=20
[gh-actions]: https://github.com/features/actions
[repo-template-action]: https://github.com/bitcoin-computer/bitcoin-computer-node-js-boilerplate/generate
