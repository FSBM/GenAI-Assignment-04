import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


export const BASE_DIR = __dirname;
export const LOG_DIR = path.join(BASE_DIR, 'logs');
export const SCREENSHOT_DIR = path.join(BASE_DIR, 'screenshots');

mkdirSync(LOG_DIR, { recursive: true });
mkdirSync(SCREENSHOT_DIR, { recursive: true });


export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const GEMINI_MODEL = process.env.GEMINI_MODEL;


export const HEADLESS = process.env.HEADLESS === 'true';
export const VIEWPORT = { width: 1280, height: 800 };
export const DEFAULT_TIMEOUT_MS = 30_000;

export const MAX_STEPS = 20;
export const TARGET_URL = 'https://ui.shadcn.com/docs/forms/react-hook-form'



export const getTimeStamp = () => {
  const now = new Date();
  return (
    String(now.getDate()).padStart(2, '0') + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    now.getFullYear() + '--' +
    String(now.getHours()).padStart(2, '0') + ':' +
    String(now.getMinutes()).padStart(2, '0') + ':' +
    String(now.getSeconds()).padStart(2, '0')
  );
};

