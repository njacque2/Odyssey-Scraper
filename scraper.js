const { chromium } = require("playwright");
const axios = require("axios");
require("dotenv").config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

(async () => {
  const browser = await chromium.launch({
    headless: true,
    slowMo: 100, // helpful for CI debugging, remove or lower if needed
  });

  const page = await browser.newPage();

  // Spoof user agent
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
  );

  console.log("🌐 Navigating to Cineplex page...");
  await page.goto(
    "https://www.cineplex.com/theatre/cineplex-cinemas-vaughan?openTM=true",
    { waitUntil: "networkidle" }
  );
  console.log("✅ Page loaded");

  // Accept cookies if popup exists
  try {
    await page.waitForSelector("#onetrust-accept-btn-handler", { timeout: 10000 });
    await page.click("#onetrust-accept-btn-handler");
    console.log("🍪 Accepted cookies");
  } catch {
    console.log("✅ No cookie popup");
  }

  // Open movie selector
  console.log("🎬 Opening movie selector...");
  await page.waitForSelector('[data-testid="select-movie"]', { timeout: 15000 });
  await page.click('[data-testid="select-movie"]');

  // Select Odyssey movie
  const targetMovieSelector = '[data-type="movie-select-38376"]';
  console.log("🎯 Selecting Odyssey...");
  await page.waitForSelector(targetMovieSelector, { timeout: 15000 });
  await page.click(targetMovieSelector);

  // Open theatre selector
  console.log("🏢 Opening theatre selector...");
  await page.waitForSelector('[data-testid="select-theatre"]', { timeout: 15000 });
  await page.click('[data-testid="select-theatre"]');

  // Select Vaughan
  const vaughanTheatreSelector = '[data-testid="theatre-id-7408"]';
  console.log("🎯 Selecting Vaughan theatre...");
  await page.waitForSelector(vaughanTheatreSelector, { timeout: 15000 });
  await page.click(vaughanTheatreSelector);

  // Open date selector
  console.log("📅 Opening date picker...");
  await page.waitForSelector('[data-testid="select-date"]', { timeout: 15000 });
  await page.click('[data-testid="select-date"]');

  // Count available dates
  console.log("🔢 Counting available dates...");
  await page.waitForSelector(".SelectDateDrawer_datesContainer___Py73", { timeout: 15000 });
  const count = await page
    .locator(".SelectDateDrawer_datesContainer___Py73")
    .evaluate((el) => el.children.length);
  console.log(`📆 Number of available dates: ${count}`);

  if (count > 3) {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: `🎬 New Dates Available at Cineplex Vaughan!`,
    });
    console.log("📨 Sent Telegram: New Dates");
  }

  // Select the first date
  console.log("📆 Selecting first date...");
  await page.waitForSelector('[data-testid="date-0"]', { timeout: 15000 });
  await page.click('[data-testid="date-0"]');

  // Check for showtimes
  console.log("⏰ Checking for showtimes...");
  await page.waitForSelector(".ShowtimeDetails_showtimes__rs2cB", { timeout: 15000 });
  const showtimes = await page
    .locator(".ShowtimeDetails_showtimes__rs2cB")
    .evaluate((el) => el.children.length);
  console.log(`🎟️ Showtimes: ${showtimes}`);

  if (showtimes > 1) {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: `🎟️ New Showtimes Available at Cineplex Vaughan!`,
    });
    console.log("📨 Sent Telegram: New Showtimes");
  }

  await browser.close();
  console.log("✅ Done and browser closed");
})();
