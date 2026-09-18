import { create } from 'zustand';
import {
  MongoDatabase,
  MongoCollection,
  MongoDocument,
  QueryResult,
  CollectionSchema,
} from '../types/mongo';
import { loadDatabase, saveDatabase, resetDatabaseToSeed } from '../lib/storage/idb';
import { parseMongoCommand } from '../lib/parser/mongo-parser';
import { executeCommand } from '../lib/mongo-engine/engine';
import { getInitialDatabase } from '../data/seed';
import { generateObjectId } from '../utils/objectId';

interface DbState {
  database: MongoDatabase;
  selectedCollection: string;
  isLoading: boolean;
  error: string | null;

  initDatabase: () => Promise<void>;
  selectCollection: (name: string) => void;
  createCollection: (
    name: string,
    options?: { schema?: CollectionSchema; initialDocuments?: MongoDocument[] }
  ) => Promise<void>;
  renameCollection: (oldName: string, newName: string) => Promise<void>;
  duplicateCollection: (name: string, newName: string) => Promise<void>;
  deleteCollection: (name: string) => Promise<void>;
  resetDatabase: () => Promise<void>;
  importCollectionJson: (collectionName: string, jsonString: string) => Promise<void>;
  exportCollectionJson: (collectionName: string) => string;
  exportDatabaseJson: () => string;
  importDatabaseJson: (jsonString: string) => Promise<void>;

  insertDocument: (collectionName: string, doc: Partial<MongoDocument>) => Promise<MongoDocument>;
  updateDocument: (collectionName: string, docId: string, updatedDoc: Partial<MongoDocument>) => Promise<void>;
  deleteDocument: (collectionName: string, docId: string) => Promise<void>;

  runQuery: (commandText: string) => Promise<QueryResult>;
}

