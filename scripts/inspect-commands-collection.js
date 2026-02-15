import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_OVERRIDE = process.env.MONGODB_DB;
const COMMANDS_COLLECTION = process.env.MONGODB_COMMANDS_COLLECTION ?? 'commands';

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI');
  process.exit(1);
}

const client = new MongoClient(MONGODB_URI, {
  maxPoolSize: 3,
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
});

try {
  await client.connect();
  const db = DB_OVERRIDE ? client.db(DB_OVERRIDE) : client.db();

  const collections = await db.listCollections({}, { nameOnly: true }).toArray();
  const colNames = collections.map((c) => c.name).sort((a, b) => a.localeCompare(b));

  const targetCol = db.collection(COMMANDS_COLLECTION);
  const count = await targetCol.countDocuments({});

  console.log('[inspect] db:', db.databaseName);
  console.log('[inspect] collections:', colNames.join(', '));
  console.log(`[inspect] ${COMMANDS_COLLECTION}.countDocuments():`, count);

  const sample = await targetCol.findOne({}, { projection: { name: 1, description: 1, type: 1 } });
  console.log('[inspect] sample:', sample);

  const projectionLikeSync = {
    name: 1,
    description: 1,
    category: 1,
    usage: 1,
    aliases: 1,
    examples: 1,
    cooldown: 1,
    type: 1,
    kind: 1,
    slash: 1,
    isSlash: 1,
    isSlashCommand: 1,
    is_slash: 1,
    commandType: 1,
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

  const docs = await targetCol
    .find({}, { projection: projectionLikeSync })
    .sort({ name: 1 })
    .limit(5)
    .toArray();
  console.log('[inspect] find+projection+sort returned:', docs.length);
  console.log('[inspect] first from that query:', docs[0]);
} catch (err) {
  console.error('[inspect] error:', err);
  process.exitCode = 1;
} finally {
  await client.close().catch(() => {});
}
