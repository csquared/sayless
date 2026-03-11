import { chromium } from "playwright";
import { execSync } from "child_process";
import { resolve } from "path";
import { rmSync } from "fs";

const flyerDir = process.argv[2];
if (!flyerDir) {
  console.error("Usage: node scripts/capture-video.mjs <flyer-directory> [--duration=12] [--hide=.rsvp]");
  process.exit(1);
}

// Parse optional flags
const args = process.argv.slice(3);
let duration = 12;
let hideSelector = ".rsvp";

for (const arg of args) {
  if (arg.startsWith("--duration=")) {
    duration = parseFloat(arg.split("=")[1]);
  } else if (arg.startsWith("--hide=")) {
    hideSelector = arg.split("=")[1];
  }
}

const htmlPath = resolve(flyerDir, "main.html");
const outputPath = resolve(flyerDir, "flyer-instagram.mp4");
const tmpDir = resolve(flyerDir, ".video-tmp");

const WIDTH = 1080;
const HEIGHT = 1920;
const RECORD_SECONDS = duration + 0.5; // animation + buffer

async function main() {
  console.log("Launching browser...");

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: tmpDir,
      size: { width: WIDTH, height: HEIGHT },
    },
  });

  const page = await context.newPage();

  console.log(`Loading flyer from ${htmlPath}...`);
  await page.goto(`file://${htmlPath}`, { waitUntil: "load" });

  // Hide elements (e.g. RSVP/ticket button)
  if (hideSelector) {
    await page.evaluate((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        el.style.display = "none";
      });
    }, hideSelector);
  }

  console.log(`Recording ${RECORD_SECONDS}s of animation...`);
  await page.waitForTimeout(RECORD_SECONDS * 1000);

  // Close context to finalize the video
  const videoPath = await page.video().path();
  await context.close();
  await browser.close();

  console.log(`WebM saved to: ${videoPath}`);
  console.log("Converting to MP4...");

  // Convert WebM to Instagram-compatible MP4
  execSync(
    [
      "ffmpeg",
      "-y",
      `-i "${videoPath}"`,
      "-c:v libx264",
      "-pix_fmt yuv420p",
      "-crf 18",
      "-an",
      `-t ${duration}`,
      "-movflags +faststart",
      `"${outputPath}"`,
    ].join(" "),
    { stdio: "inherit" }
  );

  // Clean up temp directory
  rmSync(tmpDir, { recursive: true, force: true });

  console.log(`\nDone! Output: ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
