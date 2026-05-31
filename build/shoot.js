const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const FILE = "file:///" + path.resolve(__dirname, "..", "index.html").replace(/\\/g, "/");
const OUT = path.resolve(__dirname, "shots");
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// uniform full-phone (nav is absolute bottom:0 already). screen scroll reset between shots.
async function shoot(page, name, screen, setup, wait = 250) {
  await page.evaluate(`navigate('${screen}')`);
  await page.evaluate(`document.querySelector('#${screen}').scrollTo(0,0)`);
  if (setup) await page.evaluate(setup);
  await sleep(wait);
  const el = await page.$(".phone");
  await el.screenshot({ path: path.join(OUT, name + ".png") });
  console.log("shot", name);
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 880, deviceScaleFactor: 2 });
  await page.goto(FILE, { waitUntil: "networkidle0" });

  await shoot(page, "home", "home");
  await shoot(page, "diary", "diary");
  // generate AI diary, wait for toast to fade, scroll to reveal the result card
  await shoot(page, "diary_result", "diary",
    "document.querySelector('#makeDiary').click(); setTimeout(()=>document.querySelector('#diary').scrollTo(0,9999),50);", 2700);
  await shoot(page, "walk", "walk");
  await shoot(page, "family", "family");
  await shoot(page, "profile", "profile");

  await browser.close();
  console.log("DONE");
})();
