import { StepEvaluation } from '../../types/mongo';

export function evaluateOperator(
  actual: any,
  op: string,
  expected: any,
  field: string
): StepEvaluation {
  let passed = false;
  let description = '';

  switch (op) {
    case '$eq':
      if (Array.isArray(actual)) {
        passed = actual.includes(expected) || JSON.stringify(actual) === JSON.stringify(expected);
      } else {
        passed = actual === expected || JSON.stringify(actual) === JSON.stringify(expected);
      }
      description = `${field} === ${JSON.stringify(expected)} (${passed ? 'TRUE' : 'FALSE'})`;
      break;

    case '$ne':
      if (Array.isArray(actual)) {
        passed = !actual.includes(expected);
      } else {
        passed = actual !== expected && JSON.stringify(actual) !== JSON.stringify(expected);
      }
      description = `${field} !== ${JSON.stringify(expected)} (${passed ? 'TRUE' : 'FALSE'})`;
      break;

    case '$gt':
      passed = actual > expected;
      description = `${field} (${actual}) > ${expected} (${passed ? 'TRUE' : 'FALSE'})`;
      break;

    case '$gte':
      passed = actual >= expected;
      description = `${field} (${actual}) >= ${expected} (${passed ? 'TRUE' : 'FALSE'})`;
      break;

    case '$lt':
      passed = actual < expected;
      description = `${field} (${actual}) < ${expected} (${passed ? 'TRUE' : 'FALSE'})`;
      break;

    case '$lte':
      passed = actual <= expected;
      description = `${field} (${actual}) <= ${expected} (${passed ? 'TRUE' : 'FALSE'})`;
      break;

    case '$in':
      if (Array.isArray(expected)) {
        if (Array.isArray(actual)) {
          passed = actual.some(item => expected.includes(item));
        } else {
          passed = expected.includes(actual);
        }
      }
      description = `${field} (${JSON.stringify(actual)}) en [${expected.join(', ')}] (${passed ? 'TRUE' : 'FALSE'})`;
      break;

    case '$nin':
      if (Array.isArray(expected)) {
        if (Array.isArray(actual)) {
          passed = !actual.some(item => expected.includes(item));
        } else {
          passed = !expected.includes(actual);
        }
      }
      description = `${field} (${JSON.stringify(actual)}) no en [${expected.join(', ')}] (${passed ? 'TRUE' : 'FALSE'})`;
      break;

    case '$exists':
      const exists = actual !== undefined;
      passed = expected ? exists : !exists;
      description = `${field} ${expected ? 'existe' : 'no existe'} (${passed ? 'TRUE' : 'FALSE'})`;
      break;

    case '$regex':
      try {
        const regex = expected instanceof RegExp ? expected : new RegExp(expected, 'i');
        passed = typeof actual === 'string' && regex.test(actual);
        description = `${field} coincide con patrón ${regex.toString()} (${passed ? 'TRUE' : 'FALSE'})`;
      } catch {
        passed = false;
        description = `Error evaluando expresión regular en ${field}`;
      }
      break;

    case '$size':
      passed = Array.isArray(actual) && actual.length === expected;
      description = `Longitud de ${field} (${Array.isArray(actual) ? actual.length : 0}) === ${expected} (${passed ? 'TRUE' : 'FALSE'})`;
      break;

    default:
      passed = false;
      description = `Operador desconocido: ${op}`;
  }

  return {
    field,
    operator: op,
    expected,
    actual,
    passed,
    description,
  };
}
