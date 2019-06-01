#!/bin/bash
if [ -d cache.git ]; then
	pushd cache.git
	git fetch
	popd
else
	git clone --bare --mirror $1 cache.git
fi
if [ -n "$2" ]; then
	COMMIT="$2"
else
	COMMIT=$(cd cache.git && git rev-parse HEAD)
fi
git clone cache.git "$COMMIT.work"
mkdir "$COMMIT.work/web/ci"
pushd "$COMMIT.work"
FORCE_COLOR=2 bash ../setup-test.sh "$1" "$COMMIT" 2>&1 | tee "web/ci/$COMMIT.log"
cat "web/ci/$COMMIT.log" | node ../format-log.js > "web/ci/$COMMIT.xml"
../dive-publish-aws/bin/dive-publish-aws --base http://fullstack.wiki/ --bucket "$AWS_S3_BUCKET" app.js
popd
rm -rf $COMMIT.work
