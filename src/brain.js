import fs from 'node:fs';
import { GoogleGenAI, createUserContent, createPartFromBase64 } from '@google/genai';
import { GEMINI_API_KEY, GEMINI_MODEL } from '../config.js';
import { log } from './logger.js';

export const SYSTEM_PROMPT = `You are a web-automation agent driving a real browser.

Each turn you receive:
- TASK: what the user wants accomplished.
- ELEMENTS: a numbered list of visible interactive elements, each with its index, tag,
  label, current contents (shown as value="...") and screen coordinates.
- A screenshot with matching numbered red boxes over those elements.
- ACTIONS SO FAR: what you have already done.

Decide the SINGLE best next action. Respond with ONLY a JSON object, no markdown fences,
in exactly this shape:

{
  "thought": "<one short sentence of reasoning>",
  "action": "click | type | double_click | scroll | done",
  "index": <int element index, or null>,
  "text": "<text to type, or null>",
  "direction": "<down | up, only for scroll, else null>"
}

Rules:
- Identify form fields by their LABEL (e.g. "Bug Title", "Description"), NOT by their
  placeholder or example text. Map each field named in the TASK to the closest label.
- To fill a field, use action "type" with the field's index and the text.
  (The agent automatically clicks the field to focus it before typing.)
- Use "scroll" only if a field you still need is not in the current list. Scroll "down" to
  reveal fields further down the page, or "up" to return to a field you filled earlier.
- Before using "done", VERIFY from the ELEMENTS list that every field the TASK requires
  shows the expected value="...". If a required field is not currently visible, scroll to it
  and confirm its value first. Never call "done" on assumption.
- When every required field is confirmed filled, use action "done".
- Output strictly valid JSON. No backticks, no extra commentary.`;


function parseJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    const cleaned = raw
      .replace(/^```json/i, '')
      .replace(/^```/, '')
      .replace(/```$/, '')
      .trim();
    return JSON.parse(cleaned);
  }
}


export class Brain{
  constructor() {
    if (!GEMINI_API_KEY) {
      throw new Error(
        'GEMINI_API_KEY is missing. Add it to your .env file'
      );
    }
    this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }

  async decide(task, elementsText, screenshotPath, history) {
    const base64 = fs.readFileSync(screenshotPath).toString('base64');
    const prompt = 
      `TASK:\n${task}\n\n` +
      `ELEMENTS:\n${elementsText}\n\n` +
      `ACTIONS SO FAR:\n${history || 'none'}\n\n` +
      'Return the next action as JSON.';

    const response = await this.ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: createUserContent([prompt, createPartFromBase64(base64, 'image/png')]),
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0
      }
    });
    const raw = (response.text || '').trim();
    log.info(`LLM response : Decision-plan:${raw}`);
    return parseJson(raw);
  }
  
}