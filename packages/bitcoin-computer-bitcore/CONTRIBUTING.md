# Contributing to Bitcoin Computer Bitcore

We are meeting every weekday at 11 am pacific time on Skype. If you want to contribute email clemens@bitcointoken.com and we'll add you to the meeting. Feel free to ask any questions there. Otherwise, to get going on your own, follow the steps below.

## Initial setup

Before contributing, fork the main repository into your personal namespace by clicking the "Fork" button on the [project page](https://github.com/the-bitcoin-token/bitcoin-source). Then, clone the forked repository.

```
git clone git@github.com:[your_github_username]/bitcoin-source.git
cd bitcoin-source
```

Now add the main repository as a second remote.

```
git remote add upstream git@github.com:the-bitcoin-token/bitcoin-source.git
cd bitcoin-source
```

## For each pull request

### Before you make changes

Update your local master branch with the latest changes.

```sh
git checkout master
git pull upstream master
```

Create new local feature branch called `[branch_name]`.

```
git checkout -b [branch_name]
```

You can now start to make your changes.

### After you have made changes

Before issuing a pull request, make sure that all tests pass.

```
npm test
npm run lint
```

Add and commit your changes

```
git add [files_you_changed]
git commit -m [commit_message]
```

Update your local feature branch with the most recent changes from the remote repository.

```sh
git pull --rebase upstream master
```

After that, push your changes to your fork.

```
git push origin [branch_name]
```

Please write meaningful commit messages. Consider [squashing minor changes into a single commit](https://stackoverflow.com/questions/5189560/squash-my-last-x-commits-together-using-git) and [rewording commit messages](https://help.github.com/articles/changing-a-commit-message/) as needed.

To create a pull request, visit `https://github.com/[your_github_username]/bitcoin-source/pull/new/[branch_name]` and click on create pull request or click on the link that appears in the terminal.

We will review your code and possibly ask for changes before your code is pulled in to the main repository. If everything is OK, we'll merge your pull request and your code will be part of Bitcoin Computer Bitcore.

If you have any questions feel free to post them to
[github.com/the-bitcoin-token/bitcoin-source/issues](https://github.com/the-bitcoin-token/bitcoin-source/issues).

Thanks for your time and code!

<!--

## Design Guidelines

Bitcoin Computer Bitcore is using the [AirBnb JavaScript style guide](https://github.com/airbnb/javascript). We encourage our contributors to review it and follow its recommendations when writing the code.

### Tests

Write a test for all your code. We encourage Test Driven Development so we know when our code is right. The test coverage is around 95% and are targeting 100% as we move towards our 1.0 release.

#### Tests Must be Written Elegantly

Style guidelines are not relaxed for tests. Tests are a good way to show how to use the library, and maintaining them is extremely necessary.

Don't write long tests, write helper functions to make them be as short and concise as possible (they should take just a few lines each), and use good variable names.

#### Tests Must not be Random

Inputs for tests should not be generated randomly. Also, the type and structure of outputs should be checked.

#### Require 'bitcoin-source' and Look up Classes from There

This helps to make tests more useful as examples, and more independent of where they are placed. This also helps prevent forgetting to include all sub-modules in the bitcoin-source object.

DO:
```javascript
import Bitcoin from '../'
const { PublicKey } = Bitcoin
```
DON'T:
```javascript
import PublicKey from '../src/publickey'
```

#### Data for Tests Included in a JSON File

If possible, data for tests should be included in a JSON file in the `test/data` directory. This improves interoperability with other libraries and keeps tests cleaner.

### Documentation

#### Guide and API Reference

All modules should include a developer guide and API reference. The API reference documentation is generated using JSDOC. Each function that exposes a public API should include a description, @return and @param, as appropriate. The general documentation guide for the module should be located in the `docs/guide` directory and is written in GitHub Flavored Markdown.

#### Proofread

Please proofread documentation to avoid unintentional spelling and grammatical mistakes before submitting a pull request.

-->
