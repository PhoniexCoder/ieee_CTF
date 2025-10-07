import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || "ctf"

if (!globalThis.__mongo) {
  ;(globalThis as unknown as { __mongo?: { clientPromise: null | Promise<MongoClient> } }).__mongo = {
    clientPromise: null as null | Promise<MongoClient>,
  }
}

export async function getDb() {
  if (!uri) {
    throw new Error("MONGODB_URI is not configured")
  }
  if (!globalThis.__mongo?.clientPromise) {
    const client = new MongoClient(uri, {
      // modern defaults; Atlas supports server API v1 but optional here
    })
    ;(globalThis as unknown as { __mongo: { clientPromise: null | Promise<MongoClient> } }).__mongo.clientPromise =
      client.connect()
  }
  const client = await (globalThis as unknown as { __mongo: { clientPromise: Promise<MongoClient> } }).__mongo
    .clientPromise
  return client.db(dbName)
}

// Type hint to satisfy TS for globalThis
declare global {
  // eslint-disable-next-line no-var
  var __mongo:
    | undefined
    | {
        clientPromise: null | Promise<MongoClient>
      }
}
