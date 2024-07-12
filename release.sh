#!/bin/bash
npm run publish:public
version=`npm view @aitmed/ecos-lvl2-sdk version`
version=`npm view @aitmed/ecos-lvl2-sdk version`
git tag -a $version -m "release new version"
git push origin $version