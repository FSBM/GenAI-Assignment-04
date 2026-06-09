import fs from 'node:fs';
import path from 'node:path';
import { LOG_DIR } from '../config.js';

const pad = (n) => String(n).padStart(2, '0');

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

function getFileTimestamp() {
    const now = new Date();
    return (
        `${now.getFullYear()}-` +
        `${pad(now.getMonth() + 1)}-` +
        `${pad(now.getDate())}_` +
        `${pad(now.getHours())}-` +
        `${pad(now.getMinutes())}-` +
        `${pad(now.getSeconds())}`
    );
}

function getTime() {
    const now = new Date();
    return (
        `${pad(now.getHours())}:` +
        `${pad(now.getMinutes())}:` +
        `${pad(now.getSeconds())}`
    );
}

function serialize(value) {
    if (typeof value === 'string') {
        return value;
    }

    try {
        return JSON.stringify(value);
    } catch {
        return '[Unserializable Object]';
    }
}

const LOG_FILE = path.join(
    LOG_DIR,
    `log_${getFileTimestamp()}.txt`
);

function emit(level, parts) {
    const message = parts
        .map(serialize)
        .join(' ');

    const line =
        `[${getTime()}] ` +
        `[${level.padEnd(5)}] ` +
        `${message}`;
    console.log(line);

    fs.appendFileSync(
        LOG_FILE,
        line + '\n',
        'utf8'
    );
}

export const logger = {
    info: (...parts) => emit('INFO', parts),
    warn: (...parts) => emit('WARN', parts),
    error: (...parts) => emit('ERROR', parts),
};