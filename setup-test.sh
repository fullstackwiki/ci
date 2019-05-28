#!/bin/bash
set -x
git checkout $2
# ln -s ../cache.git .git
# read
yarn install --cache-folder=../.yarn-cache
./node_modules/.bin/mocha
