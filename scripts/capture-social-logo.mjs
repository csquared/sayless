import { chromium } from "playwright";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { mkdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

// --- Config ---
const presets = {
  "square":         { width: 1080, height: 1080, layout: "stacked" },
  "profile":        { width: 400,  height: 400,  layout: "stacked" },
  "twitter-banner": { width: 1500, height: 500,  layout: "wide" },
  "fb-cover":       { width: 820,  height: 312,  layout: "wide" },
  "story":          { width: 1080, height: 1920, layout: "stacked" },
};

// --- Parse args ---
const args = process.argv.slice(2);
let selectedPresets = [];
let bg = "black";

function printUsage() {
  console.log(`Usage: node scripts/capture-social-logo.mjs [presets...] [--bg=black|white|transparent]

Presets: ${Object.keys(presets).join(", ")}, all
Default: all --bg=black

Examples:
  node scripts/capture-social-logo.mjs
  node scripts/capture-social-logo.mjs square profile --bg=white
  node scripts/capture-social-logo.mjs all --bg=transparent`);
}

for (const arg of args) {
  if (arg === "--help" || arg === "-h") {
    printUsage();
    process.exit(0);
  } else if (arg.startsWith("--bg=")) {
    bg = arg.split("=")[1];
  } else if (arg === "all") {
    selectedPresets = Object.keys(presets);
  } else if (presets[arg]) {
    selectedPresets.push(arg);
  } else {
    console.error(`Unknown preset: ${arg}`);
    printUsage();
    process.exit(1);
  }
}

if (selectedPresets.length === 0) {
  selectedPresets = Object.keys(presets);
}

const htmlPath = resolve(projectRoot, "social", "logo-lockup.html");
const outputDir = resolve(projectRoot, "social");
mkdirSync(outputDir, { recursive: true });

async function main() {
  console.log("Launching browser...");
  const browser = await chromium.launch();

  for (const name of selectedPresets) {
    const { width, height, layout } = presets[name];
    const url = `file://${htmlPath}?bg=${bg}&layout=${layout}`;
    const outputPath = resolve(outputDir, `sayless-${name}-${bg}.png`);

    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(url, { waitUntil: "load" });

    // Wait for font to render
    await page.waitForTimeout(500);

    await page.screenshot({ path: outputPath, omitBackground: bg === "transparent" });
    await page.close();

    console.log(`  ${name} (${width}x${height}) → ${outputPath}`);
  }

  await browser.close();
  console.log("\nDone!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
