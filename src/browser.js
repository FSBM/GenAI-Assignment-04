import { chromium } from "playwright";
import path from 'node:path';
import { HEADLESS, VIEWPORT, DEFAULT_TIMEOUT_MS, SCREENSHOT_DIR, getTimeStamp } from "../config.js";
import { log } from "./logger.js";

//here i'm creating a browser class and it
//functions(methods) to build
// to open the browser
// to navigate to a particular url
// to take screenshot
// to click
// to double click
// to pass keys
// to scroll

export class BrowserController {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
  }


  async openBrowser() {
    log.info(`Opening browser (headless=${HEADLESS})`)
    this.browser = await chromium.launch({ headless: HEADLESS });
    this.context = await this.browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: 1,
    });
    this.context.setDefaultTimeout(DEFAULT_TIMEOUT_MS);
    this.page = await this.context.newPage();

    return this.page;
  }

  async navigateToURL(url) {
    log.info(`Navigating to ${url}`)
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    try {
      await this.page.waitForLoadState('networkidle');
    } catch {
      log.warn('networkidle timeout(likely the page is ready) -- proceeding..')
    }
  }

  async takeScreenshot(name = 'screenshot@') {
    const current_timestamp = getTimeStamp();
    const S_p = path.join(SCREENSHOT_DIR, `${name}_${current_timestamp}.png`)
    log.info(`Taking screenshot of current status and saving to ${S_p}`)
    await this.page.screenshot({ path: S_p });
    log.info(`Screenshot saved as ${S_p}`)
  }
  
  async clickAt(x, y) {
    log.info(`Click at (${x}, ${y})`);
    await this.page.mouse.click(x, y);
  }

  async doubleClickAt(x, y) {
    log.info(`Double-click at (${x}, ${y})`);
    await this.page.mouse.dblclick(x, y);
  }

  async sendKeys(text, clearFirst = true) {
    log.info(`Typing: ${JSON.stringify(text)}`)
    if (clearFirst) {
      await this.page.keyboard.press(`ControlOrMeta+A`);
      await this.page.keyboard.press('Delete');
    }
    await this.page.keyboard.type(text, { delay: 30 });
  }
  
  async scrollPage(direction='down',amount='600') {
    if(typeof amount === 'string') amount = parseInt(amount);
    const dy = direction === 'down' ? amount : -amount;
    log.info(`Scrolling ${direction} ${amount}`)
    await this.page.mouse.wheel(0, dy);
  }

  async scrollToTop() {
    log.info('Scrolling to top of page');
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  async closeBrowser() {
    log.info('Closing browser');
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
    
  }

}