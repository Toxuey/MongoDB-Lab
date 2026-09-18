import { MongoDocument, StepEvaluation, DocumentExplanation } from '../../types/mongo';
import { getNestedValue } from './path-utils';
import { evaluateOperator } from './operators';

export function matchDocument(
  doc: MongoDocument,
  filter: Record<string, any>
): { matches: boolean; steps: StepEvaluation[] } {
  if (!filter || Object.keys(filter).length === 0) {
    return {
      matches: true,
      steps: [
        {
          field: '*',
          operator: 'VACIO',
          expected: '{}',
          actual: 'doc',
          passed: true,
          description: 'Sin filtro: todos los documentos coinciden (TRUE)',
        },
      ],
    };
  }

  const steps: StepEvaluation[] = [];
  let overallPassed = true;

  for (const key of Object.keys(filter)) {
    const condition = filter[key];

    // Logical operators
    if (key === '$and' && Array.isArray(condition)) {
      let andPassed = true;
      for (const subFilter of condition) {
        const res = matchDocument(doc, subFilter);
        steps.push(...res.steps);
        if (!res.matches) andPassed = false;
      }
      if (!andPassed) overallPassed = false;
      continue;
    }

    if (key === '$or' && Array.isArray(condition)) {
      let orPassed = false;
      const orSteps: StepEvaluation[] = [];
      for (const subFilter of condition) {
        const res = matchDocument(doc, subFilter);
        orSteps.push(...res.steps);
        if (res.matches) {
          orPassed = true;
          break;
        }
      }
      steps.push(...orSteps);
      steps.push({
        field: '$or',
        operator: '$or',
        expected: 'Al menos una condición verdadera',
        actual: orPassed,
        passed: orPassed,
        description: `$or evaluado: ${orPassed ? 'CUMPLE (TRUE)' : 'NO CUMPLE (FALSE)'}`,
      });
      if (!orPassed) overallPassed = false;
      continue;
    }

    if (key === '$not' && typeof condition === 'object') {
      const res = matchDocument(doc, condition);
      const notPassed = !res.matches;
      steps.push({
        field: '$not',
        operator: '$not',
        expected: '!condicion',
        actual: notPassed,
        passed: notPassed,
        description: `$not evaluado: ${notPassed ? 'TRUE' : 'FALSE'}`,
      });
      if (!notPassed) overallPassed = false;
      continue;
    }

    // Normal field evaluation
    const actualValue = getNestedValue(doc, key);

    if (condition !== null && typeof condition === 'object' && !Array.isArray(condition) && !(condition instanceof RegExp)) {
      const conditionKeys = Object.keys(condition);
      const isOperatorObj = conditionKeys.some(k => k.startsWith('$'));

      if (isOperatorObj) {
        for (const op of conditionKeys) {
          if (op === '$elemMatch') {
            const elemSubFilter = condition[op];
            let elemPassed = false;
            if (Array.isArray(actualValue)) {
              elemPassed = actualValue.some(item => matchDocument(item, elemSubFilter).matches);
            }
            const step: StepEvaluation = {
              field: key,
              operator: '$elemMatch',
              expected: elemSubFilter,
              actual: actualValue,
              passed: elemPassed,
              description: `${key} $elemMatch: ${elemPassed ? 'TRUE' : 'FALSE'}`,
            };
            steps.push(step);
            if (!elemPassed) overallPassed = false;
          } else {
            const step = evaluateOperator(actualValue, op, condition[op], key);
            steps.push(step);
            if (!step.passed) overallPassed = false;
          }
        }
      } else {
        // Deep equality comparison
        const passed = JSON.stringify(actualValue) === JSON.stringify(condition);
        steps.push({
          field: key,
          operator: '$eq',
          expected: condition,
          actual: actualValue,
          passed,
          description: `${key} coincide con objeto exacto (${passed ? 'TRUE' : 'FALSE'})`,
        });
        if (!passed) overallPassed = false;
      }
    } else if (condition instanceof RegExp) {
      const step = evaluateOperator(actualValue, '$regex', condition, key);
      steps.push(step);
      if (!step.passed) overallPassed = false;
    } else {
      // Direct equality
      const step = evaluateOperator(actualValue, '$eq', condition, key);
      steps.push(step);
      if (!step.passed) overallPassed = false;
    }
  }

  return { matches: overallPassed, steps };
}

export function explainDocumentEvaluation(
  doc: MongoDocument,
  filter: Record<string, any>
): DocumentExplanation {
  const { matches, steps } = matchDocument(doc, filter);
  return {
    docId: doc._id,
    matches,
    steps,
    summary: matches
      ? `Documento ${doc._id}: Coincide con todos los criterios de la consulta`
      : `Documento ${doc._id}: Descartado (falló en ${steps.filter(s => !s.passed).map(s => s.field).join(', ')})`,
  };
}
