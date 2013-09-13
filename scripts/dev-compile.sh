#!/bin/sh
java -jar build/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js src/channel.js --formatting PRETTY_PRINT --js_output_file channel.compile.dev.js
