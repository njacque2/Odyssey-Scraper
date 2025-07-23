const { chromium } = require("playwright");
const axios = require("axios");
require('dotenv').config();


const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

(async () => {
  const browser = await chromium.launch({ headless: true});
  const page = await browser.newPage();

  await page.goto(
    "https://www.cineplex.com/theatre/cineplex-cinemas-vaughan?openTM=true",
    {
      waitUntil: "domcontentloaded",
    }
  );

  console.log("✅ Page loaded");
  // ✅ Accept cookies if popup appears
  try {
    await page.waitForSelector("#onetrust-accept-btn-handler", {
      timeout: 10000,
    });
    await page.click("#onetrust-accept-btn-handler");
    console.log("🍪 Accepted cookies");
  } catch {
    console.log("✅ No cookie popup");
  }

  // ✅ Open the movie selector
  await page.click('[data-testid="select-movie"]');

  //select odyssey movie
  const targetMovieSelector = '[data-type="movie-select-38376"]';
  await page.click(targetMovieSelector);

  //select vaughan theatre
  const theatreSelector = '[data-testid="select-theatre"]';
  await page.click(theatreSelector);
  const vaughanTheatreSelector = '[data-testid="theatre-id-7408"]';
  await page.click(vaughanTheatreSelector);

  //select date search, count the number of dates available
  await page.click('[data-testid="select-date"]');
  const count = await page
    .locator(".SelectDateDrawer_datesContainer___Py73")
    .evaluate((el) => el.children.length);
  console.log(`Number of children: ${count}`);

  if (count > 3) {
    axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: `New Dates Available!`,
    });
  }

  //select the first date
  await page.click('[data-testid="date-0"]');
  //check for showtimes
  const showtimes = await page
    .locator(".ShowtimeDetails_showtimes__rs2cB")
    .evaluate((el) => el.children.length);
  console.log(`Showtimes: ${showtimes}`);

  if (showtimes > 1) {
    axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: `New Times Available!`,
    });
  }

  await browser.close();
})();
