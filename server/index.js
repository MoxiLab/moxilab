import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient, ObjectId } from 'mongodb';
import { createLogger } from './logger.js';

dotenv.config({ path: fs.existsSync('.env.local') ? '.env.local' : '.env' });

const PORT = Number(process.env.PORT ?? 8787);
const WEB_APP_URL = (
  process.env.WEB_APP_URL ??
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173')
).replace(/\/$/, '');
const BOT_API_URL = (process.env.BOT_API_URL ?? 'http://127.0.0.1:3099').replace(/\/$/, '');
const BOT_API_SECRET = (process.env.BOT_API_SECRET ?? '').trim();
const MONGODB_URI = process.env.MONGODB_URI;
const DB_OVERRIDE = process.env.MONGODB_DB;
const COMMANDS_COLLECTION = process.env.MONGODB_COMMANDS_COLLECTION ?? 'commands';
const PLAYGROUND_JOBS_COLLECTION =
  process.env.MONGODB_PLAYGROUND_JOBS_COLLECTION ?? 'playground_jobs';
const LOGS_DASHBOARD_KEY = (process.env.LOGS_DASHBOARD_KEY ?? '').trim();
const DISCORD_CLIENT_ID = (process.env.DISCORD_CLIENT_ID ?? process.env.VITE_DISCORD_CLIENT_ID ?? '').trim();
const DISCORD_CLIENT_SECRET = (process.env.DISCORD_CLIENT_SECRET ?? '').trim();
const DISCORD_REDIRECT_URI = (process.env.DISCORD_REDIRECT_URI ?? process.env.VITE_DISCORD_REDIRECT_URI ?? '').trim();
const logger = createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  logDirectory: path.resolve(process.cwd(), 'logs'),
});

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderLogsDashboard(entries) {
  const homeHref = WEB_APP_URL ? `${WEB_APP_URL}/` : '/';
  const commandsHref = WEB_APP_URL ? `${WEB_APP_URL}/#/commands` : '/#/commands';
  const resourcesHref = WEB_APP_URL ? `${WEB_APP_URL}/#` : '/#';
  const logoSrc = WEB_APP_URL ? `${WEB_APP_URL}/moxi-hero.jpg` : '/moxi-hero.jpg';

  const rows = entries
    .map((entry) => {
      const level = escapeHtml(entry.level || 'info');
      const ts = escapeHtml(entry.ts || '');
      const msg = escapeHtml(entry.msg || '');
      const meta = escapeHtml(
        entry.meta ? JSON.stringify(entry.meta, null, 0) : ''
      );
      const searchable = escapeHtml(`${ts} ${level} ${msg} ${meta}`.toLowerCase());
      return `<tr data-row="1" data-level="${level}" data-text="${searchable}">
        <td>${ts}</td>
        <td class="level ${level}">${level}</td>
        <td>${msg}</td>
        <td><pre>${meta}</pre></td>
      </tr>`;
    })
    .join('');

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>API Logs Dashboard</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
      color: #e6edf3;
      background:
        radial-gradient(70rem 35rem at 110% -10%, rgba(217, 70, 239, 0.14), transparent 55%),
        radial-gradient(64rem 30rem at -10% 110%, rgba(99, 102, 241, 0.14), transparent 60%),
        linear-gradient(135deg, #111528 0%, #0f1426 45%, #121930 100%);
    }
    .bg-blob {
      position: fixed;
      pointer-events: none;
      border-radius: 2.5rem;
      filter: blur(50px);
      opacity: 0.45;
      z-index: 0;
    }
    .bg-blob.one {
      width: 360px;
      height: 360px;
      right: -120px;
      top: -120px;
      background: rgba(244, 114, 182, 0.28);
      transform: rotate(12deg);
    }
    .bg-blob.two {
      width: 440px;
      height: 440px;
      left: -140px;
      bottom: -160px;
      background: rgba(129, 140, 248, 0.24);
      transform: rotate(-10deg);
    }
    .wrap { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto; padding: 112px 18px 32px; }
    .dashboard-nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 5;
      border-bottom: 1px solid rgba(86, 97, 124, 0.3);
      background: linear-gradient(180deg, rgba(17, 24, 42, 0.96), rgba(15, 21, 37, 0.95));
      backdrop-filter: blur(8px);
    }
    .dashboard-nav-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      text-decoration: none;
      color: inherit;
    }
    .brand img {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      object-fit: cover;
      border: 1px solid rgba(255, 255, 255, 0.16);
    }
    .brand-title { font-weight: 800; letter-spacing: 0.2px; font-size: 30px; }
    .brand-sub { color: #9fb0c7; font-size: 12px; }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 2px;
      margin-left: 18px;
    }
    .nav-links a {
      color: rgba(230, 237, 243, 0.82);
      text-decoration: none;
      font-size: 17px;
      font-weight: 600;
      padding: 10px 12px;
      border-radius: 10px;
      transition: all .2s ease;
    }
    .nav-links a:hover {
      color: #f472b6;
      background: rgba(244, 114, 182, 0.1);
    }
    .nav-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .nav-chip {
      border: 1px solid rgba(245, 158, 11, 0.45);
      color: #fbbf24;
      border-radius: 999px;
      font-size: 12px;
      padding: 7px 11px;
      white-space: nowrap;
      background: rgba(245, 158, 11, 0.08);
    }
    .nav-link-muted {
      color: rgba(230, 237, 243, 0.88);
      text-decoration: none;
      font-size: 16px;
      padding: 8px 10px;
      border-radius: 10px;
    }
    .nav-link-muted:hover {
      background: rgba(99, 102, 241, 0.15);
    }
    .badge {
      border: 1px solid rgba(245, 158, 11, 0.45);
      color: #fbbf24;
      border-radius: 999px;
      font-size: 12px;
      padding: 5px 9px;
      white-space: nowrap;
      background: rgba(245, 158, 11, 0.08);
    }
    h1 { margin: 0 0 6px; font-size: clamp(26px, 4vw, 38px); letter-spacing: -0.03em; }
    .sub { color: #9fb0c7; margin-bottom: 16px; font-size: 15px; }
    .toolbar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-bottom: 12px; }
    .toolbar input, .toolbar select, .toolbar button {
      background: rgba(18, 27, 46, 0.85);
      border: 1px solid rgba(70, 85, 117, 0.55);
      color: #e6edf3;
      border-radius: 10px;
      padding: 8px 10px;
      font-size: 13px;
    }
    .toolbar button {
      cursor: pointer;
      border-color: rgba(236, 72, 153, 0.55);
      background: linear-gradient(180deg, rgba(236, 72, 153, 0.2), rgba(236, 72, 153, 0.1));
    }
    .toolbar button:hover { filter: brightness(1.1); }
    .toolbar input { min-width: 260px; flex: 1; }
    .toolbar .count { color: #9fb0c7; font-size: 13px; margin-left: auto; }
    .card {
      border: 1px solid rgba(85, 99, 130, 0.45);
      border-radius: 16px;
      overflow: hidden;
      background: linear-gradient(180deg, rgba(19, 28, 49, 0.88), rgba(16, 23, 40, 0.88));
      backdrop-filter: blur(4px);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.26);
    }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead th { text-align: left; background: rgba(25, 38, 66, 0.9); padding: 10px; border-bottom: 1px solid rgba(85, 99, 130, 0.45); }
    tbody td { padding: 10px; border-bottom: 1px solid rgba(42, 57, 88, 0.75); vertical-align: top; }
    tbody tr:hover { background: rgba(34, 49, 79, 0.65); }
    pre { margin: 0; white-space: pre-wrap; word-break: break-word; color: #c2d4f1; }
    .level { font-weight: 700; text-transform: uppercase; }
    .level.info { color: #78d3ff; }
    .level.warn { color: #ffd166; }
    .level.error { color: #ff7b7b; }
    .level.debug { color: #b9a3ff; }
    @media (max-width: 740px) {
      .toolbar .count { width: 100%; margin-left: 0; }
      .dashboard-nav-inner { padding: 10px 12px; }
      .brand-title { font-size: 24px; }
      .nav-links { display: none; }
      .nav-link-muted { display: none; }
      .wrap { padding-top: 96px; }
    }
  </style>
</head>
<body>
  <div class="bg-blob one"></div>
  <div class="bg-blob two"></div>
  <div class="dashboard-nav">
    <div class="dashboard-nav-inner">
      <div style="display:flex;align-items:center;min-width:0;">
        <a class="brand" href="${homeHref}" title="Ir al inicio">
          <img src="${logoSrc}" alt="Moxi" />
          <div class="brand-title">Moxi</div>
        </a>
        <nav class="nav-links">
          <a href="${homeHref}">Inicio</a>
          <a href="${commandsHref}">Comandos</a>
          <a href="${resourcesHref}">Recursos</a>
        </nav>
      </div>
      <div class="nav-right">
        <a href="#" class="nav-link-muted">ES</a>
        <div class="nav-chip">Premium</div>
        <span class="nav-link-muted" aria-current="page">Sesión activa</span>
      </div>
    </div>
  </div>
  <div class="wrap">
    <h1>Logs del API</h1>
    <div class="sub">Mostrando los últimos ${entries.length} eventos. Puedes filtrar por nivel y buscar texto.</div>
    <div class="toolbar">
      <input id="searchInput" type="text" placeholder="Buscar por evento, ruta, error, ip, etc." />
      <select id="levelFilter">
        <option value="all">Todos los niveles</option>
        <option value="error">Error</option>
        <option value="warn">Warn</option>
        <option value="info">Info</option>
        <option value="debug">Debug</option>
      </select>
      <button id="refreshBtn" type="button">Recargar</button>
      <span class="count" id="visibleCount"></span>
    </div>
    <div class="card">
      <table>
        <thead>
          <tr>
            <th style="width: 220px;">Fecha</th>
            <th style="width: 90px;">Nivel</th>
            <th style="width: 220px;">Evento</th>
            <th>Detalle</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="4">Sin logs todavía.</td></tr>'}</tbody>
      </table>
    </div>
  </div>
  <script>
    const searchInput = document.getElementById('searchInput');
    const levelFilter = document.getElementById('levelFilter');
    const visibleCount = document.getElementById('visibleCount');
    const refreshBtn = document.getElementById('refreshBtn');
    const rows = Array.from(document.querySelectorAll('tbody tr[data-row="1"]'));

    function applyFilters() {
      const query = String(searchInput.value || '').trim().toLowerCase();
      const selectedLevel = String(levelFilter.value || 'all');
      let visible = 0;

      for (const row of rows) {
        const rowText = String(row.dataset.text || '');
        const rowLevel = String(row.dataset.level || 'info');
        const matchLevel = selectedLevel === 'all' || rowLevel === selectedLevel;
        const matchText = !query || rowText.includes(query);
        const show = matchLevel && matchText;
        row.style.display = show ? '' : 'none';
        if (show) visible++;
      }

      visibleCount.textContent = visible + ' visibles de ' + rows.length;
    }

    searchInput.addEventListener('input', applyFilters);
    levelFilter.addEventListener('change', applyFilters);
    refreshBtn.addEventListener('click', () => window.location.reload());
    applyFilters();
  </script>
</body>
</html>`;
}

if (!MONGODB_URI && !BOT_API_URL) {
  logger.error('Falta MONGODB_URI o BOT_API_URL en el .env');
  process.exit(1);
}

// ─── Bot internal API ─────────────────────────────────────────────────────────
async function fetchBotCommands() {
  const headers = { Accept: 'application/json' };
  if (BOT_API_SECRET) headers['x-bot-secret'] = BOT_API_SECRET;
  const res = await fetch(`${BOT_API_URL}/api/commands`, { headers, signal: AbortSignal.timeout(4000) });
  if (!res.ok) throw new Error(`Bot API responded ${res.status}`);
  return res.json();
}

async function fetchBotJson(apiPath, timeoutMs = 4000) {
  const headers = { Accept: 'application/json' };
  if (BOT_API_SECRET) headers['x-bot-secret'] = BOT_API_SECRET;
  const res = await fetch(`${BOT_API_URL}${apiPath}`, { headers, signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`Bot API responded ${res.status}`);
  return res.json();
}

const client = new MongoClient(MONGODB_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
});

let connectPromise;

async function getCommandsCollection() {
  if (!connectPromise) {
    connectPromise = client.connect();
  }
  await connectPromise;
  const db = DB_OVERRIDE ? client.db(DB_OVERRIDE) : client.db();
  return db.collection(COMMANDS_COLLECTION);
}

async function getPlaygroundJobsCollection() {
  if (!connectPromise) {
    connectPromise = client.connect();
  }
  await connectPromise;
  const db = DB_OVERRIDE ? client.db(DB_OVERRIDE) : client.db();
  return db.collection(PLAYGROUND_JOBS_COLLECTION);
}

function clampInt(value, { min, max, fallback }) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function escapeRegex(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeModuleId(value) {
  const key = normalizeText(value);
  if (!key) return '';

  const aliases = new Map([
    ['welcome', 'welcome'],
    ['bienvenida', 'welcome'],
    ['sistema de bienvenida', 'welcome'],
    ['roleplay', 'roleplay'],
    ['rol', 'roleplay'],
    ['economia', 'economy'],
    ['economy', 'economy'],
    ['utilidades', 'utilities'],
    ['utilidad', 'utilities'],
    ['herramientas', 'utilities'],
    ['utilities', 'utilities'],
    ['moderacion', 'moderation'],
    ['moderation', 'moderation'],
    ['musica', 'music'],
    ['music', 'music'],
    ['ia', 'ai'],
    ['inteligencia artificial', 'ai'],
    ['ai', 'ai'],
    ['sorteos', 'giveaways'],
    ['giveaways', 'giveaways'],
    ['tickets', 'tickets'],
    ['soporte', 'tickets'],
    ['logs', 'logs'],
    ['registros', 'logs'],
    ['automod', 'automod'],
    ['automoderacion', 'automod'],
    ['wiki', 'wiki'],
    ['voz', 'voice'],
    ['voice', 'voice'],
    ['owner', 'owner'],
    ['propietario', 'owner'],
    ['fun', 'fun'],
    ['diversion', 'fun'],
    ['juegos', 'fun'],
    ['administracion', 'administration'],
    ['administration', 'administration'],
    ['sistema', 'systems'],
    ['sistemas', 'systems'],
    ['systems', 'systems'],
    ['streaming', 'streaming'],
    ['genshin', 'genshin'],
    ['marriage', 'matrimonio'],
    ['boda', 'matrimonio'],
    ['matrimonio', 'matrimonio'],
  ]);

  return aliases.get(key) ?? key.replace(/\s+/g, '-');
}

function parsePlaygroundInput(input) {
  const raw = String(input ?? '').trim();
  const looksPrefix = raw.startsWith('.');
  const looksSlash = raw.startsWith('/');
  const cleaned = raw.replace(/^\s*[./]+\s*/, '').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const base = parts[0] ?? '';
  const tail = parts.slice(1).join(' ').trim();
  const fullName = [base, tail].filter(Boolean).join(' ').trim();
  return {
    raw,
    cleaned,
    base,
    tail,
    fullName,
    looksPrefix,
    looksSlash,
    normalizedRaw: normalizeText(raw),
    normalizedCleaned: normalizeText(cleaned),
    normalizedFullName: normalizeText(fullName),
    normalizedBase: normalizeText(base),
    normalizedTail: normalizeText(tail),
  };
}

function numberColorToHex(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  const clamped = Math.max(0, Math.min(0xffffff, Math.trunc(value)));
  return `#${clamped.toString(16).padStart(6, '0')}`;
}

function pickFirstString(...candidates) {
  for (const c of candidates) {
    if (typeof c === 'string') {
      const t = c.trim();
      if (t) return t;
    }
  }
  return undefined;
}

function normalizeEmbed(embedLike) {
  if (!embedLike || typeof embedLike !== 'object') return undefined;
  const color =
    typeof embedLike.color === 'string'
      ? embedLike.color
      : numberColorToHex(embedLike.color);

  const title = pickFirstString(embedLike.title, embedLike.name, embedLike.header);
  const description = pickFirstString(embedLike.description, embedLike.desc, embedLike.text);

  const footerText =
    typeof embedLike.footer === 'string'
      ? embedLike.footer
      : pickFirstString(embedLike.footer?.text);

  const fieldsRaw = Array.isArray(embedLike.fields) ? embedLike.fields : undefined;
  const fields =
    fieldsRaw
      ?.map((f) => {
        if (!f || typeof f !== 'object') return undefined;
        const name = pickFirstString(f.name);
        const value = pickFirstString(f.value);
        if (!name || !value) return undefined;
        return {
          name,
          value,
          inline: Boolean(f.inline),
        };
      })
      .filter(Boolean) ?? undefined;

  if (!color && !title && !description && !footerText && !fields) return undefined;
  return {
    color,
    title,
    description,
    footerText,
    fields,
  };
}

function mapPlaygroundJob(doc) {
  if (!doc || typeof doc !== 'object') return undefined;
  const id = typeof doc._id?.toString === 'function' ? doc._id.toString() : undefined;

  const content = pickFirstString(
    doc.content,
    doc.message,
    doc.text,
    doc.reply,
    doc.response?.content,
    doc.response?.message,
    doc.response?.text
  );

  const embedCandidate =
    doc.embed ||
    doc.response?.embed ||
    (Array.isArray(doc.embeds) ? doc.embeds[0] : undefined) ||
    (Array.isArray(doc.response?.embeds) ? doc.response.embeds[0] : undefined);
  const embed = normalizeEmbed(embedCandidate);

  const rows = (Array.isArray(doc.rows) ? doc.rows : Array.isArray(doc.response?.rows) ? doc.response.rows : undefined)
    ?.map((r) => {
      if (!r || typeof r !== 'object') return undefined;
      const code = pickFirstString(r.code, r.cmd, r.command);
      const description = pickFirstString(r.description, r.desc, r.text);
      if (!code || !description) return undefined;
      return { code, description };
    })
    .filter(Boolean);

  const title = pickFirstString(doc.title, doc.name, doc.key, doc.trigger);
  const kind = pickFirstString(doc.kind, doc.type);

  return {
    id,
    title,
    kind,
    content,
    embed,
    rows: rows?.length ? rows : undefined,
  };
}

function mapPlaygroundJobFromQueueDoc(doc, { input, parsed }) {
  if (!doc || typeof doc !== 'object') return undefined;
  const id = typeof doc._id?.toString === 'function' ? doc._id.toString() : undefined;

  const payload = doc.payload && typeof doc.payload === 'object' ? doc.payload : undefined;
  const result = doc.result && typeof doc.result === 'object' ? doc.result : undefined;

  const preview =
    (result?.preview && typeof result.preview === 'object' ? result.preview : undefined) ||
    (result?.response && typeof result.response === 'object' ? result.response : undefined) ||
    (result?.output && typeof result.output === 'object' ? result.output : undefined);

  const ui =
    (result?.ui && typeof result.ui === 'object' ? result.ui : undefined) ||
    (result?.payload && typeof result.payload === 'object' ? result.payload : undefined);

  const previewEmbedCandidate =
    preview?.embed ||
    (Array.isArray(preview?.embeds) ? preview.embeds[0] : undefined) ||
    result?.embed ||
    (Array.isArray(result?.embeds) ? result.embeds[0] : undefined);

  const embed = normalizeEmbed(previewEmbedCandidate);

  const content =
    pickFirstString(
      ui?.content,
      preview?.content,
      preview?.message,
      preview?.text,
      result?.content,
      result?.message,
      result?.text
    ) ??
    undefined;

  const rows = (Array.isArray(preview?.rows) ? preview.rows : undefined)
    ?.map((r) => {
      if (!r || typeof r !== 'object') return undefined;
      const code = pickFirstString(r.code, r.cmd, r.command);
      const description = pickFirstString(r.description, r.desc, r.text);
      if (!code || !description) return undefined;
      return { code, description };
    })
    .filter(Boolean);

  return {
    id,
    title: payload?.name || parsed?.base,
    kind: 'commandPreview',
    content: embed ? undefined : content,
    embed,
    ui,
    rows: rows?.length ? rows : undefined,
    raw: {
      payload,
      result,
    },
  };
}

function getJobTriggers(doc) {
  const triggers = [];
  const one = pickFirstString(doc.trigger, doc.key, doc.match, doc.fullName, doc.name);
  if (one) triggers.push(one);
  if (Array.isArray(doc.triggers)) {
    for (const t of doc.triggers) {
      if (typeof t === 'string' && t.trim()) triggers.push(t.trim());
    }
  }
  return triggers;
}

function scorePlaygroundJob(doc, parsed) {
  const triggers = getJobTriggers(doc);
  const normTriggers = triggers.map(normalizeText);

  const command = pickFirstString(doc.command, doc.commandName, doc.base, doc.cmd);
  const sub = pickFirstString(doc.subcommand, doc.subCommand, doc.sub, doc.subName);
  const fullName = pickFirstString(doc.fullName, doc.full_name, doc.commandFullName);

  const normCommand = normalizeText(command);
  const normSub = normalizeText(sub);
  const normFull = normalizeText(fullName);

  let score = 0;

  if (normTriggers.includes(parsed.normalizedRaw)) score += 120;
  if (normTriggers.includes(parsed.normalizedCleaned)) score += 115;
  if (normTriggers.includes(parsed.normalizedFullName)) score += 110;

  if (normFull && normFull === parsed.normalizedFullName) score += 105;
  if (normCommand && normCommand === parsed.normalizedBase) score += 80;
  if (normCommand && normCommand === parsed.normalizedBase && normSub && normSub === parsed.normalizedTail) score += 95;

  if (normFull && parsed.normalizedFullName && normFull.includes(parsed.normalizedFullName)) score += 45;
  if (normCommand && parsed.normalizedBase && normCommand.includes(parsed.normalizedBase)) score += 30;
  if (normTriggers.some((t) => t && parsed.normalizedFullName && t.includes(parsed.normalizedFullName))) score += 35;

  return score;
}

function safeString(value) {
  return typeof value === 'string' ? value : undefined;
}

function safeStringArray(value) {
  if (!Array.isArray(value)) return undefined;
  const arr = value.filter((v) => typeof v === 'string').map((v) => v.trim()).filter(Boolean);
  return arr.length ? arr : undefined;
}

function isBadDescription(desc) {
  if (!desc) return true;
  return /^commands:CMD_/i.test(desc);
}

function normalizeSubcommandEntry(entry, baseName) {
  if (!entry || typeof entry !== 'object') return undefined;
  const name = typeof entry.name === 'string' ? entry.name.trim() : '';
  if (!name) return undefined;
  const group = typeof entry.group === 'string' ? entry.group.trim() : undefined;
  const fullNameRaw = typeof entry.fullName === 'string' ? entry.fullName.trim() : '';
  const fullName = fullNameRaw || (baseName ? `${baseName}${group ? ` ${group}` : ''} ${name}` : name);
  const description = typeof entry.description === 'string' ? entry.description.trim() : undefined;
  return {
    name,
    fullName,
    description: description && !isBadDescription(description) ? description : undefined,
  };
}

function extractSubcommandsFromOptions(baseName, options) {
  if (!Array.isArray(options)) return [];
  const out = [];
  for (const opt of options) {
    if (!opt || typeof opt !== 'object') continue;
    const type = opt.type;
    const name = typeof opt.name === 'string' ? opt.name.trim() : '';
    const desc = typeof opt.description === 'string' ? opt.description.trim() : undefined;

    // 1 = subcommand
    if (type === 1 && name) {
      out.push({ name, description: desc, fullName: `${baseName} ${name}` });
      continue;
    }

    // 2 = subcommand group
    if (type === 2 && name && Array.isArray(opt.options)) {
      const groupName = name;
      for (const sub of opt.options) {
        if (!sub || typeof sub !== 'object') continue;
        if (sub.type !== 1) continue;
        const subName = typeof sub.name === 'string' ? sub.name.trim() : '';
        if (!subName) continue;
        const subDesc =
          typeof sub.description === 'string' ? sub.description.trim() : undefined;
        out.push({
          name: subName,
          group: groupName,
          description: subDesc,
          fullName: `${baseName} ${groupName} ${subName}`,
        });
      }
    }
  }
  return out;
}

function inferType(doc, mapped) {
  const explicitBool =
    doc?.isSlash === true ||
    doc?.slash === true ||
    doc?.isSlashCommand === true ||
    doc?.is_slash === true;
  if (explicitBool) return 'slash';

  const typeStr = typeof doc?.type === 'string' ? doc.type.toLowerCase() : '';
  const kindStr = typeof doc?.kind === 'string' ? doc.kind.toLowerCase() : '';
  const commandTypeStr =
    typeof doc?.commandType === 'string' ? doc.commandType.toLowerCase() : '';

  if (
    ['slash', 'application', 'app', 'interaction'].includes(typeStr) ||
    ['slash', 'application', 'app', 'interaction'].includes(kindStr) ||
    ['slash', 'application', 'app', 'interaction'].includes(commandTypeStr)
  ) {
    return 'slash';
  }

  if (Array.isArray(mapped?.aliases) && mapped.aliases.length > 0) return 'prefix';
  if (typeof mapped?.usage === 'string' && mapped.usage.trim()) return 'prefix';

  return 'slash';
}

function mapCommandDoc(doc) {
  const name = typeof doc?.name === 'string' ? doc.name.trim() : '';
  if (!name) return undefined;

  const descriptionRaw = safeString(doc?.description)?.trim();
  const description = descriptionRaw && !isBadDescription(descriptionRaw) ? descriptionRaw : undefined;
  const category = safeString(doc?.category)?.trim() || undefined;
  const usage = safeString(doc?.usage)?.trim() || undefined;
  const aliases = safeStringArray(doc?.aliases);

  const subcommandsMerged = [];
  const subcommandsFields = [
    doc?.subcommands,
    doc?.subCommands,
    doc?.subcommand,
    doc?.subCommand,
    doc?.sub,
  ];

  for (const field of subcommandsFields) {
    if (Array.isArray(field)) {
      for (const entry of field) {
        const normalized = normalizeSubcommandEntry(entry, name);
        if (normalized) subcommandsMerged.push(normalized);
      }
    }
  }

  if (doc?.options) {
    for (const entry of extractSubcommandsFromOptions(name, doc.options)) {
      const normalized = normalizeSubcommandEntry(entry, name);
      if (normalized) subcommandsMerged.push(normalized);
    }
  }

  const byKey = new Map();
  for (const sc of subcommandsMerged) {
    const k = sc.fullName;
    const existing = byKey.get(k);
    if (!existing) {
      byKey.set(k, sc);
      continue;
    }
    byKey.set(k, {
      ...existing,
      description: existing.description || sc.description,
    });
  }

  const subcommands = [...byKey.values()].sort((a, b) => a.fullName.localeCompare(b.fullName));

  const mapped = {
    name,
    description,
    category,
    usage,
    aliases,
    subcommands: subcommands.length ? subcommands : undefined,
  };

  const type = inferType(doc, mapped);
  return {
    ...mapped,
    type,
  };
}

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Access logs for every API request.
app.use((req, res, next) => {
  const started = Date.now();
  res.on('finish', () => {
    logger.http(req, res, Date.now() - started);
  });
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mongo: 'unknown' });
});

app.get('/api/stats', async (_req, res) => {
  try {
    const headers = { Accept: 'application/json' };
    if (BOT_API_SECRET) headers['x-bot-secret'] = BOT_API_SECRET;
    const r = await fetch(`${BOT_API_URL}/api/guilds`, { headers, signal: AbortSignal.timeout(4000) });
    if (!r.ok) throw new Error(`status ${r.status}`);
    const data = await r.json();
    return res.json({ guildCount: data.count ?? 0, source: 'bot' });
  } catch {
    // Fallback: consultar la API de Discord directamente con el bot token si está disponible
    const botToken = (process.env.BOT_TOKEN ?? '').trim();
    if (botToken) {
      try {
        const r = await fetch('https://discord.com/api/v10/users/@me/guilds?with_counts=true', {
          headers: { Authorization: `Bot ${botToken}` },
          signal: AbortSignal.timeout(5000),
        });
        if (r.ok) {
          // Este endpoint está limitado a 200 guilds por página; devolvemos lo que tengamos
          const guilds = await r.json();
          return res.json({ guildCount: Array.isArray(guilds) ? guilds.length : 0, source: 'discord' });
        }
      } catch { /* ignorar */ }
    }
    return res.json({ guildCount: 0, source: 'unavailable' });
  }
});

app.get('/admin/logs', (req, res) => {
  if (LOGS_DASHBOARD_KEY) {
    const provided = String(req.query.key ?? '').trim();
    if (provided !== LOGS_DASHBOARD_KEY) {
      return res.status(401).send('Unauthorized');
    }
  }

  const entries = logger.getRecentEntries(250);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(renderLogsDashboard(entries));
});

app.get('/api/health/mongo', async (_req, res) => {
  try {
    if (!connectPromise) connectPromise = client.connect();
    await connectPromise;
    const db = DB_OVERRIDE ? client.db(DB_OVERRIDE) : client.db();
    await db.command({ ping: 1 });
    res.json({ ok: true, mongo: 'ok' });
  } catch (err) {
    logger.error('health_mongo_failed', { error: err?.message ?? String(err) });
    res.status(503).json({ ok: false, mongo: 'down' });
  }
});

app.get('/api/guilds', async (_req, res) => {
  try {
    const headers = { Accept: 'application/json' };
    if (BOT_API_SECRET) headers['x-bot-secret'] = BOT_API_SECRET;
    const r = await fetch(`${BOT_API_URL}/api/guilds`, {
      headers,
      signal: AbortSignal.timeout(5000),
    });

    if (!r.ok) {
      throw new Error(`Bot API responded ${r.status}`);
    }

    const data = await r.json();
    const items = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data)
        ? data
        : [];

    const normalized = items
      .map((g) => ({
        id: String(g?.id ?? ''),
        name: String(g?.name ?? ''),
        memberCount: Number(g?.memberCount ?? 0),
        icon: g?.icon ?? null,
        iconUrl: g?.iconUrl ?? null,
      }))
      .filter((g) => g.id && g.name);

    return res.json({
      source: 'bot',
      count: normalized.length,
      items: normalized,
    });
  } catch (err) {
    logger.warn('api_guilds_failed', { error: err?.message ?? String(err) });
    return res.status(503).json({ error: 'No se pudo obtener la lista de servidores del bot.' });
  }
});

app.get('/api/guilds/:guildId/music-panel', async (req, res) => {
  const guildId = String(req.params.guildId ?? '').trim();
  if (!guildId) {
    return res.status(400).json({ error: 'guildId es obligatorio.' });
  }

  try {
    const data = await fetchBotJson(`/api/music-panel?guildId=${encodeURIComponent(guildId)}`, 5000);
    return res.json(data);
  } catch (err) {
    logger.warn('api_music_panel_failed', { guildId, error: err?.message ?? String(err) });
    return res.status(503).json({ error: 'No se pudo obtener el panel de música del bot.' });
  }
});

app.get('/api/guilds/:guildId/module-states', async (req, res) => {
  const guildId = String(req.params.guildId ?? '').trim();
  if (!guildId) {
    return res.status(400).json({ error: 'guildId es obligatorio.' });
  }

  try {
    const data = await fetchBotJson(`/api/guilds/${encodeURIComponent(guildId)}/module-states`, 5000);
    return res.json(data);
  } catch (err) {
    logger.warn('api_module_states_failed', { guildId, error: err?.message ?? String(err) });
    return res.status(503).json({ error: 'No se pudieron obtener los estados de módulos.' });
  }
});

app.put('/api/guilds/:guildId/module-states/:moduleId', async (req, res) => {
  const guildId = String(req.params.guildId ?? '').trim();
  const moduleId = String(req.params.moduleId ?? '').trim();
  const enabled = req.body?.enabled;

  if (!guildId || !moduleId || typeof enabled !== 'boolean') {
    return res.status(400).json({ error: 'guildId, moduleId y enabled son obligatorios.' });
  }

  try {
    const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
    if (BOT_API_SECRET) headers['x-bot-secret'] = BOT_API_SECRET;
    const response = await fetch(`${BOT_API_URL}/api/guilds/${encodeURIComponent(guildId)}/module-states/${encodeURIComponent(moduleId)}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ enabled }),
      signal: AbortSignal.timeout(5000),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.error || `Bot API responded ${response.status}`);
    }

    return res.json(data);
  } catch (err) {
    logger.warn('api_module_toggle_failed', { guildId, moduleId, error: err?.message ?? String(err) });
    return res.status(503).json({ error: 'No se pudo actualizar el estado del módulo.' });
  }
});

app.get('/api/guilds/:guildId/channels', async (req, res) => {
  const guildId = String(req.params.guildId ?? '').trim();
  if (!guildId) return res.status(400).json({ error: 'guildId es obligatorio.' });
  try {
    const headers = { Accept: 'application/json' };
    if (BOT_API_SECRET) headers['x-bot-secret'] = BOT_API_SECRET;
    const response = await fetch(`${BOT_API_URL}/api/guilds/${encodeURIComponent(guildId)}/channels`, {
      headers,
      signal: AbortSignal.timeout(5000),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || `Bot API responded ${response.status}`);
    return res.json(data);
  } catch (err) {
    logger.warn('api_channels_failed', { guildId, error: err?.message ?? String(err) });
    return res.status(503).json({ error: 'No se pudieron obtener los canales.' });
  }
});

app.get('/api/guilds/:guildId/roles', async (req, res) => {
  const guildId = String(req.params.guildId ?? '').trim();
  if (!guildId) return res.status(400).json({ error: 'guildId es obligatorio.' });
  try {
    const headers = { Accept: 'application/json' };
    if (BOT_API_SECRET) headers['x-bot-secret'] = BOT_API_SECRET;
    const response = await fetch(`${BOT_API_URL}/api/guilds/${encodeURIComponent(guildId)}/roles`, {
      headers,
      signal: AbortSignal.timeout(5000),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || `Bot API responded ${response.status}`);
    return res.json(data);
  } catch (err) {
    logger.warn('api_roles_failed', { guildId, error: err?.message ?? String(err) });
    return res.status(503).json({ error: 'No se pudieron obtener los roles.' });
  }
});

app.get('/api/guilds/:guildId/members', async (req, res) => {
  const guildId = String(req.params.guildId ?? '').trim();
  if (!guildId) return res.status(400).json({ error: 'guildId es obligatorio.' });
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  try {
    const headers = { Accept: 'application/json' };
    if (BOT_API_SECRET) headers['x-bot-secret'] = BOT_API_SECRET;
    const response = await fetch(`${BOT_API_URL}/api/guilds/${encodeURIComponent(guildId)}/members?limit=${limit}`, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || `Bot API responded ${response.status}`);
    return res.json(data);
  } catch (err) {
    logger.warn('api_members_failed', { guildId, error: err?.message ?? String(err) });
    return res.status(503).json({ error: 'No se pudieron obtener los miembros.' });
  }
});

app.put('/api/guilds/:guildId/moderation-settings', async (req, res) => {
  const guildId = String(req.params.guildId ?? '').trim();
  if (!guildId) return res.status(400).json({ error: 'guildId es obligatorio.' });
  try {
    const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
    if (BOT_API_SECRET) headers['x-bot-secret'] = BOT_API_SECRET;
    const response = await fetch(`${BOT_API_URL}/api/guilds/${encodeURIComponent(guildId)}/moderation-settings`, {
      method: 'PUT', headers, body: JSON.stringify(req.body ?? {}), signal: AbortSignal.timeout(5000),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || `Bot API responded ${response.status}`);
    return res.json(data);
  } catch (err) {
    logger.warn('api_moderation_settings_failed', { guildId, error: err?.message ?? String(err) });
    return res.status(503).json({ error: 'No se pudieron guardar los ajustes de moderación.' });
  }
});

app.put('/api/guilds/:guildId/streaming-settings', async (req, res) => {
  const guildId = String(req.params.guildId ?? '').trim();
  if (!guildId) return res.status(400).json({ error: 'guildId es obligatorio.' });
  try {
    const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
    if (BOT_API_SECRET) headers['x-bot-secret'] = BOT_API_SECRET;
    const response = await fetch(`${BOT_API_URL}/api/guilds/${encodeURIComponent(guildId)}/streaming-settings`, {
      method: 'PUT', headers, body: JSON.stringify(req.body ?? {}), signal: AbortSignal.timeout(5000),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || `Bot API responded ${response.status}`);
    return res.json(data);
  } catch (err) {
    logger.warn('api_streaming_settings_failed', { guildId, error: err?.message ?? String(err) });
    return res.status(503).json({ error: 'No se pudieron guardar los ajustes de streaming.' });
  }
});

app.get('/api/guilds/:guildId/marriage-settings', async (req, res) => {
  const guildId = String(req.params.guildId ?? '').trim();
  if (!guildId) return res.status(400).json({ error: 'guildId es obligatorio.' });

  try {
    const headers = { Accept: 'application/json' };
    if (BOT_API_SECRET) headers['x-bot-secret'] = BOT_API_SECRET;
    const response = await fetch(`${BOT_API_URL}/api/guilds/${encodeURIComponent(guildId)}/marriage-settings`, {
      headers,
      signal: AbortSignal.timeout(5000),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || `Bot API responded ${response.status}`);
    return res.json(data);
  } catch (err) {
    logger.warn('api_marriage_settings_get_failed', { guildId, error: err?.message ?? String(err) });
    return res.status(503).json({ error: 'No se pudieron obtener los ajustes de matrimonio.' });
  }
});

app.put('/api/guilds/:guildId/marriage-settings', async (req, res) => {
  const guildId = String(req.params.guildId ?? '').trim();
  const payload = req.body ?? {};

  if (!guildId) return res.status(400).json({ error: 'guildId es obligatorio.' });

  try {
    const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
    if (BOT_API_SECRET) headers['x-bot-secret'] = BOT_API_SECRET;
    const response = await fetch(`${BOT_API_URL}/api/guilds/${encodeURIComponent(guildId)}/marriage-settings`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || `Bot API responded ${response.status}`);
    return res.json(data);
  } catch (err) {
    logger.warn('api_marriage_settings_failed', { guildId, error: err?.message ?? String(err) });
    return res.status(503).json({ error: 'No se pudieron guardar los ajustes de matrimonio.' });
  }
});

app.get('/api/guilds/:guildId/economy-settings', async (req, res) => {
  const guildId = String(req.params.guildId ?? '').trim();
  if (!guildId) return res.status(400).json({ error: 'guildId es obligatorio.' });

  try {
    const headers = { Accept: 'application/json' };
    if (BOT_API_SECRET) headers['x-bot-secret'] = BOT_API_SECRET;
    const response = await fetch(`${BOT_API_URL}/api/guilds/${encodeURIComponent(guildId)}/economy-settings`, {
      headers,
      signal: AbortSignal.timeout(5000),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || `Bot API responded ${response.status}`);
    return res.json(data);
  } catch (err) {
    logger.warn('api_economy_settings_get_failed', { guildId, error: err?.message ?? String(err) });
    return res.status(503).json({ error: 'No se pudieron cargar los ajustes de economía.' });
  }
});

app.put('/api/guilds/:guildId/economy-settings', async (req, res) => {
  const guildId = String(req.params.guildId ?? '').trim();
  const payload = req.body ?? {};

  if (!guildId) {
    return res.status(400).json({ error: 'guildId es obligatorio.' });
  }
  if (
    typeof payload.enabled !== 'boolean' &&
    !('channelId' in payload) &&
    typeof payload.exclusive !== 'boolean'
  ) {
    return res.status(400).json({ error: 'Se requiere al menos un campo: enabled, channelId o exclusive.' });
  }

  try {
    const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
    if (BOT_API_SECRET) headers['x-bot-secret'] = BOT_API_SECRET;
    const response = await fetch(`${BOT_API_URL}/api/guilds/${encodeURIComponent(guildId)}/economy-settings`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.error || `Bot API responded ${response.status}`);
    }
    return res.json(data);
  } catch (err) {
    logger.warn('api_economy_settings_failed', { guildId, error: err?.message ?? String(err) });
    return res.status(503).json({ error: 'No se pudieron guardar los ajustes de economía.' });
  }
});

app.get('/api/modules', async (_req, res) => {
  // 1) Intentar obtener lista de módulos directamente del bot
  try {
    const headers = { Accept: 'application/json' };
    if (BOT_API_SECRET) headers['x-bot-secret'] = BOT_API_SECRET;
    const r = await fetch(`${BOT_API_URL}/api/modules`, { headers, signal: AbortSignal.timeout(4000) });
    if (!r.ok) throw new Error(`Bot API responded ${r.status}`);
    const data = await r.json();
    const rawItems = Array.isArray(data?.items) ? data.items : [];
    const seen = new Set();
    const items = [];
    for (const item of rawItems) {
      const rawId = item?.id ?? item?.name ?? item?.module ?? item?.key;
      const id = normalizeModuleId(rawId);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      items.push({
        id,
        rawId: String(rawId ?? id),
        name: typeof item?.name === 'string' ? item.name : undefined,
        description: typeof item?.description === 'string' ? item.description : undefined,
        icon: typeof item?.icon === 'string' ? item.icon : undefined,
        configColor: typeof item?.configColor === 'string' ? item.configColor : undefined,
        dashboardColor: typeof item?.dashboardColor === 'string' ? item.dashboardColor : undefined,
      });
    }
    return res.json({ source: 'bot', items });
  } catch (botErr) {
    logger.warn('bot_modules_unavailable_fallback_commands', { error: botErr?.message ?? String(botErr) });
  }

  // 2) Fallback: derivar módulos únicos de las categorías de los comandos
  try {
    const data = await fetchBotCommands();
    const items = data.items ?? [];
    const seen = new Set();
    const modules = [];
    for (const cmd of items) {
      const cat = (cmd.category ?? '').trim();
      const id = normalizeModuleId(cat);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      modules.push({ id, rawId: cat || id });
    }
    return res.json({ source: 'derived', items: modules });
  } catch (err) {
    logger.error('api_modules_failed', { error: err?.message ?? String(err) });
    return res.status(503).json({ error: 'No se pudo obtener la lista de módulos del bot.' });
  }
});

app.get('/api/commands', async (req, res) => {
  // 1) Intentar obtener desde la API interna del bot
  try {
    const data = await fetchBotCommands();
    return res.json(data);
  } catch (botErr) {
    logger.warn('bot_api_unavailable_fallback_mongo', { error: botErr?.message ?? String(botErr) });
  }

  // 2) Fallback a MongoDB
  if (!MONGODB_URI) {
    return res.status(503).json({ error: 'Bot API no disponible y MongoDB no configurado.' });
  }

  try {
    const commands = await getCommandsCollection();

    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const category =
      typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const limit = clampInt(req.query.limit, {
      min: 1,
      max: 5000,
      fallback: 1000,
    });

    const filter = {};
    if (category) filter.category = category;
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ name: rx }, { description: rx }, { usage: rx }, { aliases: rx }];
    }

    const projection = {
      name: 1, description: 1, category: 1, usage: 1, aliases: 1,
      type: 1, kind: 1, slash: 1, isSlash: 1, isSlashCommand: 1, is_slash: 1,
      commandType: 1, subcommands: 1, subCommands: 1, subcommand: 1,
      subCommand: 1, sub: 1, options: 1,
    };

    const docs = await commands.find(filter, { projection }).sort({ name: 1 }).limit(limit).toArray();
    const items = docs.map(mapCommandDoc).filter(Boolean);

    res.json({
      generatedAt: new Date().toISOString(),
      count: items.length,
      countPrefix: items.filter((c) => c.type === 'prefix').length,
      countSlash: items.filter((c) => c.type === 'slash').length,
      items,
    });
  } catch (err) {
    logger.error('api_commands_failed', { error: err?.message ?? String(err) });
  }

  // 3) Fallback a commands.json estático
  try {
    const data = loadStaticCommands();
    logger.info('api_commands_static_fallback');
    return res.json(data);
  } catch (staticErr) {
    logger.error('api_commands_static_failed', { error: staticErr?.message ?? String(staticErr) });
  }

  res.status(503).json({ error: 'No se pudieron cargar los comandos.' });
});

app.get('/api/commands/:name', async (req, res) => {
  try {
    const commands = await getCommandsCollection();

    const name = String(req.params.name ?? '').trim();
    if (!name) return res.status(400).json({ error: 'Missing command name' });

    const projection = {
      name: 1,
      description: 1,
      category: 1,
      usage: 1,
      aliases: 1,
      type: 1,
      kind: 1,
      slash: 1,
      isSlash: 1,
      isSlashCommand: 1,
      is_slash: 1,
      commandType: 1,
      subcommands: 1,
      subCommands: 1,
      subcommand: 1,
      subCommand: 1,
      sub: 1,
      options: 1,
    };

    // Intentar primero la API del bot
    try {
      const data = await fetchBotCommands();
      const item = (data.items ?? []).find((c) => c.name === name);
      if (item) return res.json({ item });
      return res.status(404).json({ error: 'Command not found' });
    } catch { /* fallback a mongo */ }

    if (!MONGODB_URI) return res.status(503).json({ error: 'Bot API no disponible y MongoDB no configurado.' });

    const doc = await commands.findOne({ name }, { projection });
    if (!doc) return res.status(404).json({ error: 'Command not found' });

    const item = mapCommandDoc(doc);
    if (!item) return res.status(404).json({ error: 'Command not found' });

    res.json({ item });
  } catch (err) {
    logger.error('api_command_by_name_failed', {
      error: err?.message ?? String(err),
      commandName: req.params?.name,
    });
    res.status(503).json({ error: 'Failed to load command (mongo unavailable)' });
  }
});

// ─── Discord OAuth2 Auth ───────────────────────────────────────────────────────

// Helper: fetch bot guild IDs
async function fetchBotGuildIds() {
  try {
    const headers = { Accept: 'application/json' };
    if (BOT_API_SECRET) headers['x-bot-secret'] = BOT_API_SECRET;
    const res = await fetch(`${BOT_API_URL}/api/guilds`, {
      headers,
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return new Set();
    const data = await res.json();
    const ids = Array.isArray(data.items)
      ? data.items.map((g) => (typeof g === 'string' ? g : String(g.id ?? '')))
      : Array.isArray(data)
        ? data.map((g) => (typeof g === 'string' ? g : String(g.id ?? '')))
        : [];
    return new Set(ids.filter(Boolean));
  } catch {
    return new Set();
  }
}

function mapUserGuilds(rawGuilds, botGuildIds) {
  const MANAGE_GUILD = BigInt(0x20);
  const ADMINISTRATOR = BigInt(0x8);
  return (Array.isArray(rawGuilds) ? rawGuilds : [])
    .filter((g) => {
      const perms = BigInt(g.permissions ?? 0);
      return (perms & MANAGE_GUILD) === MANAGE_GUILD || (perms & ADMINISTRATOR) === ADMINISTRATOR;
    })
    .map((g) => ({
      id: String(g.id ?? ''),
      name: String(g.name ?? ''),
      icon: g.icon ?? null,
      hasBot: botGuildIds.has(String(g.id ?? '')),
    }))
    .sort((a, b) => Number(b.hasBot) - Number(a.hasBot));
}

// POST /api/auth/callback — intercambia code por token + datos del usuario
app.post('/api/auth/callback', async (req, res) => {
  const code = String(req.body?.code ?? '').trim();
  if (!code) return res.status(400).json({ error: 'Missing code' });

  if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !DISCORD_REDIRECT_URI) {
    logger.warn('auth_callback_not_configured');
    return res.status(500).json({ error: 'OAuth no configurado en el servidor. Agrega DISCORD_CLIENT_SECRET y DISCORD_REDIRECT_URI al .env.local' });
  }

  try {
    // 1) Intercambiar code por access_token
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }).toString(),
      signal: AbortSignal.timeout(8000),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      logger.warn('auth_token_exchange_failed', { status: tokenRes.status, body: errBody.slice(0, 200) });
      return res.status(400).json({ error: 'Token exchange failed' });
    }

    const tokenData = await tokenRes.json();
    const accessToken = String(tokenData.access_token ?? '');
    if (!accessToken) return res.status(400).json({ error: 'No access_token received' });

    // 2) Obtener datos del usuario y sus servidores en paralelo
    const [userRes, guildsRes, botGuildIds] = await Promise.all([
      fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(6000),
      }),
      fetch('https://discord.com/api/users/@me/guilds', {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(6000),
      }),
      fetchBotGuildIds(),
    ]);

    if (!userRes.ok) return res.status(401).json({ error: 'Could not fetch user' });

    const userRaw = await userRes.json();
    const rawGuilds = guildsRes.ok ? await guildsRes.json() : [];

    const user = {
      id: String(userRaw.id ?? ''),
      username: String(userRaw.username ?? ''),
      discriminator: String(userRaw.discriminator ?? ''),
      avatar: userRaw.avatar ?? null,
      globalName: userRaw.global_name ?? null,
    };

    const guilds = mapUserGuilds(rawGuilds, botGuildIds);

    logger.info('auth_login', { userId: user.id, username: user.username, guilds: guilds.length });
    return res.json({ accessToken, user, guilds });
  } catch (err) {
    logger.error('auth_callback_error', { error: err?.message ?? String(err) });
    return res.status(500).json({ error: 'Internal error during OAuth flow' });
  }
});

// GET /api/auth/guilds — refresca la lista de servidores
app.get('/api/auth/guilds', async (req, res) => {
  const token = String(req.headers.authorization ?? '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const [guildsRes, botGuildIds] = await Promise.all([
      fetch('https://discord.com/api/users/@me/guilds', {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(6000),
      }),
      fetchBotGuildIds(),
    ]);

    if (!guildsRes.ok) return res.status(401).json({ error: 'Invalid or expired token' });

    const rawGuilds = await guildsRes.json();
    const guilds = mapUserGuilds(rawGuilds, botGuildIds);
    return res.json({ guilds });
  } catch (err) {
    logger.error('auth_guilds_error', { error: err?.message ?? String(err) });
    return res.status(500).json({ error: 'Internal error fetching guilds' });
  }
});

app.get('/api/playground/preview', async (req, res) => {
  try {
    const jobs = await getPlaygroundJobsCollection();

    const dedupeKey = typeof req.query.dedupeKey === 'string' ? req.query.dedupeKey.trim() : '';
    if (dedupeKey) {
      const byKey = await jobs.findOne({ dedupeKey });
      if (byKey && byKey.status === 'completed') {
        const mapped = mapPlaygroundJobFromQueueDoc(byKey, { input: dedupeKey, parsed: parsePlaygroundInput('') });
        if (mapped) return res.json({ ok: true, matched: true, input: dedupeKey, job: mapped });
      }
      if (byKey) {
        return res.json({ ok: true, matched: false, input: dedupeKey, status: byKey.status ?? 'unknown' });
      }
      return res.json({ ok: true, matched: false, input: dedupeKey });
    }

    const input = typeof req.query.input === 'string' ? req.query.input : '';
    const parsed = parsePlaygroundInput(input);
    if (!parsed.cleaned || !parsed.base) {
      return res.json({ ok: true, matched: false, input: parsed.raw });
    }

    const looksPrefix = parsed.looksPrefix;
    const looksSlash = parsed.looksSlash;
    const preferredTypes = looksPrefix
      ? ['prefix', 'slash']
      : looksSlash
        ? ['slash', 'prefix']
        : ['slash', 'prefix'];

    const explicitJobId = typeof req.query.jobId === 'string' ? req.query.jobId.trim() : '';
    if (explicitJobId && ObjectId.isValid(explicitJobId)) {
      const byId = await jobs.findOne({ _id: new ObjectId(explicitJobId) });
      if (byId && byId.status === 'completed') {
        const mapped = mapPlaygroundJobFromQueueDoc(byId, { input: parsed.raw, parsed });
        if (mapped) return res.json({ ok: true, matched: true, input: parsed.raw, job: mapped });
      }
      if (byId) {
        return res.json({ ok: true, matched: false, pending: true, input: parsed.raw, jobId: explicitJobId, status: byId.status ?? 'unknown' });
      }
    }

    // 1) Try to find a completed job in playground_jobs (queue schema).
    for (const commandType of preferredTypes) {
      const rxName = new RegExp(`^${escapeRegex(parsed.base)}$`, 'i');
      const rxFull = parsed.fullName ? new RegExp(`^${escapeRegex(parsed.fullName)}$`, 'i') : null;
      const rxRaw = parsed.cleaned ? new RegExp(`^${escapeRegex(parsed.cleaned)}$`, 'i') : null;
      const doc = await jobs
        .find({
          type: { $in: ['playground:commandPreview', 'playground:commandRun'] },
          status: 'completed',
          $or: [
            { 'payload.name': rxName },
            ...(rxFull ? [{ 'payload.name': rxFull }] : []),
            ...(rxRaw ? [{ 'payload.name': rxRaw }] : []),
            { 'result.name': rxName },
            { 'result.command.name': rxName },
            ...(rxFull ? [{ 'result.command.name': rxFull }] : []),
            { 'result.command.aliases': rxName },
          ],
          $and: [
            {
              $or: [
                { 'payload.commandType': commandType },
                { 'result.commandType': commandType },
                { 'payload.commandType': { $exists: false } },
              ],
            },
          ],
        })
        .sort({ completedAt: -1, updatedAt: -1 })
        .limit(1)
        .next();

      if (doc) {
        const mapped = mapPlaygroundJobFromQueueDoc(doc, { input: parsed.raw, parsed });
        if (mapped) return res.json({ ok: true, matched: true, input: parsed.raw, job: mapped });
      }
    }

    // 2) Fallback to previous "direct preview" schema, if present.
    const rxBase = new RegExp(escapeRegex(parsed.base), 'i');
    const legacyCandidates = await jobs
      .find({
        $or: [
          { command: rxBase },
          { commandName: rxBase },
          { base: rxBase },
          { name: rxBase },
          { trigger: rxBase },
          { key: rxBase },
          { match: rxBase },
          { triggers: rxBase },
        ],
      })
      .limit(20)
      .toArray();

    if (legacyCandidates.length) {
      let bestDoc;
      let bestScore = -1;
      for (const doc of legacyCandidates) {
        const score = scorePlaygroundJob(doc, parsed);
        if (score > bestScore) {
          bestScore = score;
          bestDoc = doc;
        }
      }

      if (bestDoc && bestScore > 0) {
        const legacy = mapPlaygroundJob(bestDoc);
        if (legacy) return res.json({ ok: true, matched: true, input: parsed.raw, job: legacy });
      }
    }

    // 3) Optionally enqueue a job so an external worker can compute the preview.
    const autoCreate = String(req.query.autoCreate ?? '').trim() === '1';
    if (autoCreate) {
      const commandType = preferredTypes[0];

      const recent = await jobs
        .find({
          type: 'playground:commandPreview',
          status: { $ne: 'completed' },
          'payload.name': parsed.base,
          'payload.commandType': commandType,
          createdAt: { $gte: new Date(Date.now() - 2 * 60 * 1000) },
        })
        .sort({ createdAt: -1 })
        .limit(1)
        .next();

      if (recent && recent._id) {
        return res.json({
          ok: true,
          matched: false,
          pending: true,
          input: parsed.raw,
          jobId: recent._id.toString(),
          status: recent.status ?? 'queued',
        });
      }

      const botId = typeof process.env.PLAYGROUND_BOT_ID === 'string' ? process.env.PLAYGROUND_BOT_ID.trim() : undefined;
      const now = new Date();
      const insert = await jobs.insertOne({
        botId: botId || undefined,
        type: 'playground:commandPreview',
        payload: {
          name: parsed.base,
          commandType,
          botId: botId || undefined,
        },
        status: 'queued',
        priority: 0,
        runAt: now,
        attempts: 0,
        maxAttempts: 3,
        createdAt: now,
        updatedAt: now,
      });

      return res.json({
        ok: true,
        matched: false,
        pending: true,
        input: parsed.raw,
        jobId: insert.insertedId.toString(),
        status: 'queued',
      });
    }

    return res.json({ ok: true, matched: false, input: parsed.raw });
  } catch (err) {
    logger.error('api_playground_preview_failed', { error: err?.message ?? String(err) });
    res.status(503).json({ ok: false, error: 'Failed to load playground preview (mongo unavailable)' });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '..', 'dist');
const STATIC_COMMANDS_PATH = path.resolve(__dirname, '..', 'public', 'commands.json');

function loadStaticCommands() {
  const raw = fs.readFileSync(STATIC_COMMANDS_PATH, 'utf8');
  return JSON.parse(raw);
}

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const server = app.listen(PORT, () => {
  logger.info(`API listening on http://localhost:${PORT}`);
});

async function shutdown(signal) {
  try {
    logger.info(`Received ${signal}, shutting down...`);
    server.close(() => {
      // noop
    });
    await client.close();
    process.exit(0);
  } catch {
    process.exit(1);
  }
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
