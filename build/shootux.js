const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const FILE = "file:///" + path.resolve(__dirname, "..", "docs", "강아지의시선_UX설계.html").replace(/\\/g, "/");
const OUT = path.resolve(__dirname, "ux"); if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function snap(page, sel, name) {
  const el = await page.$(sel); if (!el) { console.log("MISS", sel); return; }
  await el.screenshot({ path: path.join(OUT, name + ".png") }); console.log("ok", name);
}
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
  const p = await b.newPage();
  await p.setViewport({ width: 1320, height: 1000, deviceScaleFactor: 1.5 });
  await p.goto(FILE, { waitUntil: "networkidle2", timeout: 60000 });
  // wait for mermaid svgs
  await p.waitForFunction(() => document.querySelectorAll(".mermaid svg").length >= 2, { timeout: 30000 }).catch(()=>console.log("mermaid wait timeout"));
  await sleep(800);
  await snap(p, "#flow", "1_flow");
  await snap(p, "#ia .panel", "2_ia");
  const boards = await p.$$(".board");
  for (let i = 0; i < boards.length; i++) {
    await boards[i].screenshot({ path: path.join(OUT, "board_" + i + ".png") });
    console.log("board", i);
  }
  await b.close(); console.log("DONE");
})();
