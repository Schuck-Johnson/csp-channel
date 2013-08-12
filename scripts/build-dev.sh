#!/bin/sh
(cat support/wrapper.beg.txt; cat src/channel.js; cat support/wrapper.end.txt) > channel.js
echo "Build finished."
