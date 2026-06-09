import { chromium } from 'playwright';


const URL = 'https://ui.shadcn.com/docs/forms/react-hook-form';


const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({viewport: { width: 1280, height: 800 }});

await page.goto(URL, {waitUntil: 'domcontentloaded'});
await page.waitForLoadState('networkidle');


await page
    .getByPlaceholder('Login button not working on mobile')
    .fill('Login button unresponsive on checkout');

await page
  .getByPlaceholder("I'm having an issue with the login button on mobile")
  .fill('Tapping the login button on the checkout page does nothing on iOS Safari.');

await page.screenshot({ path: 'baseline.png' });
console.log('Screenshot saved as baseline.png');

await browser.close();