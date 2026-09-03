import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const stillFrames = args.filter((a) => a.startsWith("--still=")).map((a) => Number(a.split("=")[1]));
const rangeArg = args.find((a) => a.startsWith("--range="));
const out = (args.find((a) => a.startsWith("--out=")) || "--out=/mnt/documents/PeaceVerse_Platform_Story_3min.mp4").split("=")[1];

const bundled = await bundle({
  entryPoint: path.resolve(__dirname, "../src/index.ts"),
  webpackOverride: (c) => c,
});

const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});

const composition = await selectComposition({ serveUrl: bundled, id: "main", puppeteerInstance: browser });

if (stillFrames.length) {
  for (const f of stillFrames) {
    await renderStill({
      composition,
      serveUrl: bundled,
      output: `/tmp/browser/frames/frame-${f}.png`,
      frame: f,
      puppeteerInstance: browser,
      overwrite: true,
    });
    console.log("still", f);
  }
} else {
  const frameRange = rangeArg ? rangeArg.split("=")[1].split("-").map(Number) : undefined;
  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: "h264",
    outputLocation: out,
    puppeteerInstance: browser,
    muted: true,
    concurrency: 4,
    frameRange,
    onProgress: ({ progress }) => {
      if (Math.round(progress * 100) % 10 === 0) console.log("progress", Math.round(progress * 100));
    },
  });
  console.log("done", out);
}

await browser.close({ silent: false });
