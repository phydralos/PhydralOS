const { execSync } = require("child_process");

const scripts = [
  "scripts/syncIcons.js",
  "scripts/preloadIcons.js",
  "scripts/searchIndex.js",
  "scripts/cacheShortcuts.js",
];

for (const script of scripts) {
  try {
    execSync(`node ${script}`, { stdio: "inherit" });
  } catch (error) {
    console.error(`Failed to run ${script}:`, error.message);
    process.exit(1);
  }
}

try {
  execSync("yarn build:fs:public", { stdio: "inherit" });
} catch (error) {
  console.error("Failed to build fs.9p.json:", error.message);
  process.exit(1);
}

console.log("All caches rebuilt successfully.");
