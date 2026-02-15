import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

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

const input = process.argv[2];
if (!input) {
  console.error('Usage: node scripts/find-playground-job.js <name>');
  process.exit(1);
}

const client = new MongoClient(MONGODB_URI, {
  maxPoolSize: 5,
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
});

try {
  await client.connect();
  const db = DB_OVERRIDE ? client.db(DB_OVERRIDE) : client.db();
  const col = db.collection(PLAYGROUND_JOBS_COLLECTION);

  const rx = new RegExp(`^${input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

  const docs = await col
    .find({
      type: 'playground:commandPreview',
      status: 'completed',
      $or: [
        { 'payload.name': rx },
        { 'result.command.name': rx },
        { 'result.command.aliases': rx },
      ],
    })
    .sort({ completedAt: -1, updatedAt: -1 })
    .limit(5)
    .project({
      _id: 1,
      type: 1,
      status: 1,
      'payload.name': 1,
      'payload.commandType': 1,
      'result.command.name': 1,
      'result.command.aliases': 1,
      'result.commandType': 1,
      completedAt: 1,
      updatedAt: 1,
    })
    .toArray();

  console.log(JSON.stringify(docs, null, 2));
} catch (err) {
  console.error(err);
  process.exit(1);
} finally {
  await client.close();
}
