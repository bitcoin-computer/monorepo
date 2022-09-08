# Bitcoin Computer Monorepo

## Publish packages

Checkout branch ``main``. Build the image and run all the tests
```
cd packages/node; yarn install; yarn build-docker; 
yarn test; 
yarn test -i;
```

Update package versions using the following command.
```js
yarn create-version
```

Checkout a new branch for the deploy
```
git checkout -b <new-version-number>
```

Commit the changes to ``main``

```
git commit
```

Merge ``dev`` to ``main`` and run following command to deploy public versions (check if your are logged into npm).

```js
yarn publish-npm
```