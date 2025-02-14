<div align="center">
  <h1>Bitcoin Computer Documentation</h1>
  <p>
    The official documentation of the Bitcoin Computer
    <br />
    <a href="http://bitcoincomputer.io/">website</a> &#183; <a href="http://docs.bitcoincomputer.io/">docs</a>
  </p>
</div>

## Install

<font size=1>

```sh
# Download the monorepo
git clone https://github.com/bitcoin-computer/monorepo.git

# Move into monorepo folder
cd monorepo

# Install the dependencies
npm install

# install retype globally
npm install retypeapp --global

# update retype globally
npm update retypeapp --global
```

</font>

## Run Locally

<font size=1>

```shell
# Move to the package
cd packages/docs

# Start the app
retype start
```

</font>

## Update the Website

Create a pull request and merge into main. Then set the custom domain to the string below in [Github Pages](https://github.com/bitcoin-computer/monorepo/settings/pages).

```
docs.bitcoincomputer.io
```
