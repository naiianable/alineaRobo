require('dotenv').config();
const { chromium } = require('playwright');

const TOCK_URL = 'https://www.exploretock.com/alinea';

// await Promise.all(dates.map(async (date) => {

// }));

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

  // // Wait until exactly 11:00 AM CT
  // console.log(`Waiting for INSERT TARGET TIME HERE`);
  // const targetTime = new Date();
  // targetTime.setUTCHours(17, 0, 0, 0); // Convert 11 AM CT to UTC (17:00 UTC) //change to hst for testing

  // while (new Date() < targetTime) {
  //   await new Promise((resolve) => setTimeout(resolve, 1000)); // Check every second
  // }

  console.log('Refreshing for availability...');
  await page.reload();

  try {
    // Click on the "Gallery Book Now" link
    await page.waitForSelector(
      '[data-testid="offering-book-button_TheGalleryAlinea"]',
      { timeout: 5000 }
    );
    await page.click('[data-testid="offering-book-button_TheGalleryAlinea"]');
    console.log('✅ Clicked "Gallery Book Now".');

    // Wait for the pop-up modal to fully load
    const popupSelector = '#experience-dialog-content';
    await page.waitForSelector(popupSelector, { timeout: 5000 });

    // Find guest selector within the pop-up
    const guestSelector = await page.$(
      `${popupSelector} [data-testid="guest-selector"]`
    );

    if (guestSelector) {
      // Click the plus button 3 times to reach 4 guests
      for (let i = 0; i < 1; i++) {
        await guestSelector
          .$('[data-testid="guest-selector_plus"]')
          .then((btn) => btn?.click());
        await page.waitForTimeout(500);
      }
      console.log('✅ Increased party size to 4 in pop-up.');
    } else {
      console.log('❌ Guest selector not found in pop-up.');
    }

    // Click on calendar next button to access May
    const calendarNext = '[data-testid="calendar-next-button_calendar-next"]';
    await page.waitForSelector(calendarNext, { timeout: 5000 });
    await page.click(calendarNext);
    console.log('✅ Clicked calendarNext Button');

    // Select the date CHANGE TO 5/17
    const dateSelector =
      'button[aria-label="2025-04-19"][data-testid="consumer-calendar-day"]';
    await page.waitForSelector(dateSelector, { timeout: 5000 });
    await page.click(dateSelector);
    console.log('✅ Date set to April 16, 2025.');

    // Select first avaiable time slot
    const bookingButton = '[data-testid="booking-card-button"]';
    await page.waitForSelector(bookingButton, { timeout: 5000 });
    await page.click(bookingButton);
    await page.waitForTimeout(5000);
    console.log('✅ Booking Table...');

    // Selecting Wine Pairings to be Made on Site
    const menuItems = await page.$$('[data-testid="menu-item-name"]');

    for (const item of menuItems) {
      const text = await item.textContent();
      if (text.trim() === 'Select on Site') {
        //console.log(`This is the item: ${item}`);
        await item.click();
        console.log('✅ Clicked "Select on Site".');
        break;
      }
    }

    // Wait for the pop-up to appear
    const popUpSelector =
      '[data-testid="supplement-plus-one-supplement-id-8600800"]';
    await page.waitForSelector(popUpSelector, { timeout: 5000 });

    // Click the increase quantity button
    await page.click(popUpSelector);
    console.log('✅ Clicked "Increase Quantity" button.');

    // Click Add Items for Wine Pairings
    const addItemButton = '[data-testid="add-item-button"]';
    await page.waitForSelector(addItemButton, { timeout: 5000 });
    await page.click(addItemButton);
    console.log('✅ Clicked Add');

    // Click View Cart
    const viewCart = '[data-testid="supplement-page-view-order"]';
    await page.waitForSelector(viewCart, { timeout: 5000 });
    await page.click(viewCart);
    console.log('✅ Click view cart');
  } catch (error) {
    console.log('⚠️ No available slots or issue selecting:', error);

    // NEED TO ACCESS CONTINUE TO PAYMENT BUTTON
    // Wait for the "Continue to payment" button to appear
    const continueButtonSelector = 'button.css-1yfxm9y';
    await page.waitForSelector(continueButtonSelector, { timeout: 10000 });

    // Click the button
    await page.click(continueButtonSelector);
    console.log('✅ Clicked "Continue to payment".');
  }

  //UNCOMMENT THIS!!!
  //await browser.close();
})();
