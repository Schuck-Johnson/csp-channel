#!/bin/sh
scripts/build-dev.sh
echo "Creating export files"
node scripts/export.js > exports.js
(cat src/channel.js; cat build/base.js; cat exports.js) > channel.export.js
echo "Advanced Google closure optimizations"
scripts/prod-compile.sh
echo "Wrapping compiled javascript for node, require, and AMD"
(cat support/wrapper.beg.txt; cat channel.compile.prod.js; cat support/wrapper.end.txt) > channel.prod.js
rm exports.js
rm channel.export.js
rm channel.compile.prod.js
echo "Production Build finished."
