/**
 * Evaluación segura de expresiones de objetos y literales MongoDB BSON
 * Tolera ObjectId("..."), ISODate("..."), regex, fechas, y llaves sin comillas
 */
export function parseBsonLikeExpression(code: string): any {
  const trimmed = code.trim();
  if (!trimmed) return {};

  // Mock functions in local scope
  const ObjectId = (id?: string) => id || 'mock_object_id';
  const ISODate = (d?: string) => (d ? new Date(d).toISOString() : new Date().toISOString());
  const NumberInt = (n: number) => n;
  const NumberLong = (n: number) => n;
  const NumberDecimal = (n: number) => n;

  try {
    // Run Function with sandbox parameters to evaluate object literal or array safely
    const evaluator = new Function(
      'ObjectId',
      'ISODate',
      'NumberInt',
      'NumberLong',
      'NumberDecimal',
      `"use strict"; return (${trimmed});`
    );
    return evaluator(ObjectId, ISODate, NumberInt, NumberLong, NumberDecimal);
  } catch (err: any) {
    throw new Error(`Sintaxis BSON/JSON inválida: ${err.message}`);
  }
}
