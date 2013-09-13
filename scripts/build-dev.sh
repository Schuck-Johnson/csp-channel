#!/bin/sh
echo "Wrapping compiled javascript for node, require, and AMD"
(cat support/wrapper.beg.txt; cat src/channel.js; cat support/dev.wrapper.end.txt) > channel.dev.js
echo "Development Build finished."
