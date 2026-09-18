import { MongoDocument, CursorOptions } from '../../types/mongo';
import { getNestedValue, setNestedValue } from './path-utils';

export function applyCursor(docs: MongoDocument[], options: CursorOptions): MongoDocument[] {
  let result = [...docs];

  // 1. Sort
  if (options.sort && Object.keys(options.sort).length > 0) {
    const sortKeys = Object.keys(options.sort);
    result.sort((a, b) => {
      for (const key of sortKeys) {
        const order = options.sort![key];
        const valA = getNestedValue(a, key);
        const valB = getNestedValue(b, key);

        if (valA === valB) continue;
        if (valA === undefined) return order;
        if (valB === undefined) return -order;

        if (valA < valB) return -order;
        if (valA > valB) return order;
      }
      return 0;
    });
  }

  // 2. Skip
  if (options.skip && options.skip > 0) {
    result = result.slice(options.skip);
  }

  // 3. Limit
  if (options.limit && options.limit > 0) {
    result = result.slice(0, options.limit);
  }

  // 4. Projection
  if (options.projection && Object.keys(options.projection).length > 0) {
    const proj = options.projection;
    const isInclusive = Object.entries(proj).some(([k, v]) => k !== '_id' && v === 1);
    const excludeId = proj['_id'] === 0;

    result = result.map(doc => {
      if (isInclusive) {
        const projectedDoc: Record<string, any> = {};
        if (!excludeId && '_id' in doc) {
          projectedDoc._id = doc._id;
        }
        for (const [key, val] of Object.entries(proj)) {
          if (val === 1 && key !== '_id') {
            const nested = getNestedValue(doc, key);
            if (nested !== undefined) {
              setNestedValue(projectedDoc, key, nested);
            }
          }
        }
        return projectedDoc as MongoDocument;
      } else {
        const copy = JSON.parse(JSON.stringify(doc));
        for (const [key, val] of Object.entries(proj)) {
          if (val === 0) {
            delete copy[key];
          }
        }
        return copy;
      }
    });
  }

  return result;
}
