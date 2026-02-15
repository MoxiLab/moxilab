import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient, ObjectId } from 'mongodb';

dotenv.config({ path: fs.existsSync('.env.local') ? '.env.local' : '.env' });

const PORT = Number(process.env.PORT ?? 8787);
const MONGODB_URI = process.env.MONGODB_URI;
const DB_OVERRIDE = process.env.MONGODB_DB;
const COMMANDS_COLLECTION = process.env.MONGODB_COMMANDS_COLLECTION ?? 'commands';
const PLAYGROUND_JOBS_COLLECTION =
  process.env.MONGODB_PLAYGROUND_JOBS_COLLECTION ?? 'playground_jobs';

if (!MONGODB_URI) {
  // Never hardcode or print credentials. Use environment variables.
  console.error('Missing MONGODB_URI env var.');
  process.exit(1);
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
    .trim();
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

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mongo: 'unknown' });
});

app.get('/api/health/mongo', async (_req, res) => {
  try {
    if (!connectPromise) connectPromise = client.connect();
    await connectPromise;
    const db = DB_OVERRIDE ? client.db(DB_OVERRIDE) : client.db();
    await db.command({ ping: 1 });
    res.json({ ok: true, mongo: 'ok' });
  } catch (err) {
    console.error(err);
    res.status(503).json({ ok: false, mongo: 'down' });
  }
});

app.get('/api/commands', async (req, res) => {
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

    if (category) {
      filter.category = category;
    }

    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [
        { name: rx },
        { description: rx },
        { usage: rx },
        { aliases: rx },
      ];
    }

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

    const docs = await commands
      .find(filter, { projection })
      .sort({ name: 1 })
      .limit(limit)
      .toArray();

    const items = docs.map(mapCommandDoc).filter(Boolean);
    const countPrefix = items.filter((c) => c.type === 'prefix').length;
    const countSlash = items.filter((c) => c.type === 'slash').length;

    res.json({
      generatedAt: new Date().toISOString(),
      count: items.length,
      countPrefix,
      countSlash,
      items,
    });
  } catch (err) {
    console.error(err);
    res.status(503).json({ error: 'Failed to load commands (mongo unavailable)' });
  }
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

    const doc = await commands.findOne({ name }, { projection });
    if (!doc) return res.status(404).json({ error: 'Command not found' });

    const item = mapCommandDoc(doc);
    if (!item) return res.status(404).json({ error: 'Command not found' });

    res.json({ item });
  } catch (err) {
    console.error(err);
    res.status(503).json({ error: 'Failed to load command (mongo unavailable)' });
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
    console.error(err);
    res.status(503).json({ ok: false, error: 'Failed to load playground preview (mongo unavailable)' });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '..', 'dist');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const server = app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

async function shutdown(signal) {
  try {
    console.log(`\nReceived ${signal}, shutting down...`);
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
