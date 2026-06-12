import { TARGET_URL } from './config.js';
import { Agent } from './src/agent.js';

const task =
  "This page contains a 'Bug Report' form. " +
  "1) In the first text field (labelled 'Bug Title' — this is the Name field), " +
  "type: 'Login button unresponsive on checkout'. " +
  "2) In the 'Description' textarea, type: " +
  "'Tapping the login button on the checkout page does nothing on iOS Safari.' " +
  "Do NOT click Submit or Reset. " +
  "When both fields contain their text, the task is done.";

await new Agent().run(TARGET_URL, task);
