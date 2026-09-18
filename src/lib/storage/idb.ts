import { openDB, IDBPDatabase } from 'idb';
import { MongoDatabase, CommandHistoryItem } from '../../types/mongo';
import { getInitialDatabase } from '../../data/seed';

const DB_NAME = 'mongodb_lab_local';
const DB_VERSION = 1;

interface MongoLabDB {
  databases: {
    key: string;
    value: MongoDatabase;
  };
  history: {
    key: string;
    value: CommandHistoryItem;
  };
  course_progress: {
    key: string;
    value: {
      exerciseId: string;
      completed: boolean;
      userCode: string;
      updatedAt: string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<MongoLabDB>> | null = null;

function getDb(): Promise<IDBPDatabase<MongoLabDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MongoLabDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('databases')) {
          db.createObjectStore('databases', { keyPath: 'name' });
        }
        if (!db.objectStoreNames.contains('history')) {
          db.createObjectStore('history', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('course_progress')) {
          db.createObjectStore('course_progress', { keyPath: 'exerciseId' });
        }
      },
    });
  }
  return dbPromise;
}

const LEGACY_ID_MAP: Record<string, string> = {
  // usuarios
  '660a10010000000000000001': '65f4621ab7e34d1908c9012a',
  '660a10010000000000000002': '65f4622b8a21e4f509c9143b',
  '660a10010000000000000003': '65f46241a491bc300ad8274c',
  '660a10010000000000000004': '65f46255ef88219c0be7315d',
  '660a10010000000000000005': '65f4626dc091ea280cf6496e',
  '660a10010000000000000006': '65f4628292d3f7810ea5587f',
  '660a10010000000000000007': '65f4629718ea69020fb46180',
  '660a10010000000000000008': '65f462ad71cb943310c37a91',
  '660a10010000000000000009': '65f462c159df816411d283a2',
  '660a10010000000000000010': '65f462d63a8e27c512e19cb3',
  // peliculas
  '660a20010000000000000001': '6612b4e18d9f4c3a7201e51b',
  '660a20010000000000000002': '6612b4f53a2c7e199412f62c',
  '660a20010000000000000003': '6612b509bc71d4928123073d',
  '660a20010000000000000004': '6612b51ee890a37b5234184e',
  '660a20010000000000000005': '6612b5302f61c89e6345295f',
  '660a20010000000000000006': '6612b542a172e90f74563a60',
  '660a20010000000000000007': '6612b5585b83da1a85674b71',
  '660a20010000000000000008': '6612b56cfc94eb2b96785c82',
  '660a20010000000000000009': '6612b5800da5fc3ca7896d93',
  '660a20010000000000000010': '6612b595be16ad4db89a7e04',
  // productos
  '660a30010000000000000001': '662e08c49e71b2d038a1c945',
  '660a30010000000000000002': '662e08d81f82c3e149b2da56',
  '660a30010000000000000003': '662e08ea8a93d4f25ac3eb67',
  '660a30010000000000000004': '662e08fd4ba4e5036bd4fc78',
  '660a30010000000000000005': '662e0910dc15f6147ce50d89',
  '660a30010000000000000006': '662e09247d2607258df61e9a',
  '660a30010000000000000007': '662e09392e3718369ef72fab',
  '660a30010000000000000008': '662e094c9f482947af0830bc',
  '660a30010000000000000009': '662e09605a593a58b01941cd',
  '660a30010000000000000010': '662e0973eb6a4b69c12a52de',
};

export async function loadDatabase(name = 'mi_base_datos'): Promise<MongoDatabase> {
  const db = await getDb();
  const existing = await db.get('databases', name);
  const firstUser = existing?.collections?.usuarios?.documents?.[0];
  if (
    existing &&
    existing.collections?.peliculas &&
    firstUser &&
    typeof firstUser._id === 'string' &&
    firstUser._id.length === 24
  ) {
    // Migrar cualquier colección donde los documentos tengan 'id' duplicado a '_id'
    // y migrar IDs secuenciales artificiales antiguos (660a...) a IDs realistas de MongoDB
    let modified = false;
    for (const colName of Object.keys(existing.collections)) {
      const col = existing.collections[colName];
      col.documents = col.documents.map((d: any) => {
        let doc = d;
        if (doc && doc.id !== undefined && doc.id !== null) {
          modified = true;
          const { id, ...rest } = doc;
          doc = { _id: id, ...rest };
        }
        if (doc && typeof doc._id === 'string' && LEGACY_ID_MAP[doc._id]) {
          modified = true;
          doc = { ...doc, _id: LEGACY_ID_MAP[doc._id] };
        }
        return doc;
      });
    }
    if (modified) {
      await db.put('databases', existing);
    }
    return existing;
  }
  const initial = getInitialDatabase();
  await db.put('databases', initial);
  return initial;
}

export async function saveDatabase(database: MongoDatabase): Promise<void> {
  const db = await getDb();
  await db.put('databases', database);
}

export async function resetDatabaseToSeed(_name = 'mi_base_datos'): Promise<MongoDatabase> {
  const db = await getDb();
  const initial = getInitialDatabase();
  await db.put('databases', initial);
  return initial;
}

export async function getHistoryItems(): Promise<CommandHistoryItem[]> {
  const db = await getDb();
  return db.getAll('history');
}

export async function saveHistoryItem(item: CommandHistoryItem): Promise<void> {
  const db = await getDb();
  await db.put('history', item);
}

export async function deleteHistoryItem(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('history', id);
}

export async function clearAllHistory(): Promise<void> {
  const db = await getDb();
  await db.clear('history');
}

export async function getLabProgress(): Promise<Record<string, { completed: boolean; userCode: string }>> {
  const db = await getDb();
  const all = await db.getAll('course_progress');
  const result: Record<string, { completed: boolean; userCode: string }> = {};
  for (const item of all) {
    result[item.exerciseId] = { completed: item.completed, userCode: item.userCode };
  }
  return result;
}

export async function saveLabProgress(exerciseId: string, completed: boolean, userCode: string): Promise<void> {
  const db = await getDb();
  await db.put('course_progress', {
    exerciseId,
    completed,
    userCode,
    updatedAt: new Date().toISOString(),
  });
}
