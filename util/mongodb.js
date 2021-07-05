// import { MongoClient } from "mongodb";
const MongoClient = require("mongodb").MongoClient;

// type MongoConnection = {
//   client: MongoClient;
//   db: Db;
// };
// declare global {
//   namespace NodeJS {
//     interface Global {
//       mongo: any;
//     }
//   }
// }
// declare global {
//   namespace NodeJS {
//     interface Global {
//       mongo: {
//         conn: MongoConnection | null;
//         promise: Promise<MongoConnection> | null;
//       };
//     }
//   }
// }
// declare global {
//   namespace NodeJS {
//     interface Global {
//       mongo: {
//         conn: MongoClient | null;
//         promise: Promise<MongoClient> | null;
//       };
//     }
//   }
// }

const DB_URL = process.env.DB_URL;
const DB_NAME = process.env.DB_NAME;

if (!DB_URL) {
  throw new Error(
    "Please define the DB_URL environment variable inside .env.local"
  );
}

if (!DB_NAME) {
  throw new Error(
    "Please define the DB_NAME environment variable inside .env.local"
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongo;

if (!cached) {
  cached = global.mongo = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
    };

    cached.promise = MongoClient.connect(DB_URL, opts).then((client) => {
      return {
        client,
        db: client.db(DB_NAME),
      };
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
