const { readdirSync, statSync, copyFileSync, existsSync, mkdirSync } = require("fs");
const { join } = require("path");

const ICONS_DIR = "public/System/Icons";
const SIZES = ["16x16", "32x32", "48x48", "96x96", "144x144"];

if (!existsSync(ICONS_DIR)) process.exit(0);

const svgIcons = readdirSync(ICONS_DIR).filter(
  (file) => file.endsWith(".svg") && statSync(join(ICONS_DIR, file)).isFile()
);

let copied = 0;
for (const icon of svgIcons) {
  const src = join(ICONS_DIR, icon);
  for (const size of SIZES) {
    const sizeDir = join(ICONS_DIR, size);
    if (!existsSync(sizeDir)) mkdirSync(sizeDir, { recursive: true });
    const dest = join(sizeDir, icon);
    copyFileSync(src, dest);
    copied++;
  }
}

console.log(`Synced ${svgIcons.length} SVG icons to ${SIZES.length} size dirs (${copied} copies)`);
