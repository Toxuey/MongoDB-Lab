import { ParsedMongoCommand, MongoMethod } from '../../types/ast';
import { CursorOptions } from '../../types/mongo';
import { parseBsonLikeExpression } from './safe-eval';

const VALID_METHODS: MongoMethod[] = [
  'find',
  'findOne',
  'insertOne',
  'insertMany',
  'updateOne',
  'updateMany',
  'replaceOne',
  'deleteOne',
  'deleteMany',
  'countDocuments',
  'distinct',
  'aggregate',
  'createCollection',
  'drop',
  'getCollectionNames',
  'stats',
];

export function parseMongoCommand(commandStr: string): ParsedMongoCommand {
  let cleanStr = commandStr.trim().replace(/;+$/, '');

  // 1. Shell commands like "show collections" or "show tables"
  if (/^show\s+(collections|tables)$/i.test(cleanStr)) {
    return {
      raw: cleanStr,
      collection: '',
      method: 'getCollectionNames',
      cursorOptions: {},
    };
  }

  // 2. db.getCollectionNames() or db.getCollectionNames
  if (/^db\.getCollectionNames(\(\))?$/i.test(cleanStr)) {
    return {
      raw: cleanStr,
      collection: '',
      method: 'getCollectionNames',
      cursorOptions: {},
    };
  }

  // 3. Normalize db.getCollection("nombre").<method>(...) -> db.nombre.<method>(...)
  const getColRegex = /^db\.getCollection\(\s*['"]([^'"]+)['"]\s*\)\.(.*)$/s;
  const getColMatch = cleanStr.match(getColRegex);
  if (getColMatch) {
    cleanStr = `db.${getColMatch[1]}.${getColMatch[2]}`;
  }

  if (!cleanStr.startsWith('db.')) {
    throw new Error("El comando debe iniciar con 'db.<colección>.<método>()', 'db.createCollection()' o 'show collections'. Ejemplo: db.usuarios.find()");
  }

  // Split into method calls: db.collection.method(...).chained(...) or db.createCollection(...)
  const firstParenIndex = cleanStr.indexOf('(');
  if (firstParenIndex === -1) {
    throw new Error('Comando incompleto: faltan los paréntesis de ejecución.');
  }

  const prefix = cleanStr.substring(0, firstParenIndex);
  const prefixParts = prefix.split('.');

  let collection = '';
  let method: MongoMethod;

  if (prefixParts.length === 2 && prefixParts[1].trim() === 'createCollection') {
    method = 'createCollection';
  } else if (prefixParts.length === 2 && prefixParts[1].trim() === 'getCollectionNames') {
    return {
      raw: cleanStr,
      collection: '',
      method: 'getCollectionNames',
      cursorOptions: {},
    };
  } else if (prefixParts.length === 3) {
    collection = prefixParts[1].trim();
    method = prefixParts[2].trim() as MongoMethod;
  } else {
    throw new Error("Formato esperado: 'db.<colección>.<método>()' o 'db.createCollection(\"nombre\")'.");
  }

  if (!VALID_METHODS.includes(method)) {
    throw new Error(`Método no soportado: '${method}'. Métodos válidos: ${VALID_METHODS.join(', ')}.`);
  }

  // Extract primary arguments and chained calls
  let depth = 0;
  let primaryArgsEnd = -1;

  for (let i = firstParenIndex; i < cleanStr.length; i++) {
    const char = cleanStr[i];
    if (char === '(') depth++;
    else if (char === ')') {
      depth--;
      if (depth === 0) {
        primaryArgsEnd = i;
        break;
      }
    }
  }

  if (primaryArgsEnd === -1) {
    throw new Error('Paréntesis sin cerrar en los argumentos de la función.');
  }

  const primaryArgsStr = cleanStr.substring(firstParenIndex + 1, primaryArgsEnd).trim();
  const chainedStr = cleanStr.substring(primaryArgsEnd + 1).trim();

  // Parse arguments by splitting top-level commas
  const rawArgs = splitArguments(primaryArgsStr);
  const parsedArgs = rawArgs.map(arg => parseBsonLikeExpression(arg));

  const cursorOptions: CursorOptions = {};

  // Parse chained calls (e.g. .sort({ edad: -1 }).limit(10).skip(5).project({ nombre: 1 }))
  if (chainedStr) {
    const chainRegex = /\.(sort|limit|skip|project)\s*\((.*?)\)/g;
    let match;
    while ((match = chainRegex.exec(chainedStr)) !== null) {
      const chainMethod = match[1];
      const chainArgStr = match[2].trim();
      const chainArg = chainArgStr ? parseBsonLikeExpression(chainArgStr) : undefined;

      switch (chainMethod) {
        case 'sort':
          cursorOptions.sort = chainArg;
          break;
        case 'limit':
          cursorOptions.limit = Number(chainArg);
          break;
        case 'skip':
          cursorOptions.skip = Number(chainArg);
          break;
        case 'project':
          cursorOptions.projection = chainArg;
          break;
      }
    }
  }

  const result: ParsedMongoCommand = {
    raw: cleanStr,
    collection,
    method,
    cursorOptions,
  };

  switch (method) {
    case 'find':
      result.filter = parsedArgs[0] || {};
      if (parsedArgs[1] && typeof parsedArgs[1] === 'object') {
        cursorOptions.projection = { ...cursorOptions.projection, ...parsedArgs[1] };
      }
      break;

    case 'findOne':
      result.filter = parsedArgs[0] || {};
      if (parsedArgs[1] && typeof parsedArgs[1] === 'object') {
        cursorOptions.projection = { ...cursorOptions.projection, ...parsedArgs[1] };
      }
      break;

    case 'countDocuments':
      result.filter = parsedArgs[0] || {};
      break;

    case 'distinct':
      result.distinctField = typeof parsedArgs[0] === 'string' ? parsedArgs[0] : '';
      result.filter = parsedArgs[1] || {};
      break;

    case 'insertOne':
      if (!parsedArgs[0] || typeof parsedArgs[0] !== 'object') {
        throw new Error('insertOne requiere un objeto documento como primer argumento.');
      }
      result.document = parsedArgs[0];
      break;

    case 'insertMany':
      if (!Array.isArray(parsedArgs[0])) {
        throw new Error('insertMany requiere un array de documentos como argumento.');
      }
      result.documents = parsedArgs[0];
      break;

    case 'updateOne':
    case 'updateMany':
      result.filter = parsedArgs[0] || {};
      if (!parsedArgs[1] || typeof parsedArgs[1] !== 'object') {
        throw new Error(`${method} requiere un documento de actualización con operadores como $set o $inc.`);
      }
      result.updateDoc = parsedArgs[1];
      break;

    case 'replaceOne':
      result.filter = parsedArgs[0] || {};
      if (!parsedArgs[1] || typeof parsedArgs[1] !== 'object') {
        throw new Error('replaceOne requiere un documento de reemplazo como segundo argumento.');
      }
      result.document = parsedArgs[1];
      break;

    case 'deleteOne':
    case 'deleteMany':
      result.filter = parsedArgs[0] || {};
      break;

    case 'aggregate':
      if (!Array.isArray(parsedArgs[0])) {
        throw new Error('aggregate requiere un array de etapas ([ { $match: ... }, { $group: ... } ]).');
      }
      result.pipeline = parsedArgs[0];
      break;

    case 'createCollection': {
      const colNameArg = parsedArgs[0];
      const targetName = typeof colNameArg === 'string' ? colNameArg.trim() : String(colNameArg || '').trim();
      if (!targetName) {
        throw new Error('db.createCollection() requiere el nombre de la colección como primer argumento. Ejemplo: db.createCollection("articulos")');
      }
      result.collection = targetName;
      if (parsedArgs[1] && typeof parsedArgs[1] === 'object') {
        result.document = parsedArgs[1];
      }
      break;
    }

    case 'drop':
    case 'stats':
    case 'getCollectionNames':
      break;
  }

  return result;
}

function splitArguments(argsStr: string): string[] {
  if (!argsStr) return [];
  const args: string[] = [];
  let depthBraces = 0;
  let depthBrackets = 0;
  let depthParens = 0;
  let inString = false;
  let quoteChar = '';
  let currentArg = '';

  for (let i = 0; i < argsStr.length; i++) {
    const char = argsStr[i];

    if ((char === '"' || char === "'") && argsStr[i - 1] !== '\\') {
      if (!inString) {
        inString = true;
        quoteChar = char;
      } else if (quoteChar === char) {
        inString = false;
      }
    }

    if (!inString) {
      if (char === '{') depthBraces++;
      else if (char === '}') depthBraces--;
      else if (char === '[') depthBrackets++;
      else if (char === ']') depthBrackets--;
      else if (char === '(') depthParens++;
      else if (char === ')') depthParens--;
      else if (char === ',' && depthBraces === 0 && depthBrackets === 0 && depthParens === 0) {
        args.push(currentArg.trim());
        currentArg = '';
        continue;
      }
    }

    currentArg += char;
  }

  if (currentArg.trim()) {
    args.push(currentArg.trim());
  }

  return args;
}
