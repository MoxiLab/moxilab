import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import util from 'node:util';

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

const jobId = process.argv[2];
if (!jobId || !ObjectId.isValid(jobId)) {
  console.error('Usage: node scripts/inspect-playground-ui.js <jobId>');
  process.exit(1);
}

try {
  await client.connect();
  const db = DB_OVERRIDE ? client.db(DB_OVERRIDE) : client.db();
  const col = db.collection(PLAYGROUND_JOBS_COLLECTION);

  const doc = await col.findOne({ _id: new ObjectId(jobId) });
  if (!doc) {
    console.error('Job not found');
    process.exit(1);
  }

  const ui = doc?.result?.ui ?? doc?.result?.payload;
  if (!ui) {
    console.error('No result.ui or result.payload found for this job');
    process.exit(1);
  }

  const summary = {
    _id: doc._id?.toString?.(),
    type: doc.type,
    status: doc.status,
    uiKeys: Object.keys(ui ?? {}),
    componentsCount: Array.isArray(ui?.components) ? ui.components.length : 0,
    firstComponentKeys: Array.isArray(ui?.components) && ui.components[0]
      ? Object.keys(ui.components[0])
      : [],
  };

  console.log('Summary:', JSON.stringify(summary, null, 2));
  const depth = Number.parseInt(process.env.DEPTH ?? '6', 10);
  const maxArrayLength = Number.parseInt(process.env.MAX_ARRAY ?? '5', 10);

  console.log(`\nUI preview (depth=${depth}, maxArray=${maxArrayLength}):`);
  console.log(
    util.inspect(ui, {
      depth,
      maxArrayLength,
      colors: false,
      compact: false,
      breakLength: 120,
    })
  );
} catch (err) {
  console.error(err);
  process.exit(1);
} finally {
  await client.close();
}
