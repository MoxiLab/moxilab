import fs from 'node:fs';
import path from 'node:path';

const LEVEL_PRIORITY = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function normalizeLevel(value, fallback = 'info') {
  const s = String(value ?? '').trim().toLowerCase();
  return Object.hasOwn(LEVEL_PRIORITY, s) ? s : fallback;
}

function safeJson(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return JSON.stringify({ error: 'serialize_failed' });
  }
}

function ensureLogDirectory(logDirectory) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

function getLogFilePath(logDirectory) {
  const date = new Date().toISOString().slice(0, 10);
  return path.join(logDirectory, `api-${date}.log`);
}

export function createLogger(options = {}) {
  const level = normalizeLevel(options.level ?? process.env.LOG_LEVEL ?? 'info');
  const logDirectory = options.logDirectory ?? path.resolve(process.cwd(), 'logs');
  const fileEnabled = String(options.fileEnabled ?? process.env.LOG_TO_FILE ?? '1') !== '0';
  const memoryLimit = Number(options.memoryLimit ?? process.env.LOG_MEMORY_LIMIT ?? 400);
  const entries = [];

  if (fileEnabled) ensureLogDirectory(logDirectory);

  function shouldLog(targetLevel) {
    return LEVEL_PRIORITY[targetLevel] >= LEVEL_PRIORITY[level];
  }

  function write(targetLevel, message, meta) {
    if (!shouldLog(targetLevel)) return;

    const entry = {
      ts: new Date().toISOString(),
      level: targetLevel,
      msg: message,
      ...(meta ? { meta } : {}),
    };

    entries.push(entry);
    if (entries.length > memoryLimit) {
      entries.splice(0, entries.length - memoryLimit);
    }

    const consoleText = `${entry.ts} [${targetLevel.toUpperCase()}] ${message}`;
    if (targetLevel === 'error') {
      console.error(consoleText, meta ?? '');
    } else if (targetLevel === 'warn') {
      console.warn(consoleText, meta ?? '');
    } else {
      console.log(consoleText, meta ?? '');
    }

    if (fileEnabled) {
      const filePath = getLogFilePath(logDirectory);
      fs.appendFile(filePath, `${safeJson(entry)}\n`, { encoding: 'utf8' }, () => {
        // Best-effort logging: avoid recursive logger errors.
      });
    }
  }

  return {
    debug: (message, meta) => write('debug', message, meta),
    info: (message, meta) => write('info', message, meta),
    warn: (message, meta) => write('warn', message, meta),
    error: (message, meta) => write('error', message, meta),
    getRecentEntries: (count = 200) => entries.slice(-Math.max(1, Number(count) || 200)).reverse(),
    http: (req, res, ms) => {
      write('info', 'http_request', {
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: ms,
        ip: req.ip,
        ua: req.headers['user-agent'] ?? '',
      });
    },
  };
}
