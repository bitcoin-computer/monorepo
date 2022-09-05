# Bitcoin Computer Monorepo

## Get started

```js
git clone https://github.com/Bitcoin-Computer-Secrets/monorepo.git
yarn install
lerna bootstrap
```

## Publish packages

Checkout branch ``dev``. First update package versions using the following command.

```js
yarn create-version
```

Commit the changes to ``dev``

```
git commit
```

Merge ``dev`` to ``main`` and run following command to deploy public versions

```js
yarn publish-npm
```

## Scripts

Makes sure that current git tree is clean.

```sh
yarn git-changes-check
```

Rename public packages with correct names.

```sh
yarn cleanup-public-package-json-testing
```

Commit these name changes (lerna will only publish if everything is committed).

```sh
yarn pre-git-commit
```

Publish public testing packages, lerna will also make a commit of version update, and then a release will be created on github.

```sh
yarn publish
```

Undo all the name changing.

```sh
test-post-publish-changes
```

Commit and push above changes.

```sh
yarn post-git-commit
```