export const useDbStore = create<DbState>((set, get) => ({
  database: getInitialDatabase(),
  selectedCollection: 'usuarios',
  isLoading: true,
  error: null,

  initDatabase: async () => {
    try {
      set({ isLoading: true, error: null });
      const db = await loadDatabase();
      const firstCol = Object.keys(db.collections)[0] || 'usuarios';
      set({ database: db, selectedCollection: firstCol, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  selectCollection: (name: string) => {
    set({ selectedCollection: name });
  },

  createCollection: async (
    name: string,
    options?: { schema?: CollectionSchema; initialDocuments?: MongoDocument[] }
  ) => {
    const trimmed = name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (!trimmed) throw new Error('Nombre de colección inválido.');

    const { database } = get();
    if (database.collections[trimmed]) {
      throw new Error(`La colección '${trimmed}' ya existe.`);
    }

    const newCol: MongoCollection = {
      name: trimmed,
      documents: options?.initialDocuments ? JSON.parse(JSON.stringify(options.initialDocuments)) : [],
      createdAt: new Date().toISOString(),
      indexes: ['_id'],
      schema: options?.schema,
    };

    const updatedDb: MongoDatabase = {
      ...database,
      collections: {
        ...database.collections,
        [trimmed]: newCol,
      },
    };

    await saveDatabase(updatedDb);
    set({ database: updatedDb, selectedCollection: trimmed });
  },

  renameCollection: async (oldName: string, newName: string) => {
    const trimmed = newName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (!trimmed) throw new Error('Nombre de colección inválido.');

    const { database, selectedCollection } = get();
    if (!database.collections[oldName]) return;
    if (database.collections[trimmed]) {
      throw new Error(`La colección '${trimmed}' ya existe.`);
    }

    const col = database.collections[oldName];
    const newCollections = { ...database.collections };
    delete newCollections[oldName];
    newCollections[trimmed] = { ...col, name: trimmed };

    const updatedDb: MongoDatabase = {
      ...database,
      collections: newCollections,
    };

    await saveDatabase(updatedDb);
    set({
      database: updatedDb,
      selectedCollection: selectedCollection === oldName ? trimmed : selectedCollection,
    });
  },

  duplicateCollection: async (name: string, newName: string) => {
    const trimmed = newName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const { database } = get();
    const sourceCol = database.collections[name];
    if (!sourceCol) return;

    const dupCol: MongoCollection = {
      name: trimmed,
      documents: JSON.parse(JSON.stringify(sourceCol.documents)),
      createdAt: new Date().toISOString(),
      indexes: [...sourceCol.indexes],
    };

    const updatedDb: MongoDatabase = {
      ...database,
      collections: {
        ...database.collections,
        [trimmed]: dupCol,
      },
    };

    await saveDatabase(updatedDb);
    set({ database: updatedDb, selectedCollection: trimmed });
  },

  deleteCollection: async (name: string) => {
    const { database, selectedCollection } = get();
    const newCollections = { ...database.collections };
    delete newCollections[name];

    const remainingKeys = Object.keys(newCollections);
    if (remainingKeys.length === 0) {
      throw new Error('No se puede eliminar la última colección restante.');
    }

    const updatedDb: MongoDatabase = {
      ...database,
      collections: newCollections,
    };

    await saveDatabase(updatedDb);
    set({
      database: updatedDb,
      selectedCollection: selectedCollection === name ? remainingKeys[0] : selectedCollection,
    });
  },

  resetDatabase: async () => {
    set({ isLoading: true });
    const initial = await resetDatabaseToSeed();
    set({ database: initial, selectedCollection: 'usuarios', isLoading: false });
  },

  importCollectionJson: async (collectionName: string, jsonString: string) => {
    const parsed = JSON.parse(jsonString);
    const docs = Array.isArray(parsed) ? parsed : [parsed];
    const { database } = get();
    const col = database.collections[collectionName] || {
      name: collectionName,
      documents: [],
      createdAt: new Date().toISOString(),
      indexes: ['_id'],
    };

    const normalizedDocs: MongoDocument[] = docs.map((d: any) => {
      const docCopy = { ...d };
      let finalId = docCopy._id;
      if (finalId === undefined || finalId === null || finalId === '') {
        if (docCopy.id !== undefined && docCopy.id !== null && docCopy.id !== '') {
          finalId = docCopy.id;
          delete docCopy.id;
        } else {
          finalId = generateObjectId();
        }
      } else if (docCopy.id !== undefined) {
        delete docCopy.id;
      }

      return {
        _id: finalId,
        ...docCopy,
      };
    });

    const updatedDb: MongoDatabase = {
      ...database,
      collections: {
        ...database.collections,
        [collectionName]: {
          ...col,
          documents: [...col.documents, ...normalizedDocs],
        },
      },
    };

    await saveDatabase(updatedDb);
    set({ database: updatedDb, selectedCollection: collectionName });
  },

  exportCollectionJson: (collectionName: string) => {
    const { database } = get();
    const col = database.collections[collectionName];
    if (!col) return '[]';
    return JSON.stringify(col.documents, null, 2);
  },

  exportDatabaseJson: () => {
    const { database } = get();
    return JSON.stringify(database, null, 2);
  },

  importDatabaseJson: async (jsonString: string) => {
    const parsed = JSON.parse(jsonString) as MongoDatabase;
    if (!parsed || !parsed.name || !parsed.collections) {
      throw new Error('Estructura de base de datos inválida.');
    }
    await saveDatabase(parsed);
    const firstCol = Object.keys(parsed.collections)[0] || 'usuarios';
    set({ database: parsed, selectedCollection: firstCol });
  },

  insertDocument: async (collectionName: string, doc: Partial<MongoDocument>) => {
    const docCopy = { ...doc };
    let finalId: any = docCopy._id;
    const { database } = get();
    const col = database.collections[collectionName];
    if (!col) throw new Error(`Colección '${collectionName}' no encontrada.`);

    if (finalId === undefined || finalId === null || finalId === '') {
      if (docCopy.id !== undefined && docCopy.id !== null && docCopy.id !== '') {
        finalId = docCopy.id;
        delete docCopy.id;
      } else {
        const idType = col.schema?.idType || 'objectId';
        if (idType === 'uuid') {
          finalId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'uuid-' + Math.random().toString(36).slice(2, 11);
        } else if (idType === 'incremental') {
          const numericIds = (col.documents || [])
            .map((d) => Number(d._id))
            .filter((n) => !isNaN(n) && isFinite(n));
          finalId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
        } else {
          finalId = generateObjectId();
        }
      }
    } else if (docCopy.id !== undefined) {
      delete docCopy.id;
    }

    const newDoc: MongoDocument = {
      _id: finalId,
      ...docCopy,
    };

    const updatedDb: MongoDatabase = {
      ...database,
      collections: {
        ...database.collections,
        [collectionName]: {
          ...col,
          documents: [newDoc, ...col.documents],
        },
      },
    };

    await saveDatabase(updatedDb);
    set({ database: updatedDb });
    return newDoc;
  },

  updateDocument: async (collectionName: string, docId: string, updatedDoc: Partial<MongoDocument>) => {
    const { database } = get();
    const col = database.collections[collectionName];
    if (!col) return;

    const newDocs = col.documents.map(d => (d._id === docId ? { ...d, ...updatedDoc, _id: docId } : d));

    const updatedDb: MongoDatabase = {
      ...database,
      collections: {
        ...database.collections,
        [collectionName]: {
          ...col,
          documents: newDocs,
        },
      },
    };

    await saveDatabase(updatedDb);
    set({ database: updatedDb });
  },

  deleteDocument: async (collectionName: string, docId: string) => {
    const { database } = get();
    const col = database.collections[collectionName];
    if (!col) return;

    const newDocs = col.documents.filter(d => d._id !== docId);

    const updatedDb: MongoDatabase = {
      ...database,
      collections: {
        ...database.collections,
        [collectionName]: {
          ...col,
          documents: newDocs,
        },
      },
    };

    await saveDatabase(updatedDb);
    set({ database: updatedDb });
  },

  runQuery: async (commandText: string) => {
    const { database, selectedCollection } = get();
    try {
      const parsed = parseMongoCommand(commandText);
      const { result, updatedDb } = executeCommand(database, parsed);

      if (result.success && updatedDb !== database) {
        await saveDatabase(updatedDb);

        const updates: Partial<{ database: MongoDatabase; selectedCollection: string }> = {
          database: updatedDb,
        };

        if (parsed.method === 'drop' && selectedCollection === parsed.collection) {
          const remaining = Object.keys(updatedDb.collections);
          updates.selectedCollection = remaining[0] || '';
        } else if (parsed.collection && updatedDb.collections[parsed.collection]) {
          updates.selectedCollection = parsed.collection;
        }

        set(updates);
      }

      return result;
    } catch (err: any) {
      return {
        success: false,
        data: null,
        error: err.message || 'Error de sintaxis o ejecución.',
        timestamp: new Date().toISOString(),
        commandText,
      };
    }
  },
}));
