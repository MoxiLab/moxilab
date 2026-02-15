import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import { MongoClient } from 'mongodb';

// Load env (prefer .env.local)
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_OVERRIDE = process.env.MONGODB_DB;
const COMMANDS_COLLECTION = process.env.MONGODB_COMMANDS_COLLECTION ?? 'commands';

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI. Set it in .env.local');
  process.exit(1);
}

const client = new MongoClient(MONGODB_URI, {
  maxPoolSize: 5,
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
});

function safeString(value) {
  return typeof value === 'string' ? value : undefined;
}

function safeStringArray(value) {
  if (!Array.isArray(value)) return undefined;
  const arr = value.filter((v) => typeof v === 'string');
  return arr.length ? arr : undefined;
}

function inferType(doc, mapped) {
  // Try explicit fields first.
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

  // Fallback heuristic: prefix commands often have aliases or explicit usage.
  if (Array.isArray(mapped?.aliases) && mapped.aliases.length > 0) return 'prefix';
  if (typeof mapped?.usage === 'string' && mapped.usage.trim()) return 'prefix';

  return 'slash';
}

function normalizeSubcommandEntry(entry) {
  if (!entry || typeof entry !== 'object') return undefined;
  const name = typeof entry.name === 'string' ? entry.name.trim() : '';
  if (!name) return undefined;
  const group = typeof entry.group === 'string' ? entry.group.trim() : undefined;
  const description =
    typeof entry.description === 'string' ? entry.description.trim() : undefined;
  const usage = typeof entry.usage === 'string' ? entry.usage.trim() : undefined;
  const fullName =
    typeof entry.fullName === 'string' ? entry.fullName.trim() : undefined;

  return {
    name,
    group,
    description: description && !isBadDescription(description) ? description : undefined,
    usage: usage || undefined,
    fullName: fullName || undefined,
  };
}

function mergeSubcommands(a, b) {
  const arrA = Array.isArray(a) ? a : [];
  const arrB = Array.isArray(b) ? b : [];
  const merged = [...arrA, ...arrB]
    .map(normalizeSubcommandEntry)
    .filter(Boolean);

  const byKey = new Map();
  for (const sc of merged) {
    const k = sc.fullName || `${sc.group ?? ''}:${sc.name}`;
    const existing = byKey.get(k);
    if (!existing) {
      byKey.set(k, sc);
      continue;
    }
    byKey.set(k, {
      ...existing,
      description: mergeString(existing.description, sc.description, {
        rejectBad: true,
      }),
      usage: mergeString(existing.usage, sc.usage),
      group: mergeString(existing.group, sc.group),
      fullName: mergeString(existing.fullName, sc.fullName),
    });
  }

  return [...byKey.values()];
}

function extractSubcommandsFromOptions(baseName, options) {
  if (!Array.isArray(options)) return undefined;
  const out = [];
  for (const opt of options) {
    if (!opt || typeof opt !== 'object') continue;
    const type = opt.type;
    const name = typeof opt.name === 'string' ? opt.name.trim() : '';
    const desc = typeof opt.description === 'string' ? opt.description.trim() : undefined;

    // 1 = subcommand
    if (type === 1 && name) {
      out.push({
        name,
        description: desc,
        fullName: `${baseName} ${name}`,
      });
      continue;
    }

    // 2 = subcommand group
    if (type === 2 && name && Array.isArray(opt.options)) {
      for (const sub of opt.options) {
        if (!sub || typeof sub !== 'object') continue;
        if (sub.type !== 1) continue;
        const subName = typeof sub.name === 'string' ? sub.name.trim() : '';
        if (!subName) continue;
        const subDesc =
          typeof sub.description === 'string' ? sub.description.trim() : undefined;
        out.push({
          name: subName,
          group: name,
          description: subDesc,
          fullName: `${baseName} ${name} ${subName}`,
        });
      }
    }
  }

  return out.length ? out : undefined;
}

function inferSlashSubPath(doc, baseName) {
  const group =
    typeof doc?.subcommandGroup === 'string'
      ? doc.subcommandGroup
      : typeof doc?.group === 'string'
        ? doc.group
        : typeof doc?.subGroup === 'string'
          ? doc.subGroup
          : undefined;

  const sub =
    typeof doc?.subcommand === 'string'
      ? doc.subcommand
      : typeof doc?.subCommand === 'string'
        ? doc.subCommand
        : typeof doc?.sub === 'string'
          ? doc.sub
          : typeof doc?.sub_name === 'string'
            ? doc.sub_name
            : undefined;

  if (group && sub) return [String(group).trim(), String(sub).trim()].filter(Boolean);
  if (sub) return [String(sub).trim()].filter(Boolean);

  const pathArr = Array.isArray(doc?.path) ? doc.path : undefined;
  if (pathArr && pathArr.length >= 2) {
    const parts = pathArr.map((p) => (typeof p === 'string' ? p.trim() : '')).filter(Boolean);
    // If path includes base name, remove it
    if (parts[0] === baseName) return parts.slice(1);
    if (parts.length > 1) return parts;
  }

  const fullName =
    typeof doc?.fullName === 'string'
      ? doc.fullName
      : typeof doc?.full_name === 'string'
        ? doc.full_name
        : undefined;
  if (fullName) {
    const parts = fullName
      .split(/\s+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts[0] === baseName) return parts.slice(1);
    if (parts.length > 1) return parts;
  }

  return undefined;
}

