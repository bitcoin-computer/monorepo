cd ./packages/bitcoin-computer-node
rm -rf .git
git init
git remote add origin https://github.com/bitcoin-computer/bitcoin-computer-node.git
echo "creating branch release-$(grep -m 1 version package.json | cut -d ':' -f2 | cut -d '"' -f 2)"
git checkout -b release-$(grep -m 1 version package.json | cut -d ':' -f2 | cut -d '"' -f 2)
git add .
git commit -m "release changes"
git push origin release-$(grep -m 1 version package.json | cut -d ':' -f2 | cut -d '"' -f 2)
rm -rf .git