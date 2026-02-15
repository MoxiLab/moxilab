import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

// Load env (prefer .env.local)
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_OVERRIDE = process.env.MONGODB_DB;
const PLAYGROUND_JOBS_COLLECTION =
  process.env.MONGODB_PLAYGROUND_JOBS_COLLECTION ??
  process.env.MONGODB_PLAYGROUND_JOBS_COLLECTION_NAME ??
  'playground_jobs';

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI. Set it in .env.local');
  process.exit(1);
}

const client = new MongoClient(MONGODB_URI, {
  maxPoolSize: 5,
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
});

function normalizeKey(key) {
  return String(key ?? '').trim();
}

function addKey(map, key) {
  const k = normalizeKey(key);
  if (!k) return;
  map.set(k, (map.get(k) ?? 0) + 1);
}

function addKeysFromObject(map, obj, prefix = '') {
  if (!obj || typeof obj !== 'object') return;
  for (const k of Object.keys(obj)) {
    addKey(map, prefix ? `${prefix}.${k}` : k);
  }
}

function findPathsByKey(obj, keyRx, prefix = '', out = []) {
  if (!obj || typeof obj !== 'object') return out;
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => findPathsByKey(v, keyRx, `${prefix}[${i}]`, out));
    return out;
  }
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (keyRx.test(k)) out.push(path);
    findPathsByKey(v, keyRx, path, out);
  }
  return out;
}

function truncate(value, max = 80) {
  const s = String(value ?? '');
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
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

try {
  await client.connect();

  const db = DB_OVERRIDE ? client.db(DB_OVERRIDE) : client.db();
  const col = db.collection(PLAYGROUND_JOBS_COLLECTION);

  const count = await col.countDocuments({});
  console.log(
    `[inspect:playground_jobs] db=${db.databaseName}, collection=${PLAYGROUND_JOBS_COLLECTION}, countDocuments=${count}`
  );

  const docs = await col
    .find({}, { projection: { _id: 1 } })
    .limit(1)
    .toArray();

  if (!count) {
    console.log('[inspect:playground_jobs] Collection is empty.');
    process.exit(0);
  }

  const sample = await col.find({}).limit(30).toArray();

  const topLevelKeys = new Map();
  const payloadKeys = new Map();
  const resultKeys = new Map();

  for (const doc of sample) {
    if (doc && typeof doc === 'object') {
      for (const k of Object.keys(doc)) addKey(topLevelKeys, k);

      addKeysFromObject(payloadKeys, doc.payload);
      addKeysFromObject(resultKeys, doc.result);
    }
  }

  function top(map, n = 25) {
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
  }

  console.log('\nTop-level keys (sample):');
  console.log(JSON.stringify(top(topLevelKeys), null, 2));

  if (payloadKeys.size) {
    console.log('\npayload.* keys (sample):');
    console.log(JSON.stringify(top(payloadKeys), null, 2));
  }

  if (resultKeys.size) {
    console.log('\nresult.* keys (sample):');
    console.log(JSON.stringify(top(resultKeys), null, 2));
  }

  console.log('\nExample triggers (up to 10 docs):');
  for (const doc of sample.slice(0, 10)) {
    const id = typeof doc._id?.toString === 'function' ? doc._id.toString() : '(no id)';

    const payload = doc.payload && typeof doc.payload === 'object' ? doc.payload : undefined;
    const result = doc.result && typeof doc.result === 'object' ? doc.result : undefined;

    const payloadName = pickFirstString(payload?.name);
    const payloadCommandType = pickFirstString(payload?.commandType);
    const resultCommand = result?.command && typeof result.command === 'object' ? result.command : undefined;
    const resultCommandName = pickFirstString(resultCommand?.name, resultCommand?.command, result?.commandName);
    const resultKind = pickFirstString(result?.kind);
    const resultCommandType = pickFirstString(result?.commandType);

    const trigger = pickFirstString(
      doc.trigger,
      doc.key,
      doc.match,
      doc.fullName,
      doc.name,
      doc.command,
      doc.commandName,
      payload?.trigger,
      payload?.key,
      payload?.match,
      payload?.fullName,
      payload?.name,
      payload?.command,
      payload?.commandName,
      payload?.input
    );
    const triggersArr = Array.isArray(payload?.triggers)
      ? payload.triggers.filter((t) => typeof t === 'string').slice(0, 3)
      : Array.isArray(doc.triggers)
        ? doc.triggers.filter((t) => typeof t === 'string').slice(0, 3)
        : [];

    const command = pickFirstString(
      doc.command,
      doc.commandName,
      doc.base,
      doc.cmd,
      payload?.command,
      payload?.commandName,
      payload?.base,
      payload?.cmd
    );
    const sub = pickFirstString(
      doc.subcommand,
      doc.subCommand,
      doc.sub,
      doc.subName,
      payload?.subcommand,
      payload?.subCommand,
      payload?.sub,
      payload?.subName
    );
    const fullName = pickFirstString(
      doc.fullName,
      doc.full_name,
      doc.commandFullName,
      payload?.fullName,
      payload?.full_name,
      payload?.commandFullName
    );

    const subcommandsArr = Array.isArray(result?.subcommands) ? result.subcommands : undefined;
    const firstSub = subcommandsArr && subcommandsArr[0] && typeof subcommandsArr[0] === 'object' ? subcommandsArr[0] : undefined;

    const payloadPaths = findPathsByKey(payload, /component|components|ui|v2/i);
    const resultPaths = findPathsByKey(result, /component|components|ui|v2/i);

    console.log(
      JSON.stringify(
        {
          _id: id,
          type: doc.type,
          status: doc.status,
          trigger: trigger ? truncate(trigger) : undefined,
          triggers: triggersArr.length ? triggersArr.map((t) => truncate(t)) : undefined,
          command: command ? truncate(command) : undefined,
          sub: sub ? truncate(sub) : undefined,
          fullName: fullName ? truncate(fullName) : undefined,
          payloadName: payloadName ? truncate(payloadName) : undefined,
          payloadCommandType: payloadCommandType ? truncate(payloadCommandType) : undefined,
          resultKind: resultKind ? truncate(resultKind) : undefined,
          resultCommandType: resultCommandType ? truncate(resultCommandType) : undefined,
          resultCommandName: resultCommandName ? truncate(resultCommandName) : undefined,
          resultCommandKeys: resultCommand ? Object.keys(resultCommand).slice(0, 30) : undefined,
          resultSubcommandsCount: subcommandsArr ? subcommandsArr.length : undefined,
          resultSubcommandKeys: firstSub ? Object.keys(firstSub).slice(0, 30) : undefined,
          payloadComponentPaths: payloadPaths.length ? payloadPaths.slice(0, 12) : undefined,
          resultComponentPaths: resultPaths.length ? resultPaths.slice(0, 12) : undefined,
          payloadKeys: payload ? Object.keys(payload).slice(0, 20) : undefined,
          resultKeys: result ? Object.keys(result).slice(0, 20) : undefined,
          lastError: doc.lastError ? truncate(doc.lastError, 160) : undefined,
        },
        null,
        2
      )
    );
  }
} catch (err) {
  console.error(err);
  process.exit(1);
} finally {
  await client.close();
}
