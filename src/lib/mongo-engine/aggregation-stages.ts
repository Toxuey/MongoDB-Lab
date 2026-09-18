import { MongoDocument } from '../../types/mongo';
import { matchDocument } from './matcher';
import { getNestedValue, setNestedValue } from './path-utils';
import { applyCursor } from './cursor';

export function executeStage(
  docs: MongoDocument[],
  stageType: string,
  stageConfig: any
): MongoDocument[] {
  switch (stageType) {
    case '$match': {
      return docs.filter(doc => matchDocument(doc, stageConfig).matches);
    }

    case '$sort': {
      return applyCursor(docs, { sort: stageConfig });
    }

    case '$limit': {
      const limitVal = typeof stageConfig === 'number' ? stageConfig : 10;
      return docs.slice(0, limitVal);
    }

    case '$skip': {
      const skipVal = typeof stageConfig === 'number' ? stageConfig : 0;
      return docs.slice(skipVal);
    }

    case '$count': {
      const fieldName = typeof stageConfig === 'string' ? stageConfig : 'total';
      return [{ _id: null, [fieldName]: docs.length } as any];
    }

    case '$unwind': {
      const path = typeof stageConfig === 'string'
        ? (stageConfig.startsWith('$') ? stageConfig.substring(1) : stageConfig)
        : (stageConfig.path?.startsWith('$') ? stageConfig.path.substring(1) : stageConfig.path);

      const unwound: MongoDocument[] = [];
      for (const doc of docs) {
        const arr = getNestedValue(doc, path);
        if (Array.isArray(arr) && arr.length > 0) {
          for (let idx = 0; idx < arr.length; idx++) {
            const clone = JSON.parse(JSON.stringify(doc));
            clone._id = `${doc._id}_unwind_${idx}`;
            setNestedValue(clone, path, arr[idx]);
            unwound.push(clone);
          }
        } else if (stageConfig.preserveNullAndEmptyArrays) {
          unwound.push(doc);
        }
      }
      return unwound;
    }

    case '$project': {
      return docs.map(doc => {
        const out: Record<string, any> = {};
        for (const [key, expr] of Object.entries(stageConfig)) {
          if (typeof expr === 'string' && expr.startsWith('$')) {
            const srcField = expr.substring(1);
            out[key] = getNestedValue(doc, srcField);
          } else if (expr === 1) {
            out[key] = getNestedValue(doc, key);
          } else if (expr !== 0) {
            out[key] = expr;
          }
        }
        if (!('_id' in stageConfig) && '_id' in doc) {
          out._id = doc._id;
        } else if (stageConfig._id === 0) {
          delete out._id;
        }
        return out as MongoDocument;
      });
    }

    case '$group': {
      const idExpr = stageConfig._id;
      const groups = new Map<string, { groupKey: any; docs: MongoDocument[] }>();

      for (const doc of docs) {
        let groupKeyVal: any = null;
        if (idExpr === null) {
          groupKeyVal = null;
        } else if (typeof idExpr === 'string' && idExpr.startsWith('$')) {
          groupKeyVal = getNestedValue(doc, idExpr.substring(1));
        } else if (typeof idExpr === 'object') {
          const compKey: Record<string, any> = {};
          for (const [k, v] of Object.entries(idExpr)) {
            if (typeof v === 'string' && v.startsWith('$')) {
              compKey[k] = getNestedValue(doc, v.substring(1));
            } else {
              compKey[k] = v;
            }
          }
          groupKeyVal = compKey;
        } else {
          groupKeyVal = idExpr;
        }

        const mapKey = JSON.stringify(groupKeyVal);
        if (!groups.has(mapKey)) {
          groups.set(mapKey, { groupKey: groupKeyVal, docs: [] });
        }
        groups.get(mapKey)!.docs.push(doc);
      }

      const groupedResults: MongoDocument[] = [];

      for (const [, groupData] of groups) {
        const resultDoc: Record<string, any> = { _id: groupData.groupKey };

        for (const [outField, accumulator] of Object.entries(stageConfig)) {
          if (outField === '_id') continue;
          if (typeof accumulator !== 'object' || accumulator === null) continue;

          const accOp = Object.keys(accumulator)[0];
          const expr = (accumulator as Record<string, any>)[accOp];

          const extractValues = (): number[] => {
            if (typeof expr === 'number') return groupData.docs.map(() => expr);
            if (typeof expr === 'string' && expr.startsWith('$')) {
              return groupData.docs
                .map(d => getNestedValue(d, expr.substring(1)))
                .filter(v => typeof v === 'number');
            }
            return [];
          };

          switch (accOp) {
            case '$sum': {
              if (expr === 1) {
                resultDoc[outField] = groupData.docs.length;
              } else {
                const vals = extractValues();
                resultDoc[outField] = vals.reduce((acc, v) => acc + v, 0);
              }
              break;
            }
            case '$avg': {
              const vals = extractValues();
              resultDoc[outField] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
              break;
            }
            case '$min': {
              const vals = extractValues();
              resultDoc[outField] = vals.length ? Math.min(...vals) : null;
              break;
            }
            case '$max': {
              const vals = extractValues();
              resultDoc[outField] = vals.length ? Math.max(...vals) : null;
              break;
            }
            case '$first': {
              const firstDoc = groupData.docs[0];
              resultDoc[outField] = typeof expr === 'string' && expr.startsWith('$')
                ? getNestedValue(firstDoc, expr.substring(1))
                : expr;
              break;
            }
            case '$last': {
              const lastDoc = groupData.docs[groupData.docs.length - 1];
              resultDoc[outField] = typeof expr === 'string' && expr.startsWith('$')
                ? getNestedValue(lastDoc, expr.substring(1))
                : expr;
              break;
            }
            case '$push': {
              resultDoc[outField] = groupData.docs.map(d =>
                typeof expr === 'string' && expr.startsWith('$') ? getNestedValue(d, expr.substring(1)) : expr
              );
              break;
            }
            case '$addToSet': {
              const raw = groupData.docs.map(d =>
                typeof expr === 'string' && expr.startsWith('$') ? getNestedValue(d, expr.substring(1)) : expr
              );
              resultDoc[outField] = Array.from(new Set(raw.map(v => JSON.stringify(v)))).map(s => JSON.parse(s));
              break;
            }
          }
        }

        groupedResults.push(resultDoc as MongoDocument);
      }

      return groupedResults;
    }

    default:
      throw new Error(`Etapa de agregación no soportada: ${stageType}`);
  }
}
