require('dotenv').config();
const { chromium } = require('playwright');

const TOCK_URL = 'https://www.exploretock.com/alinea';

(async () => {
  const browser = await chromium.launch({ headless: false }); // Set to true for headless mode
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Opening Tock...');
  await page.goto(TOCK_URL);

  // Click the login button
  console.log('Logging in...');
  ``;
  await page.click('text=Log in');
  await page.waitForLoadState('networkidle');
  // waiting for page to be stable before entering LOGIN
  await page.fill('input[name="email"]', process.env.TOCK_EMAIL);
  // waiting for page to be stable before entering PASSWORD
  await page.waitForLoadState('networkidle');
  await page.fill('input[name="password"]', process.env.TOCK_PASSWORD);
  // waiting for signin button to be stable before clicking
  await page.waitForSelector('[data-testid="signin"]', { state: 'visible' });
  await page.click('[data-testid="signin"]');

  await page.waitForTimeout(3000); // Wait for login to complete

  // Wait until exactly 11:00 AM CT
  console.log('Waiting for 11:00 AM CT...');
  const targetTime = new Date();
  targetTime.setUTCHours(17, 0, 0, 0); // Convert 11 AM CT to UTC (17:00 UTC)

  while (new Date() < targetTime) {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Check every second
  }

  console.log('Refreshing for availability...');
  await page.reload();

  // Try selecting a time slot (Modify selector based on actual structure)
  try {
    await page.waitForSelector('.available-time-slot-class', { timeout: 5000 });
    const timeSlots = await page.$$('.available-time-slot-class');

    if (timeSlots.length > 0) {
      console.log('Selecting time slot...');
      await timeSlots[0].click();

      await page.waitForTimeout(2000); // Wait for next step
      console.log('Proceeding to checkout...');

      await page.click('.checkout-button-class'); // Modify selector
      console.log('Reservation attempt complete!');
    } else {
      console.log('No time slots available.');
    }
  } catch (error) {
    console.log('No available slots or issue selecting.');
  }

  await browser.close();
})();
