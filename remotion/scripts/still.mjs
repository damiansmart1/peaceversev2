import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
const bundled = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browser = await openBrowser("chrome", { browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium", chromiumOptions: { args: ["--no-sandbox","--disable-gpu","--disable-dev-shm-usage"] }, chromeMode: "chrome-for-testing" });
const composition = await selectComposition({ serveUrl: bundled, id: "main", puppeteerInstance: browser });
for (const f of [1150, 1300, 700, 900]) {
  await renderStill({ composition, serveUrl: bundled, output: `/tmp/browser/f${f}.png`, frame: f, puppeteerInstance: browser });
  console.log("ok", f);
}
await browser.close({ silent: false });
