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

Merge ``dev`` to ``main`` and run following command to deploy public versions (check if your are logged into npm).

```js
yarn publish-npm
```