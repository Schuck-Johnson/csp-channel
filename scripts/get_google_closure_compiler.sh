#!/bin/sh
curl -O http://closure-compiler.googlecode.com/files/compiler-latest.zip
unzip compiler-latest.zip compiler.jar
echo "Removing zipped file"
rm compiler-latest.zip
echo "Moving compiler to the build directory"
mv compiler.jar build/
