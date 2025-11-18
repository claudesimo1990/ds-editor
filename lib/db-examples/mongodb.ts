/**
 * MongoDB Datenbankverbindung Beispiel
 * 
 * Installation: npm install mongodb
 */

import { MongoClient, Db, Collection } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'memorials';

let client: MongoClient | null = null;
let db: Db | null = null;

// Datenbankverbindung
export async function connectDB() {
  if (client) {
    return db;
  }

  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    console.log('MongoDB verbunden');
    return db;
  } catch (error) {
    console.error('MongoDB Verbindungsfehler:', error);
    throw error;
  }
}

// Collection erhalten
async function getCollection(): Promise<Collection> {
  const database = await connectDB();
  return database!.collection('memorials');
}

// Memorial speichern
export async function saveMemorial(id: string, blocks: any[]) {
  try {
    const collection = await getCollection();
    await collection.updateOne(
      { id },
      {
        $set: {
          id,
          blocks,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
    return { success: true, id };
  } catch (error) {
    console.error('Fehler beim Speichern:', error);
    throw error;
  }
}

// Memorial laden
export async function loadMemorial(id: string) {
  try {
    const collection = await getCollection();
    const memorial = await collection.findOne({ id });
    
    if (!memorial) {
      return null;
    }
    
    return {
      id: memorial.id,
      blocks: memorial.blocks,
      createdAt: memorial.createdAt,
      updatedAt: memorial.updatedAt,
    };
  } catch (error) {
    console.error('Fehler beim Laden:', error);
    throw error;
  }
}

// Memorial löschen
export async function deleteMemorial(id: string) {
  try {
    const collection = await getCollection();
    await collection.deleteOne({ id });
    return { success: true };
  } catch (error) {
    console.error('Fehler beim Löschen:', error);
    throw error;
  }
}

// Verbindung schließen
export async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

