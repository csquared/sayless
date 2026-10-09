import { chromium } from "playwright";
import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";

// Frame-exact capture of assets/video/sayless-loop.html.
// Steps a deterministic ?t clock so the first and last frame tile seamlessly.
// Usage: node scripts/capture-loop.mjs [--fps=30] [--period=2] [--w=1920] [--h=1080]

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const pagePath = resolve(root, "assets/video/sayless-loop.html");
const outPath = resolve(root, "assets/video/sayless-loop.mp4");

const opt = Object.fromEntries(
    process.argv.slice(2).map((a) => a.replace(/^--/, "").split("="))
);
const FPS = parseInt(opt.fps ?? "30", 10);
const PERIOD = parseFloat(opt.period ?? "2");
const W = parseInt(opt.w ?? "1920", 10);
const H = parseInt(opt.h ?? "1080", 10);
const FRAMES = Math.round(FPS * PERIOD);

const tmp = mkdtempSync(resolve(tmpdir(), "sayless-loop-"));

async function main() {
    const browser = await chromium.launch();
    const ctx = await browser.newContext({
        viewport: { width: W, height: H },
        deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();

    console.log(`Rendering ${FRAMES} frames at ${FPS}fps (${PERIOD}s loop)...`);
    for (let i = 0; i < FRAMES; i++) {
        const t = (i / FPS).toFixed(5);
        await page.goto(`file://${pagePath}?t=${t}`, { waitUntil: "load" });
        await page.waitForSelector("html[data-ready='1']");
        const n = String(i).padStart(4, "0");
        await page.screenshot({
            path: resolve(tmp, `frame-${n}.png`),
            clip: { x: 0, y: 0, width: W, height: H },
        });
    }
    await ctx.close();
    await browser.close();

    console.log("Encoding MP4 (yuv420p, high profile)...");
    // -stream_loop keeps the source frames; output is a single clean period
    // that loops because frame FRAMES equals frame 0 by construction.
    execSync(
        [
            "ffmpeg -y",
            `-framerate ${FPS}`,
            `-i "${resolve(tmp, "frame-%04d.png")}"`,
            "-c:v libx264 -preset slow -crf 16",
            "-pix_fmt yuv420p -profile:v high",
            "-movflags +faststart -an",
            `"${outPath}"`,
        ].join(" "),
        { stdio: "inherit" }
    );

    // Also emit a looped-friendly WebM (VP9) for web <video> if wanted.
    rmSync(tmp, { recursive: true, force: true });
    console.log(`\nDone: ${outPath}`);
}

main().catch((e) => {
    rmSync(tmp, { recursive: true, force: true });
    console.error(e);
    process.exit(1);
});
