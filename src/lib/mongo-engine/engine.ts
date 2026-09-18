import {
  MongoDatabase,
  MongoCollection,
  MongoDocument,
  QueryResult,
  ExecutionStats,
} from '../../types/mongo';
import { ParsedMongoCommand } from '../../types/ast';
import { matchDocument, explainDocumentEvaluation } from './matcher';
import { applyUpdates } from './updates';
import { applyCursor } from './cursor';
import { executeStage } from './aggregation-stages';
import { generateObjectId } from '../../utils/objectId';

export function executeCommand(
  db: MongoDatabase,
  parsed: ParsedMongoCommand
): { result: QueryResult; updatedDb: MongoDatabase } {
  const startTime = performance.now();

  // 1. Database-level operations
  if (parsed.method === 'getCollectionNames') {
    const colNames = Object.keys(db.collections);
    const duration = Math.max(1, Math.round(performance.now() - startTime));
    return {
      result: {
        success: true,
        data: colNames,
        timestamp: new Date().toISOString(),
        commandText: parsed.raw,
        operation: 'getCollectionNames',
        stats: {
          executionTimeMs: duration,
          documentsExamined: colNames.length,
          documentsReturned: colNames.length,
          indexesUsed: [],
          inMemorySort: false,
        },
      },
      updatedDb: db,
    };
  }

  if (parsed.method === 'createCollection') {
    const colName = parsed.collection.trim();
    if (!colName) {
      return {
        result: {
          success: false,
          data: null,
          error: 'Error: El nombre de la colección no puede estar vacío.',
          timestamp: new Date().toISOString(),
          commandText: parsed.raw,
          operation: 'createCollection',
        },
        updatedDb: db,
      };
    }

    if (db.collections[colName]) {
      return {
        result: {
          success: false,
          data: null,
          error: `MongoServerError: Collection already exists. NS: ${db.name}.${colName}`,
          timestamp: new Date().toISOString(),
          commandText: parsed.raw,
          operation: 'createCollection',
          collectionName: colName,
        },
        updatedDb: db,
      };
    }

    const newCol: MongoCollection = {
      name: colName,
      documents: [],
      createdAt: new Date().toISOString(),
      indexes: ['_id'],
      schema: {
        idType: 'objectId',
        columns: [
          { name: '_id', type: 'string', required: true },
        ],
      },
    };

    const updatedDb: MongoDatabase = {
      ...db,
      collections: {
        ...db.collections,
        [colName]: newCol,
      },
    };

    const duration = Math.max(1, Math.round(performance.now() - startTime));
    return {
      result: {
        success: true,
        data: { ok: 1 },
        timestamp: new Date().toISOString(),
        commandText: parsed.raw,
        operation: 'createCollection',
        collectionName: colName,
        stats: {
          executionTimeMs: duration,
          documentsExamined: 0,
          documentsReturned: 1,
          indexesUsed: [],
          inMemorySort: false,
        },
      },
      updatedDb,
    };
  }

  // 2. Collection resolution and implicit creation
  let collection = db.collections[parsed.collection];
  const updatedDb: MongoDatabase = {
    ...db,
    collections: { ...db.collections },
  };

  if (!collection) {
    if (parsed.method === 'drop') {
      const duration = Math.max(1, Math.round(performance.now() - startTime));
      return {
        result: {
          success: true,
          data: false,
          timestamp: new Date().toISOString(),
          commandText: parsed.raw,
          operation: 'drop',
          collectionName: parsed.collection,
          stats: {
            executionTimeMs: duration,
            documentsExamined: 0,
            documentsReturned: 1,
            indexesUsed: [],
            inMemorySort: false,
          },
        },
        updatedDb: db,
      };
    }

    if (parsed.method === 'insertOne' || parsed.method === 'insertMany') {
      collection = {
        name: parsed.collection,
        documents: [],
        createdAt: new Date().toISOString(),
        indexes: ['_id'],
        schema: {
          idType: 'objectId',
          columns: [
            { name: '_id', type: 'string', required: true },
          ],
        },
      };
      updatedDb.collections[parsed.collection] = collection;
    } else {
      return {
        result: {
          success: false,
          data: null,
          error: `NamespaceNotFoundError: La colección '${parsed.collection}' no existe en la base de datos '${db.name}'.`,
          timestamp: new Date().toISOString(),
          commandText: parsed.raw,
          operation: parsed.method,
          collectionName: parsed.collection,
        },
        updatedDb: db,
      };
    }
  }

  // 3. Drop collection
  if (parsed.method === 'drop') {
    delete updatedDb.collections[parsed.collection];
    const duration = Math.max(1, Math.round(performance.now() - startTime));
    return {
      result: {
        success: true,
        data: true,
        timestamp: new Date().toISOString(),
        commandText: parsed.raw,
        operation: 'drop',
        collectionName: parsed.collection,
        stats: {
          executionTimeMs: duration,
          documentsExamined: collection.documents.length,
          documentsReturned: 1,
          indexesUsed: [],
          inMemorySort: false,
        },
      },
      updatedDb,
    };
  }

  // 4. Collection stats
  if (parsed.method === 'stats') {
    const duration = Math.max(1, Math.round(performance.now() - startTime));
    const jsonStr = JSON.stringify(collection.documents);
    const sizeBytes = new Blob([jsonStr]).size;
    return {
      result: {
        success: true,
        data: {
          ns: `${db.name}.${parsed.collection}`,
          count: collection.documents.length,
          size: sizeBytes,
          avgObjSize: collection.documents.length > 0 ? Math.round(sizeBytes / collection.documents.length) : 0,
          storageSize: sizeBytes,
          nindexes: collection.indexes.length,
          indexes: collection.indexes,
          ok: 1,
        },
        timestamp: new Date().toISOString(),
        commandText: parsed.raw,
        operation: 'stats',
        collectionName: parsed.collection,
        stats: {
          executionTimeMs: duration,
          documentsExamined: collection.documents.length,
          documentsReturned: 1,
          indexesUsed: [],
          inMemorySort: false,
        },
      },
      updatedDb: db,
    };
  }

  const docs = [...collection.documents];
  let returnedData: any = null;
  let examinedCount = docs.length;
  let returnedCount = 0;
  let explanation = undefined;

  try {
    switch (parsed.method) {
      case 'find': {
        const filter = parsed.filter || {};
        const matched = docs.filter(doc => matchDocument(doc, filter).matches);
        const transformed = applyCursor(matched, parsed.cursorOptions);
        returnedData = transformed;
        returnedCount = transformed.length;
        explanation = docs.map(doc => explainDocumentEvaluation(doc, filter));
        break;
      }

      case 'findOne': {
        const filter = parsed.filter || {};
        const matched = docs.find(doc => matchDocument(doc, filter).matches) || null;
        returnedData = matched;
        returnedCount = matched ? 1 : 0;
        explanation = docs.map(doc => explainDocumentEvaluation(doc, filter));
        break;
      }

      case 'countDocuments': {
        const filter = parsed.filter || {};
        const count = docs.filter(doc => matchDocument(doc, filter).matches).length;
        returnedData = count;
        returnedCount = 1;
        break;
      }

      case 'distinct': {
        const filter = parsed.filter || {};
        const field = parsed.distinctField || '_id';
        const matched = docs.filter(doc => matchDocument(doc, filter).matches);
        const values = new Set();
        for (const doc of matched) {
          const val = doc[field];
          if (val !== undefined) {
            if (Array.isArray(val)) {
              val.forEach(v => values.add(v));
            } else {
              values.add(val);
            }
          }
        }
        returnedData = Array.from(values);
        returnedCount = returnedData.length;
        break;
      }

      case 'insertOne': {
        const docToInsert = { ...(parsed.document || {}) };
        let finalId = docToInsert._id;
        if (finalId === undefined || finalId === null || finalId === '') {
          if (docToInsert.id !== undefined && docToInsert.id !== null && docToInsert.id !== '') {
            finalId = docToInsert.id;
            delete docToInsert.id;
          } else {
            finalId = generateObjectId();
          }
        } else if (docToInsert.id !== undefined) {
          delete docToInsert.id;
        }

        const newDoc: MongoDocument = {
          _id: finalId,
          ...docToInsert,
        };
        docs.push(newDoc);
        updatedDb.collections[parsed.collection] = {
          ...collection,
          documents: docs,
        };
        returnedData = {
          acknowledged: true,
          insertedId: newDoc._id,
        };
        returnedCount = 1;
        examinedCount = 0;
        break;
      }

      case 'insertMany': {
        const docsToInsert = parsed.documents || [];
        const insertedIds: any[] = [];
        for (const rawDoc of docsToInsert) {
          const doc = { ...rawDoc };
          let finalId = doc._id;
          if (finalId === undefined || finalId === null || finalId === '') {
            if (doc.id !== undefined && doc.id !== null && doc.id !== '') {
              finalId = doc.id;
              delete doc.id;
            } else {
              finalId = generateObjectId();
            }
          } else if (doc.id !== undefined) {
            delete doc.id;
          }

          const newDoc: MongoDocument = {
            _id: finalId,
            ...doc,
          };
          docs.push(newDoc);
          insertedIds.push(newDoc._id);
        }
        updatedDb.collections[parsed.collection] = {
          ...collection,
          documents: docs,
        };
        returnedData = {
          acknowledged: true,
          insertedCount: insertedIds.length,
          insertedIds,
        };
        returnedCount = insertedIds.length;
        examinedCount = 0;
        break;
      }

      case 'updateOne': {
        const filter = parsed.filter || {};
        const updateSpec = parsed.updateDoc || {};
        let modifiedCount = 0;
        let matchedCount = 0;

        const newDocs = docs.map(doc => {
          if (matchedCount === 0 && matchDocument(doc, filter).matches) {
            matchedCount = 1;
            modifiedCount = 1;
            return applyUpdates(doc, updateSpec);
          }
          return doc;
        });

        updatedDb.collections[parsed.collection] = {
          ...collection,
          documents: newDocs,
        };

        returnedData = {
          acknowledged: true,
          matchedCount,
          modifiedCount,
        };
        returnedCount = modifiedCount;
        break;
      }

      case 'updateMany': {
        const filter = parsed.filter || {};
        const updateSpec = parsed.updateDoc || {};
        let modifiedCount = 0;
        let matchedCount = 0;

        const newDocs = docs.map(doc => {
          if (matchDocument(doc, filter).matches) {
            matchedCount++;
            modifiedCount++;
            return applyUpdates(doc, updateSpec);
          }
          return doc;
        });

        updatedDb.collections[parsed.collection] = {
          ...collection,
          documents: newDocs,
        };

        returnedData = {
          acknowledged: true,
          matchedCount,
          modifiedCount,
        };
        returnedCount = modifiedCount;
        break;
      }

      case 'replaceOne': {
        const filter = parsed.filter || {};
        const replacement = parsed.document || {};
        let modifiedCount = 0;
        let matchedCount = 0;

        const newDocs = docs.map(doc => {
          if (matchedCount === 0 && matchDocument(doc, filter).matches) {
            matchedCount = 1;
            modifiedCount = 1;
            return {
              _id: doc._id,
              ...replacement,
            };
          }
          return doc;
        });

        updatedDb.collections[parsed.collection] = {
          ...collection,
          documents: newDocs,
        };

        returnedData = {
          acknowledged: true,
          matchedCount,
          modifiedCount,
        };
        returnedCount = modifiedCount;
        break;
      }

      case 'deleteOne': {
        const filter = parsed.filter || {};
        let deletedCount = 0;
        const remainingDocs: MongoDocument[] = [];

        for (const doc of docs) {
          if (deletedCount === 0 && matchDocument(doc, filter).matches) {
            deletedCount = 1;
          } else {
            remainingDocs.push(doc);
          }
        }

        updatedDb.collections[parsed.collection] = {
          ...collection,
          documents: remainingDocs,
        };

        returnedData = {
          acknowledged: true,
          deletedCount,
        };
        returnedCount = deletedCount;
        break;
      }

      case 'deleteMany': {
        const filter = parsed.filter || {};
        let deletedCount = 0;
        const remainingDocs: MongoDocument[] = [];

        for (const doc of docs) {
          if (matchDocument(doc, filter).matches) {
            deletedCount++;
          } else {
            remainingDocs.push(doc);
          }
        }

        updatedDb.collections[parsed.collection] = {
          ...collection,
          documents: remainingDocs,
        };

        returnedData = {
          acknowledged: true,
          deletedCount,
        };
        returnedCount = deletedCount;
        break;
      }

      case 'aggregate': {
        const pipeline = parsed.pipeline || [];
        let currentDocs = [...docs];

        for (const stage of pipeline) {
          const stageType = Object.keys(stage)[0];
          const stageConfig = stage[stageType];
          currentDocs = executeStage(currentDocs, stageType, stageConfig);
        }

        returnedData = currentDocs;
        returnedCount = currentDocs.length;
        break;
      }

      default:
        throw new Error(`Método '${parsed.method}' no soportado`);
    }

    const endTime = performance.now();
    const duration = Math.max(1, Math.round(endTime - startTime));

    const stats: ExecutionStats = {
      executionTimeMs: duration,
      documentsExamined: examinedCount,
      documentsReturned: returnedCount,
      indexesUsed: ['_id_'],
      inMemorySort: !!parsed.cursorOptions.sort,
    };

    return {
      result: {
        success: true,
        data: returnedData,
        stats,
        explanation,
        timestamp: new Date().toISOString(),
        commandText: parsed.raw,
        operation: parsed.method,
        collectionName: parsed.collection,
      },
      updatedDb,
    };
  } catch (err: any) {
    const endTime = performance.now();
    return {
      result: {
        success: false,
        data: null,
        error: err.message || 'Error en la ejecución de la consulta.',
        stats: {
          executionTimeMs: Math.max(1, Math.round(endTime - startTime)),
          documentsExamined: examinedCount,
          documentsReturned: 0,
          indexesUsed: [],
          inMemorySort: false,
        },
        timestamp: new Date().toISOString(),
        commandText: parsed.raw,
        operation: parsed.method,
        collectionName: parsed.collection,
      },
      updatedDb: db,
    };
  }
}
