import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { createRequire } from "node:module";

const root = process.cwd();

const MIME = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".mp3": "audio/mpeg",
    ".ttf": "font/ttf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".ico": "image/x-icon"
};

async function loadPlaywright() {
    try {
        return await import("playwright");
    } catch (err) {
        const require = createRequire("/Users/csquared/projects/package.json");
        return require("playwright");
    }
}

function server() {
    return http.createServer(async (req, res) => {
        try {
            const url = new URL(req.url, "http://localhost");
            let path = decodeURIComponent(url.pathname);
            if (path === "/") path = "/presskit.html";
            const file = normalize(join(root, path));
            if (!file.startsWith(root)) {
                res.writeHead(403);
                res.end();
                return;
            }
            const data = await readFile(file);
            const type = MIME[extname(file).toLowerCase()] || "application/octet-stream";
            const range = req.headers.range;
            if (range) {
                const m = /^bytes=(\d*)-(\d*)$/.exec(range);
                if (m) {
                    const start = m[1] ? parseInt(m[1], 10) : 0;
                    const end = m[2] ? parseInt(m[2], 10) : data.length - 1;
                    res.writeHead(206, {
                        "Content-Type": type,
                        "Content-Range": `bytes ${start}-${end}/${data.length}`,
                        "Accept-Ranges": "bytes",
                        "Content-Length": end - start + 1
                    });
                    res.end(data.subarray(start, end + 1));
                    return;
                }
            }
            res.writeHead(200, {
                "Content-Type": type,
                "Content-Length": data.length,
                "Accept-Ranges": "bytes"
            });
            res.end(data);
        } catch (err) {
            res.writeHead(404);
            res.end(String(err));
        }
    });
}

function listen(srv) {
    return new Promise((resolve) => {
        srv.listen(0, "127.0.0.1", () => resolve(srv.address().port));
    });
}

const failures = [];
function check(name, cond) {
    if (cond) {
        console.log("ok - " + name);
    } else {
        failures.push(name);
        console.log("FAIL - " + name);
    }
}

const { chromium } = await loadPlaywright();
const srv = server();
const port = await listen(srv);
const base = `http://127.0.0.1:${port}`;
const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

try {
    const context = await browser.newContext({ viewport: { width: 1000, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto(`${base}/presskit.html?playlist=scripts/fixtures/player-fixture.json`, {
        waitUntil: "domcontentloaded"
    });
    await page.waitForSelector(".sp-row");

    const rowCount = await page.locator(".sp-row").count();
    check("3 rows rendered", rowCount === 3);

    const titles = await page.locator(".sp-row-name").allTextContents();
    check("row titles match fixture", JSON.stringify(titles) === JSON.stringify([
        "1 \u00b7 SAYLESS \u2013 BOOGIE-2 (extended mix - v9)",
        "2 \u00b7 SAYLESS \u2013 FLIPPIN (DJ master v2)",
        "3 \u00b7 SAYLESS \u2013 RUNAWAY (extended mix v1.6)"
    ]));

    const canvas = await page.evaluate(() => {
        const c = document.querySelector("#player .sp-wave");
        const ctx = c.getContext("2d");
        const data = ctx.getImageData(0, 0, c.width, c.height).data;
        let nonBlank = 0;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] !== 0) nonBlank++;
        }
        return { width: c.width, height: c.height, nonBlank };
    });
    check("canvas has non-zero size", canvas.width > 0 && canvas.height > 0);
    check("canvas has non-blank pixels", canvas.nonBlank > 0);

    await page.locator(".sp-row").nth(1).click();
    await page.waitForFunction(() => {
        const a = document.querySelector("#player audio");
        return a && a.getAttribute("src") && a.getAttribute("src").includes("high-fidelity");
    });
    const src = await page.evaluate(() => document.querySelector("#player audio").getAttribute("src"));
    check("clicking row 2 sets audio src to fixture mp3", /high-fidelity-autobiographical-record-collection\.mp3$/.test(src));
    const headerTitle = await page.locator(".sp-track-title").textContent();
    check("row 2 title appears in header", headerTitle === "FLIPPIN (DJ master v2)");

    await page.evaluate(() => {
        const a = document.querySelector("#player audio");
        a.muted = true;
    });
    await page.waitForFunction(() => {
        const a = document.querySelector("#player audio");
        return a.readyState >= 1;
    }, { timeout: 15000 });

    const seekRes = await page.evaluate(() => {
        const c = document.querySelector("#player .sp-wave");
        const rect = c.getBoundingClientRect();
        c.dispatchEvent(new PointerEvent("pointerdown", {
            bubbles: true,
            clientX: rect.left + rect.width * 0.5,
            clientY: rect.top + rect.height / 2,
            pointerId: 1,
            isPrimary: true
        }));
        c.dispatchEvent(new PointerEvent("pointerup", {
            bubbles: true,
            clientX: rect.left + rect.width * 0.5,
            clientY: rect.top + rect.height / 2,
            pointerId: 1,
            isPrimary: true
        }));
        return new Promise((resolve) => {
            setTimeout(() => {
                const a = document.querySelector("#player audio");
                resolve({ currentTime: a.currentTime, duration: a.duration });
            }, 500);
        });
    });
    check("clicking waveform at 50% seeks near half duration",
        seekRes.duration > 0 && Math.abs(seekRes.currentTime - seekRes.duration / 2) < 3);

    await page.evaluate(() => {
        const a = document.querySelector("#player audio");
        a.pause();
        a.currentTime = 0;
    });
    const beforeSpace = await page.evaluate(() => document.querySelector("#player audio").paused);
    await page.keyboard.press("Space");
    await page.waitForTimeout(200);
    const afterSpace = await page.evaluate(() => document.querySelector("#player audio").paused);
    check("Space toggles paused", beforeSpace === true && afterSpace === false);
    await page.evaluate(() => document.querySelector("#player audio").pause());

    check("no console errors", errors.length === 0);
    if (errors.length) console.log("console errors:", errors);

    await context.close();

    const narrowContext = await browser.newContext({ viewport: { width: 360, height: 800 } });
    const narrowPage = await narrowContext.newPage();
    await narrowPage.goto(`${base}/presskit.html?playlist=scripts/fixtures/player-fixture.json`, {
        waitUntil: "domcontentloaded"
    });
    await narrowPage.waitForSelector(".sp-row");
    const scrollWidth = await narrowPage.evaluate(() => document.documentElement.scrollWidth);
    check("at 360px no horizontal overflow", scrollWidth <= 360);
    if (scrollWidth > 360) console.log("scrollWidth:", scrollWidth);
    await narrowContext.close();
} finally {
    await browser.close();
    srv.close();
}

if (failures.length) {
    console.log(`FAILED (${failures.length})`);
    process.exit(1);
} else {
    console.log("PASS");
    process.exit(0);
}
