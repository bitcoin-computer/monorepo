import editFileJSON from "edit-json-file";
import { dirname } from "path";
import { fileURLToPath } from "url";

const libName = process.argv[2]
  ? "@vivek-singh/lib-testing"
  : "@vivek-singh/lib";
const nodeName = process.argv[2]
  ? "@vivek-singh/node-testing"
  : "@vivek-singh/node";
const __dirname = dirname(fileURLToPath(import.meta.url));
let file = editFileJSON(
  `${__dirname}/../packages/bitcoin-computer-lib/package.json`,
  {
    stringify_eol: true,
  }
);
file.set("name", libName);
file.set("publishConfig", {
  access: "public",
});
file.unset("private");
file.unset("type");
file.unset("scripts.postpublish");
file.unset("scripts.deploy");
file.unset("scripts.types");
file.unset("scripts.lint-fix");
const testScript = file.get("scripts.test-mocha-ltc");
file.set("scripts.test-mocha-unit", testScript);
file.unset("scripts.test-mocha-ltc");
file.unset("scripts.test-mocha-btc");
file.unset("scripts.test-unit");
file.unset("scripts.rollup");
file.unset("scripts.lint");
file.set("main", "bitcoin-computer-lib.cjs.js");

file.save();

let nodeFile = editFileJSON(
  `${__dirname}/../packages/bitcoin-computer-node/package.json`,
  {
    stringify_eol: true,
  }
);
nodeFile.set("name", nodeName);
nodeFile.set("publishConfig", {
  access: "public",
});
nodeFile.unset("private");
nodeFile.unset("scripts.deploy");
nodeFile.unset("scripts.types");
nodeFile.unset("scripts.lint-fix");
nodeFile.unset("scripts.lint");
nodeFile.unset("scripts.rollup");
nodeFile.unset("scripts.test-unit");
nodeFile.set("main", "src/bcn.cjs.js");
if (process.argv[2]) {
  const dependencies = nodeFile.get("dependencies");
  const version = dependencies["@vivek-singh/lib"];
  nodeFile.set("dependencies", {
    ...dependencies,
    libName: version,
  });
  nodeFile.unset("dependencies.@vivek-singh/lib");
}

nodeFile.save();
