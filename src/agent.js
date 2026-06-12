import { MAX_STEPS } from "../config.js";
import { BrowserController } from "./browser.js";
import { Brain } from "./brain.js";
import * as perception from './perception.js'
import { log } from './logger.js'


export class Agent{
  constructor() {
    this.browser = new BrowserController();
    this.brain = new Brain();
    this.history = [];
  }

  async run(url,task) {
    log.info(`--------- TASK: ${task} -------`)
    try {
      await this.browser.openBrowser();
      await this.browser.navigateToURL(url);

      let done = false;
      for (let step = 1; step <= MAX_STEPS; step++) {
        log.info(`---------- STEP ${step} ----------`);

        const elements = await perception.getInteractiveElements(this.browser.page);
        const screenshot = await perception.annotatedScreenshots(this.browser.page, `step_${String(step).padStart(2, '0')}`);
        const elementsText = perception.elementsToText(elements)

        const decision = await this.brain.decide(task, elementsText, screenshot, this.history.join('\n'));
        log.info(`THOUGHT:${decision.thought} | ACTION:${decision.action}`);

        const Proceed = await this.act(decision, elements);
        if (!Proceed) {
          done = true;
          log.info("Agent reported task completed");
          break;
        }
      }
      if (!done) log.warn(`Reached MAX_STEPS(${MAX_STEPS}) - STATUS : TASK NOT COMLPETED.`);

      await this.browser.takeScreenshot('final');
    } finally { 
      await this.browser.closeBrowser();
      log.info(`------ TASK DONE - Browser Closed ---------`)
    }
  }

  async act(decision, elements) {
    const { action, index } = decision;

    const coordsOf = (i) => {
      const element = elements.find((e) => e.index === i);
      if (!element) throw new Error(`LLM picked index ${i}, which apparently doesn't exist on the page`);
      return [element.x, element.y];
    }

    try {
      if (action === 'done') {
        this.history.push('done');
        return false; 
      } else if(action === 'click'){
        const [x, y] = coordsOf(index);
        await this.browser.clickAt(x, y)
        this.history.push(`clicked element ${index}`);
      } else if (action === 'double_click') {
        const [x, y] = coordsOf(index);
        await this.browser.doubleClickAt(x, y);
        this.history.push(`double-clicked element [${index}]`);
      } else if (action === 'type') {
        const [x, y] = coordsOf(index);
        await this.browser.clickAt(x, y);        // focus the field first
        await this.browser.sendKeys(decision.text || '');  // then type
        this.history.push(`typed ${JSON.stringify(decision.text)} into element [${index}]`);
      } else if (action === 'scroll') {
        await this.browser.scrollPage(decision.direction || 'down');
        this.history.push(`scrolled ${decision.direction || 'down'}`);
      } else {
        log.warn(`Unknown action '${action}' — skipping`);
        this.history.push(`ignored unknown action ${JSON.stringify(action)}`);
      }
    } catch (err) {
      log.error(`Action Failed: ${err.message}`);
      await this.browser.takeScreenshot('error');
      this.history.push(`Error on ${action}: ${err.message}`)
    }
  }
}
