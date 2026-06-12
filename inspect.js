import readline from 'node:readline'
import { TARGET_URL } from './config.js'
import { BrowserController } from './src/browser.js'
import * as perception from './src/perception.js'


const b = new BrowserController();
await b.openBrowser();
await b.navigateToURL(TARGET_URL);


const elements = await perception.getInteractiveElements(b.page);
console.log('\nInteractive elements found on the page:\n');
elements.forEach((element, index) => {
  console.log(`${index + 1}. ${element.tag} - ${element.label}`);
});

const screenshot = await perception.annotatedScreenshots(b.page, elements, 'inspect');
console.log(`\nAnnotated screenshot: ${screenshot}\n`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
await new Promise((resolve) => rl.question('\nPress Enter to close the browser...', resolve));
rl.close();
await b.closeBrowser();