function isTranslationKeyDescription(description) {
  if (typeof description !== 'string') return false;
  return /^commands:CMD_[A-Z0-9_]+_DESC$/.test(description.trim());
}

function isBadDescription(description) {
  if (typeof description !== 'string') return true;
  const trimmed = description.trim();
  if (!trimmed) return true;
  if (trimmed.toLowerCase() === 'command') return true;
  if (isTranslationKeyDescription(trimmed)) return true;
  return false;
}

function mergeString(preferred, candidate, { rejectBad = false } = {}) {
  const pref = typeof preferred === 'string' ? preferred.trim() : '';
  const cand = typeof candidate === 'string' ? candidate.trim() : '';
  if (rejectBad && isBadDescription(pref)) {
    return cand || undefined;
  }
  if (pref) return pref;
  return cand || undefined;
}

function mergeArrays(a, b) {
  const arrA = Array.isArray(a) ? a : [];
  const arrB = Array.isArray(b) ? b : [];
  const merged = [...arrA, ...arrB].filter((v) => typeof v === 'string');
  const uniq = [...new Set(merged.map((s) => s.trim()).filter(Boolean))];
  return uniq.length ? uniq : undefined;
}

try {
  await client.connect();

  const db = DB_OVERRIDE ? client.db(DB_OVERRIDE) : client.db();
  const col = db.collection(COMMANDS_COLLECTION);

  if (process.env.SYNC_COMMANDS_VERBOSE === '1') {
    const count = await col.countDocuments({});
    console.log(
      `[sync:commands] db=${db.databaseName}, collection=${COMMANDS_COLLECTION}, countDocuments=${count}`
    );
  }

  // Keep the export flexible: include commonly used fields if they exist.
  const projection = {
    name: 1,
    description: 1,
    category: 1,
    usage: 1,
    aliases: 1,
    examples: 1,
    cooldown: 1,
    // common discriminator fields (may or may not exist)
    type: 1,
    kind: 1,
    slash: 1,
    isSlash: 1,
    isSlashCommand: 1,
    is_slash: 1,
    commandType: 1,
    // Possible slash subcommand representations
    subcommand: 1,
    subCommand: 1,
    sub: 1,
    sub_name: 1,
    group: 1,
    subcommandGroup: 1,
    subcommandGroups: 1,
    subcommands: 1,
    subCommands: 1,
    options: 1,
    path: 1,
    fullName: 1,
    full_name: 1,
  };

  const docs = await col.find({}, { projection }).sort({ name: 1 }).toArray();

  if (process.env.SYNC_COMMANDS_VERBOSE === '1') {
    const first = docs[0];
    console.log(
      `[sync:commands] fetched=${docs.length}, sampleNameType=${typeof first?.name}`
    );
  }

  const rawItems = docs.map((d) => {
    const mapped = {
      name: safeString(d.name),
      description: safeString(d.description),
      category: safeString(d.category),
      usage: safeString(d.usage),
      aliases: safeStringArray(d.aliases),
      examples: safeStringArray(d.examples),
      cooldown: typeof d.cooldown === 'number' ? d.cooldown : undefined,
    };

    const type = inferType(d, mapped);

    // Some datasets store slash subcommands as separate documents where `name`
    // contains spaces (e.g. "audit off") or extra path fields.
    // We normalize those docs to the base command so they don't render as
    // standalone commands in the UI.
    let baseNameFromName;
    let subPathFromName;
    if (type === 'slash' && typeof mapped.name === 'string') {
      const rawName = mapped.name.trim();
      if (rawName) {
        const parts = rawName.split(/\s+/).map((p) => p.trim()).filter(Boolean);
        if (parts.length > 1) {
          baseNameFromName = parts[0];
          subPathFromName = parts.slice(1);
        } else {
          baseNameFromName = rawName;
        }
      }
    }

    const originalDescription = mapped.description;
    const originalUsage = mapped.usage;
    const originalAliases = mapped.aliases;

    let subcommands;
    let inferredSubPath;
    if (type === 'slash' && typeof baseNameFromName === 'string' && baseNameFromName.trim()) {
      const baseName = baseNameFromName.trim();
      mapped.name = baseName;

      // Prefer options tree (Discord style)
      subcommands = extractSubcommandsFromOptions(baseName, d.options);

      // Some datasets store each subcommand as its own doc with extra fields
      inferredSubPath = subPathFromName ?? inferSlashSubPath(d, baseName);

      const isSubcommandDoc =
        Array.isArray(subPathFromName) && subPathFromName.length > 0
          ? true
          : Array.isArray(inferredSubPath) && inferredSubPath.length > 0;

      if (isSubcommandDoc) {
        // Prevent a subcommand document from overriding the base command metadata.
        mapped.description = undefined;
        mapped.usage = undefined;
        mapped.aliases = undefined;
        mapped.examples = undefined;
      }

      if (Array.isArray(inferredSubPath) && inferredSubPath.length > 0) {
        const fullName = `${baseName} ${inferredSubPath.join(' ')}`.trim();
        const entry = {
          name: inferredSubPath[inferredSubPath.length - 1],
          group: inferredSubPath.length === 2 ? inferredSubPath[0] : undefined,
          description: originalDescription,
          usage: originalUsage,
          fullName,
        };
        subcommands = mergeSubcommands(subcommands, [entry]);
      }

      // If DB has an explicit subcommands array, include it too.
      if (Array.isArray(d.subcommands) || Array.isArray(d.subCommands)) {
        const arr = Array.isArray(d.subcommands) ? d.subcommands : d.subCommands;
        const entries = (arr ?? [])
          .map((x) => {
            if (typeof x === 'string') {
              const nm = x.trim();
              return nm ? { name: nm, fullName: `${baseName} ${nm}` } : undefined;
            }
            if (x && typeof x === 'object') {
              const nm = typeof x.name === 'string' ? x.name.trim() : '';
              if (!nm) return undefined;
              const grp = typeof x.group === 'string' ? x.group.trim() : undefined;
              const fullName = grp
                ? `${baseName} ${grp} ${nm}`
                : `${baseName} ${nm}`;
              return {
                name: nm,
                group: grp,
                description: typeof x.description === 'string' ? x.description : undefined,
                usage: typeof x.usage === 'string' ? x.usage : undefined,
                fullName,
              };
            }
            return undefined;
          })
          .filter(Boolean);
        subcommands = mergeSubcommands(subcommands, entries);
      }
    }

    return {
      ...mapped,
      type,
      subcommands,
    };
  });

  // Deduplicate by (type, name) and merge fields.
  const byKey = new Map();
  for (const item of rawItems) {
    const name = typeof item.name === 'string' ? item.name.trim() : '';
    if (!name) continue;

    const type = item.type === 'prefix' ? 'prefix' : 'slash';
    const key = `${type}:${name}`;

    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, {
        ...item,
        name,
        type,
        description: item.description,
      });
      continue;
    }

    // Prefer a real description over translation keys / placeholders.
    const mergedDescription = isBadDescription(existing.description)
      ? (item.description ?? existing.description)
      : existing.description;

    byKey.set(key, {
      name,
      type,
      description: isBadDescription(mergedDescription)
        ? mergeString(item.description, existing.description)
        : mergedDescription,
      category: mergeString(existing.category, item.category),
      usage: mergeString(existing.usage, item.usage),
      aliases: mergeArrays(existing.aliases, item.aliases),
      examples: mergeArrays(existing.examples, item.examples),
      subcommands: type === 'slash' ? mergeSubcommands(existing.subcommands, item.subcommands) : undefined,
      cooldown:
        typeof existing.cooldown === 'number'
          ? existing.cooldown
          : typeof item.cooldown === 'number'
            ? item.cooldown
            : undefined,
    });
  }

  const items = [...byKey.values()].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'prefix' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  const countPrefix = items.filter((i) => i.type === 'prefix').length;
  const countSlash = items.filter((i) => i.type === 'slash').length;

  if (process.env.SYNC_COMMANDS_VERBOSE === '1') {
    console.log(
      `[sync:commands] exported=${items.length}, prefix=${countPrefix}, slash=${countSlash}`
    );
    if (items.length === 0 && docs.length > 0) {
      console.log('[sync:commands] sample doc keys:', Object.keys(docs[0]).slice(0, 30));
      console.log('[sync:commands] sample doc.name:', docs[0].name);
    }
  }

  const out = {
    generatedAt: new Date().toISOString(),
    count: items.length,
    countPrefix,
    countSlash,
    items,
  };

  const outPath = path.resolve('public', 'commands.json');
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8');

  console.log(`Wrote ${items.length} commands to ${outPath}`);
} catch (err) {
  console.error('Failed to sync commands from MongoDB');
  console.error(err);
  process.exitCode = 1;
} finally {
  await client.close().catch(() => undefined);
}
