#!/bin/sh
echo "Simple Google closure optimizations"
scripts/dev-compile.sh
echo "Wrapping compiled javascript for node, require, and AMD"
(cat support/wrapper.beg.txt; cat channel.compile.dev.js; cat support/dev.wrapper.end.txt) > channel.js
rm channel.compile.dev.js
echo "QA / Staging Build finished."
