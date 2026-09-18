import { MongoDocument } from '../../types/mongo';
import { getNestedValue, setNestedValue, deleteNestedValue } from './path-utils';

export function applyUpdates(doc: MongoDocument, updateSpec: Record<string, any>): MongoDocument {
  const updated = JSON.parse(JSON.stringify(doc));

  for (const op of Object.keys(updateSpec)) {
    const fields = updateSpec[op];

    switch (op) {
      case '$set':
        for (const path of Object.keys(fields)) {
          setNestedValue(updated, path, fields[path]);
        }
        break;

      case '$inc':
        for (const path of Object.keys(fields)) {
          const current = getNestedValue(updated, path) || 0;
          setNestedValue(updated, path, current + fields[path]);
        }
        break;

      case '$unset':
        for (const path of Object.keys(fields)) {
          deleteNestedValue(updated, path);
        }
        break;

      case '$push':
        for (const path of Object.keys(fields)) {
          let current = getNestedValue(updated, path);
          if (!Array.isArray(current)) {
            current = [];
          }
          const valToPush = fields[path];
          if (valToPush && typeof valToPush === 'object' && '$each' in valToPush && Array.isArray(valToPush.$each)) {
            current.push(...valToPush.$each);
          } else {
            current.push(valToPush);
          }
          setNestedValue(updated, path, current);
        }
        break;

      case '$pull':
        for (const path of Object.keys(fields)) {
          const current = getNestedValue(updated, path);
          if (Array.isArray(current)) {
            const pullVal = fields[path];
            const filtered = current.filter(item => {
              if (typeof pullVal === 'object') {
                return JSON.stringify(item) !== JSON.stringify(pullVal);
              }
              return item !== pullVal;
            });
            setNestedValue(updated, path, filtered);
          }
        }
        break;

      default:
        // Direct field assignment if not operator
        if (!op.startsWith('$')) {
          setNestedValue(updated, op, fields);
        }
        break;
    }
  }

  return updated;
}
