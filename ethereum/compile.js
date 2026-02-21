// ethereum/compile.js
const path = require("path");
const fs = require("fs");
const solc = require("solc");

const contractsDir = path.resolve(__dirname, "contracts");
const buildDir = path.resolve(__dirname, "build");

function getSolFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getSolFiles(filePath));
    } else if (stat && stat.isFile() && filePath.endsWith(".sol")) {
      results.push(filePath);
    }
  });
  return results;
}

// sanity check: contracts directory exists
if (!fs.existsSync(contractsDir)) {
  console.error(`ERROR: contracts directory not found at: ${contractsDir}`);
  console.error("Create the folder and place your .sol files there, or adjust the path.");
  process.exit(1);
}

const solFiles = getSolFiles(contractsDir);
if (solFiles.length === 0) {
  console.error(`ERROR: no .sol files found inside ${contractsDir}`);
  process.exit(1);
}

console.log("Found solidity files:");
solFiles.forEach((f) => console.log("  -", path.relative(contractsDir, f).replace(/\\/g, "/")));

// prepare sources map: keys are paths relative to contractsDir (POSIX style)
const sources = {};
solFiles.forEach((absPath) => {
  const relPath = path.relative(contractsDir, absPath).replace(/\\/g, "/"); // important for imports
  const content = fs.readFileSync(absPath, "utf8");
  sources[relPath] = { content };
});

const input = {
  language: "Solidity",
  sources,
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

console.log("Compiling...");
let output;
try {
  output = JSON.parse(solc.compile(JSON.stringify(input)));
} catch (err) {
  console.error("Solc compile failed:", err);
  process.exit(1);
}

// Print compiler errors/warnings
if (output.errors && output.errors.length > 0) {
  let hasFatal = false;
  output.errors.forEach((e) => {
    const prefix = e.severity === "error" ? "ERROR" : "WARNING";
    console[e.severity === "error" ? "error" : "warn"](`${prefix}: ${e.formattedMessage || e.message}`);
    if (e.severity === "error") hasFatal = true;
  });
  if (hasFatal) {
    console.error("Compilation aborted due to errors.");
    process.exit(1);
  }
}

// ensure build dir
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// write contracts to build/
const compiledContracts = output.contracts || {};
let total = 0;
for (const sourcePath in compiledContracts) {
  for (const contractName in compiledContracts[sourcePath]) {
    const artifact = compiledContracts[sourcePath][contractName];
    const outPath = path.resolve(buildDir, `${contractName}.json`);
    fs.writeFileSync(outPath, JSON.stringify(artifact, null, 2), "utf8");
    console.log(`Wrote: ${path.relative(process.cwd(), outPath)}`);
    total++;
  }
}

console.log(`Done. ${total} contract artifact(s) written to ${buildDir}`);

module.exports = compiledContracts;
