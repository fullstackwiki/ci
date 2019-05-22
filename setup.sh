#!/bin/bash
set -x
# DATA=$(pwd)
# git --git-dir="$DATA" worktree remove --force *.work
if [ -d cache.git ]; then
	pushd cache.git
	git fetch
	popd
else
	git clone --bare $1 cache.git
fi
git clone cache.git $2.work
pushd $2.work
git checkout $2
ln -s ../cache.git .git
# read
yarn install --cache-folder=../.yarn-cache
./node_modules/.bin/mocha
AWS_PROFILE=fullstack-wiki node ../../dive-publish-aws/publish.js --base http://fullstack.wiki/ --bucket fullstack.wiki app.js
popd
rm -rf $2.work
