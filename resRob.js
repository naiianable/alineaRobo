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

    // Select the date (April 15, 2025)
    const dateSelector =
      'button[aria-label="2025-04-23"][data-testid="consumer-calendar-day"]';
    await page.waitForSelector(dateSelector, { timeout: 5000 });
    await page.click(dateSelector);
    console.log('✅ Date set to April 23, 2025.');

    // // Select the date (May 15)
    // await page.waitForSelector('.calendar-button', { timeout: 5000 });
    // await page.click('.calendar-button'); // Open date picker
    // await page.waitForSelector('.calendar-day[data-date="2024-04-15"]');
    // await page.click('.calendar-day[data-date="2024-04-15"]');
    // console.log('✅ Date set to May 15.');

    // Proceed with selecting time slots and checkout
    await page.waitForSelector('.available-time-slot-class', { timeout: 5000 });
    const timeSlots = await page.$$('.available-time-slot-class');

    if (timeSlots.length > 0) {
      console.log('⏳ Selecting time slot...');
      await timeSlots[0].click();
      await page.waitForTimeout(2000);
      console.log('✅ Proceeding to checkout...');
      await page.click('.checkout-button-class');
      console.log('🎉 Reservation attempt complete!');
    } else {
      console.log('❌ No time slots available.');
    }
  } catch (error) {
    console.log('⚠️ No available slots or issue selecting:', error);
  }

  await browser.close();

  // try {
  //   // Click on the "Gallery Book Now" link
  //   await page.waitForSelector(
  //     '[data-testid="offering-book-button_TheGalleryAlinea"]',
  //     { timeout: 5000 }
  //   );
  //   await page.click('[data-testid="offering-book-button_TheGalleryAlinea"]');
  //   console.log('✅ Clicked "Gallery Book Now".');

  //   // Wait for the reservation pop-up to appear
  //   await page.waitForSelector('[data-testid="experience-dialog-content"]', {
  //     timeout: 5000,
  //   });

  //   // Find the guest selector within the pop-up
  //   const popupGuestSelector = await page.$(
  //     '[data-testid="reservation-search-bar"] [data-testid="guest-selector"]'
  //   );

  //   if (popupGuestSelector) {
  //     console.log('✅ Found the pop-up guest selector.');

  //     //SELECTING THE WRONG GUEST SELECTOR

  //     // Increase the party size to 4 by clicking the "+" button twice
  //     for (let i = 0; i < 2; i++) {
  //       await popupGuestSelector
  //         .$('[data-testid="guest-selector_plus"]')
  //         .then((button) => button.click());
  //       await page.waitForTimeout(500); // Small delay for stability
  //     }

  //     console.log('✅ Party size increased to 4.');
  //   } else {
  //     console.log('❌ Could not find the pop-up guest selector.');
  //   }

  //   // Select the date (May 15)
  //   await page.waitForSelector('.calendar-button', { timeout: 5000 });
  //   await page.click('.calendar-button'); // Open date picker
  //   await page.waitForSelector('.calendar-day[data-date="2024-05-15"]');
  //   await page.click('.calendar-day[data-date="2024-05-15"]');
  //   console.log('✅ Date set to May 15.');

  //   // Proceed with selecting time slots and checkout
  //   await page.waitForSelector('.available-time-slot-class', { timeout: 5000 });
  //   const timeSlots = await page.$$('.available-time-slot-class');

  //   if (timeSlots.length > 0) {
  //     console.log('⏳ Selecting time slot...');
  //     await timeSlots[0].click();
  //     await page.waitForTimeout(2000);
  //     console.log('✅ Proceeding to checkout...');
  //     await page.click('.checkout-button-class');
  //     console.log('🎉 Reservation attempt complete!');
  //   } else {
  //     console.log('❌ No time slots available.');
  //   }
  // } catch (error) {
  //   console.log('⚠️ No available slots or issue selecting:', error);
  // }

  // await browser.close();
})();
