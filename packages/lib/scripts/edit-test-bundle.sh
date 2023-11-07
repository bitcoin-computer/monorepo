#!/bin/sh

# Path to your file
FILE_PATH="dist-test/index.js"

# 1. Replace "e&&e.__esModule?d.default:e" by "e&&e.__esModule?d.default||e:e" in $FILE_PATH because "d.default" is undefined because NakamotoJs
# is not providing a default export. 
sed -i '' '1s/e\&\&e\.__esModule\?e\.default:e/e\&\&e\.__esModule\?e\.default\|\|e:e/' $FILE_PATH

# 2. Prepend the following two lines to the top of the file:
# "use strict";
# import { Computer, Memory } from '../dist/bc-lib.browser.min.mjs';
if ! grep -q '^[ \t]*"use strict";' $FILE_PATH; then
    printf "%s\n" 0a "\"use strict\";" "import { Computer, Memory } from '../dist/bc-lib.browser.min.mjs';" . x | ex $FILE_PATH
fi
