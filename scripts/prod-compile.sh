#!/bin/sh
java -jar build/compiler.jar --generate_exports --process_closure_primitives --compilation_level ADVANCED_OPTIMIZATIONS --js channel.export.js --js_output_file channel.compile.prod.js
