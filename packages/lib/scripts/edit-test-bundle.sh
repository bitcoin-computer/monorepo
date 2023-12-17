#!/bin/sh

# Path to your file
FILE_PATH="dist-test/index.js"

# 1. Replace "a && a.__esModule ? a.default : a" by "a && a.__esModule ? a.default || a : a" in $FILE_PATH because "d.default" is undefined because NakamotoJs
# is not providing a default export. 
sed -i '' 's/a \&\& a.\__esModule ? a\.default : a/a \&\& a.\__esModule ? a\.default \|\| a : a/g' $FILE_PATH

# 2. Prepend the following two lines to the top of the file:
# "use strict";
# import { Computer, Memory } from '../dist/bc-lib.browser.min.mjs';
if ! (head $FILE_PATH) | grep -q '^[ \t]*"use strict";'; then
    printf "%s\n%s\n%s\n" "\"use strict\";" "import { Computer, Memory } from '../dist/bc-lib.browser.min.mjs';" "$(cat $FILE_PATH)" > $FILE_PATH
fi