import { MongoClient, Db } from "mongodb";

declare global {
  var _mongoClient: MongoClient | undefined;
  var _mongoDb: Db | undefined;
}

const dbName = process.env.MONGODB_NAME;
if (!dbName) throw new Error("Missing MONGODB_NAME");

const uri: string | undefined = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGO URI IS UNDEFINED");

let client: MongoClient;
let db: Db;

try {
  if (!global._mongoClient || !global._mongoDb) {
    client = new MongoClient(uri);
    await client.connect();
   
    db = client.db(dbName);
    global._mongoClient = client;
    global._mongoDb = db;
    await EnsureIndexes(db)
    console.log("Connected to MongoDB (new connection)");
  } else {
    client = global._mongoClient;
    db = global._mongoDb;
    console.log("Reusing existing MongoDB connection");
  }
} catch (error) {
  throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : String(error)}`);
}

async function EnsureIndexes(db: Db) {
  // const usersCollection = db.collection("users");
  // usersCollection.createIndex({ email: 1 }, { unique: true });
  // usersCollection.createIndex({ user_type: 1 });
  // usersCollection.createIndex({ status: 1 });
}

export default db;