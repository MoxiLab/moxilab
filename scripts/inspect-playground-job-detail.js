import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';

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

function truncate(value, max = 200) {
  const s = String(value ?? '');
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}

function compact(obj, depth = 2) {
  if (!obj || typeof obj !== 'object' || depth <= 0) return obj;
  if (Array.isArray(obj)) return obj.slice(0, 5).map((v) => compact(v, depth - 1));
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') out[k] = truncate(v);
    else out[k] = compact(v, depth - 1);
  }
  return out;
}

const jobId = process.argv[2];
if (!jobId || !ObjectId.isValid(jobId)) {
  console.error('Usage: node scripts/inspect-playground-job-detail.js <jobId>');
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

  const payload = doc.payload && typeof doc.payload === 'object' ? doc.payload : undefined;
  const result = doc.result && typeof doc.result === 'object' ? doc.result : undefined;

  const summary = {
    _id: doc._id?.toString?.(),
    type: doc.type,
    status: doc.status,
    payload: compact(payload, 3),
    result: compact(result, 3),
  };

  console.log(JSON.stringify(summary, null, 2));
} catch (err) {
  console.error(err);
  process.exit(1);
} finally {
  await client.close();
}
