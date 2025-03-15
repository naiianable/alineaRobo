const { chromium } = require('playwright');

const TOCK_URL = 'https://www.exploretock.com/alinea';
const dates = ['2025-04-15', '2025-04-16', '2025-04-17']; // Add more dates as needed

async function bookDate(date) {
  const browser = await chromium.launch({ headless: false }); // Set to true for headless mode

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log(`🚀 Starting booking process for ${date}...`);
    await page.goto(TOCK_URL);

    console.log(`🔐 Logging in for ${date}...`);
    await page.click('text=Log in');
    await page.waitForLoadState('networkidle');

    await page.waitForSelector('data-testid="email-input"');
    await page.fill('input[name="email"]', process.env.TOCK_EMAIL);
    await page.waitForLoadState('networkidle');
    await page.fill('input[name="password"]', process.env.TOCK_PASSWORD);
    await page.waitForSelector('[data-testid="signin"]', { state: 'visible' });
    await page.click('[data-testid="signin"]');

    await page.waitForTimeout(3000); // Wait for login to complete

    console.log(`🔄 Refreshing for availability for ${date}...`);
    await page.reload();

    await page.waitForSelector(
      '[data-testid="offering-book-button_TheGalleryAlinea"]',
      { timeout: 5000 }
    );
    await page.click('[data-testid="offering-book-button_TheGalleryAlinea"]');
    console.log(`✅ Clicked "Gallery Book Now" for ${date}.`);

    await page.waitForSelector('#experience-dialog-content', { timeout: 5000 });

    const guestSelector = await page.$('[data-testid="guest-selector"]');
    if (guestSelector) {
      for (let i = 0; i < 1; i++) {
        await guestSelector
          .$('[data-testid="guest-selector_plus"]')
          .then((btn) => btn?.click());
        await page.waitForTimeout(500);
      }
      console.log(`✅ Increased party size to 4 for ${date}.`);
    } else {
      console.log(`❌ Guest selector not found for ${date}.`);
    }

    await page.waitForSelector(
      '[data-testid="calendar-next-button_calendar-next"]',
      { timeout: 5000 }
    );
    await page.click('[data-testid="calendar-next-button_calendar-next"]');
    console.log(`✅ Clicked Calendar Next Button for ${date}.`);

    const dateSelector = `button[aria-label="${date}"][data-testid="consumer-calendar-day"]`;
    await page.waitForSelector(dateSelector, { timeout: 5000 });
    await page.click(dateSelector);
    console.log(`✅ Date set to ${date}.`);

    const bookingButton = '[data-testid="booking-card-button"]';
    const buttonText = await page.$eval(
      bookingButton,
      (button) => button.innerText
    );

    if (buttonText !== 'Notify') {
      await page.waitForSelector(bookingButton, { timeout: 5000 });
      await page.click(bookingButton);
      await page.waitForTimeout(5000);
      console.log(`✅ Booking Table for ${date}...`);
    } else {
      console.log(`❌ No available slot for ${date}, skipping.`);
      return;
    }

    const menuItems = await page.$$('[data-testid="menu-item-name"]');
    for (const item of menuItems) {
      const text = await item.textContent();
      if (text.trim() === 'Select on Site') {
        await item.click();
        console.log(`✅ Clicked "Select on Site" for ${date}.`);
        break;
      }
    }

    const popUpSelector =
      '[data-testid="supplement-plus-one-supplement-id-8600800"]';
    await page.waitForSelector(popUpSelector, { timeout: 5000 });
    await page.click(popUpSelector);
    console.log(`✅ Clicked "Increase Quantity" for ${date}.`);

    await page.waitForSelector('[data-testid="add-item-button"]', {
      timeout: 5000,
    });
    await page.click('[data-testid="add-item-button"]');
    console.log(`✅ Clicked Add for ${date}.`);

    await page.waitForSelector('[data-testid="supplement-page-view-order"]', {
      timeout: 5000,
    });
    await page.click('[data-testid="supplement-page-view-order"]');
    console.log(`✅ Clicked View Cart for ${date}.`);

    const continueButtonSelector = 'button.css-1yfxm9y';
    await page.waitForSelector(continueButtonSelector, { timeout: 10000 });
    await page.click(continueButtonSelector);
    console.log(`✅ Clicked "Continue to Payment" for ${date}.`);
  } catch (error) {
    console.log(`⚠️ Error with booking for ${date}:`, error);
  } finally {
    // Uncomment if you want to close the browser automatically
    // await browser.close();
  }
}

(async () => {
  console.log(`🔥 Starting concurrent bookings for ${dates.length} dates...`);

  await Promise.all(dates.map(bookDate));

  console.log(`✅ All dates processed!`);
})();
