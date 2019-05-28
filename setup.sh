#!/bin/bash
if [ -d cache.git ]; then
	pushd cache.git
	git fetch
	popd
else
	git clone --bare $1 cache.git
fi
git clone cache.git "$2.work"
mkdir "$2.work/web/ci"
pushd "$2.work"
FORCE_COLOR=2 bash ../setup-test.sh "$1" "$2" 2>&1 | tee "web/ci/$2.log"
cat "web/ci/$2.log" | node ../format-log.js > "web/ci/$2.xml"
AWS_PROFILE=fullstack-wiki node ../../dive-publish-aws/publish.js --base http://fullstack.wiki/ --bucket fullstack.wiki app.js
popd
rm -rf $2.work
