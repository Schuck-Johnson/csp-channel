#!/bin/sh
curl -O https://closure-library.googlecode.com/git/closure/goog/base.js
echo "Moving base google clousre to the build directory"
mv base.js build/
