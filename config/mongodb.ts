import { MongoClient, Db } from "mongodb";

declare global {
  var _mongoClient: MongoClient | undefined;
  var _mongoDb: Db | undefined;
}

const dbName = process.env.MONGO_DB;
if (!dbName) throw new Error("Missing MONGODB_NAME");

const uri: string | undefined = process.env.MONGO_URI;
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
    
    console.log("Connected to MongoDB (new connection)");
  } else {
    client = global._mongoClient;
    db = global._mongoDb;
    console.log("Reusing existing MongoDB connection");
  }
} catch (error) {
  throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : String(error)}`);
}



export default db;