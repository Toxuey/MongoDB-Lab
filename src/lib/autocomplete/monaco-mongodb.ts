import type { Monaco } from '@monaco-editor/react';
import { MongoCollection } from '../../types/mongo';
import { formatMongoCommand } from '../formatter/mongo-formatter';

export const MONGO_METHODS = [
  { label: 'find', doc: 'Selecciona documentos en una colección o vista y devuelve un cursor.' },
  { label: 'findOne', doc: 'Devuelve un único documento que satisface los criterios de consulta especificados.' },
  { label: 'insertOne', doc: 'Inserta un nuevo documento en la colección.' },
  { label: 'insertMany', doc: 'Inserta múltiples documentos en la colección.' },
  { label: 'updateOne', doc: 'Actualiza el primer documento que coincide con el filtro.' },
  { label: 'updateMany', doc: 'Actualiza todos los documentos que coinciden con el filtro.' },
  { label: 'replaceOne', doc: 'Reemplaza completamente un documento que coincide con el filtro.' },
  { label: 'deleteOne', doc: 'Elimina el primer documento que coincide con el filtro.' },
  { label: 'deleteMany', doc: 'Elimina todos los documentos que coinciden con el filtro.' },
  { label: 'countDocuments', doc: 'Cuenta el número de documentos que coinciden con el filtro.' },
  { label: 'distinct', doc: 'Encuentra los valores distintos para un campo específico a través de una colección.' },
  { label: 'aggregate', doc: 'Ejecuta un pipeline de agregación para transformar y calcular datos.' },
  { label: 'drop', doc: 'Elimina la colección completa de la base de datos.' },
  { label: 'stats', doc: 'Devuelve métricas, conteos y estadísticas de almacenamiento de la colección.' },
];

export const MONGO_OPERATORS = [
  { label: '$eq', doc: 'Coincide con valores que son iguales a un valor especificado.' },
  { label: '$ne', doc: 'Coincide con todos los valores que no son iguales al valor especificado.' },
  { label: '$gt', doc: 'Coincide con valores que son mayores que el valor especificado.' },
  { label: '$gte', doc: 'Coincide con valores que son mayores o iguales al valor especificado.' },
  { label: '$lt', doc: 'Coincide con valores que son menores que el valor especificado.' },
  { label: '$lte', doc: 'Coincide con valores que son menores o iguales al valor especificado.' },
  { label: '$in', doc: 'Coincide con cualquiera de los valores especificados en un array.' },
  { label: '$nin', doc: 'No coincide con ninguno de los valores especificados en un array.' },
  { label: '$exists', doc: 'Coincide con documentos que tienen el campo especificado.' },
  { label: '$regex', doc: 'Selecciona documentos donde los valores coinciden con una expresión regular.' },
  { label: '$size', doc: 'Selecciona documentos si el array tiene el número especificado de elementos.' },
  { label: '$elemMatch', doc: 'Selecciona documentos si el elemento del array coincide con todos los criterios.' },
  { label: '$and', doc: 'Une cláusulas de consulta con un Y lógico.' },
  { label: '$or', doc: 'Une cláusulas de consulta con un O lógico.' },
  { label: '$not', doc: 'Invierte el efecto de una expresión de consulta.' },
  { label: '$set', doc: 'Establece el valor de un campo en un documento.' },
  { label: '$inc', doc: 'Incrementa el valor de un campo por la cantidad especificada.' },
  { label: '$unset', doc: 'Elimina el campo especificado de un documento.' },
  { label: '$push', doc: 'Agrega un elemento a un array.' },
  { label: '$pull', doc: 'Elimina elementos de un array que coinciden con el valor o condición.' },
  { label: '$match', doc: 'Filtra los documentos para pasar solo los que coinciden al siguiente paso.' },
  { label: '$group', doc: 'Agrupa documentos de entrada por la expresión de identificador especificada.' },
  { label: '$project', doc: 'Pasa los documentos con los campos solicitados o calculados.' },
  { label: '$sort', doc: 'Reordena todos los documentos de entrada según la clave de ordenamiento.' },
  { label: '$limit', doc: 'Pasa los primeros n documentos sin modificación al pipeline.' },
  { label: '$skip', doc: 'Omite los primeros n documentos y pasa el resto.' },
  { label: '$unwind', doc: 'Deconstruye un campo de array para generar un documento por cada elemento.' },
  { label: '$count', doc: 'Pasa un documento con el recuento total de documentos entrantes.' },
];

export function extractFieldsFromCollection(collection: MongoCollection): string[] {
  const fields = new Set<string>();

  const traverse = (obj: any, prefix = '') => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;
    for (const key of Object.keys(obj)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      fields.add(fullPath);
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        traverse(obj[key], fullPath);
      }
    }
  };

  // Inspect first 10 documents
  collection.documents.slice(0, 10).forEach(doc => traverse(doc));
  return Array.from(fields);
}

let registered = false;

export function registerMongoLanguage(monaco: Monaco) {
  if (registered) return;
  registered = true;

  monaco.languages.register({ id: 'mongodb' });

  monaco.languages.setLanguageConfiguration('mongodb', {
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/'],
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"', notIn: ['string'] },
      { open: "'", close: "'", notIn: ['string', 'comment'] },
      { open: '`', close: '`', notIn: ['string', 'comment'] },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: '`', close: '`' },
    ],
    indentationRules: {
      increaseIndentPattern: /^.*(\{[^}]*|\[[^\]]*|\([^)]*)\s*$/,
      decreaseIndentPattern: /^(.*\*\/)?\s*[\}\]\)].*$/,
    },
    onEnterRules: [
      {
        beforeText: /^\s*.*[\{\(\[]\s*$/,
        afterText: /^\s*[\}\)\]].*$/,
        action: { indentAction: monaco.languages.IndentAction.IndentOutdent },
      },
      {
        beforeText: /^.*[\{\(\[]\s*$/,
        action: { indentAction: monaco.languages.IndentAction.Indent },
      },
      {
        beforeText: /^\s*([a-zA-Z_$][\w$]*|"[^"]*"|'[^']*')\s*:\s*[\{\(\[]\s*$/,
        action: { indentAction: monaco.languages.IndentAction.Indent },
      },
    ],
  });

  monaco.languages.registerDocumentFormattingEditProvider('mongodb', {
    provideDocumentFormattingEdits(model: any) {
      const text = model.getValue();
      const formatted = formatMongoCommand(text);
      return [
        {
          range: model.getFullModelRange(),
          text: formatted,
        },
      ];
    },
  });

  monaco.languages.setMonarchTokensProvider('mongodb', {
    keywords: ['find', 'findOne', 'insertOne', 'insertMany', 'updateOne', 'updateMany', 'deleteOne', 'deleteMany', 'aggregate', 'sort', 'limit', 'skip', 'project', 'countDocuments', 'distinct'],
    typeKeywords: ['ObjectId', 'ISODate', 'NumberInt', 'NumberLong', 'NumberDecimal'],
    operators: ['$', ':', ',', '.', '{', '}', '[', ']'],
    tokenizer: {
      root: [
        [/db\b/, 'keyword'],
        [/\$[a-zA-Z0-9_]+/, 'variable.predefined'],
        [/[a-zA-Z_]\w*/, {
          cases: {
            '@keywords': 'keyword',
            '@typeKeywords': 'type',
            '@default': 'identifier'
          }
        }],
        [/[{}()\[\]]/, '@brackets'],
        [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
        [/\d+/, 'number'],
        [/"([^"\\]|\\.)*"/, 'string'],
        [/'([^'\\]|\\.)*'/, 'string'],
        [/\/\/.*$/, 'comment'],
        [/\/\*/, 'comment', '@comment'],
      ],
      comment: [
        [/[^\/*]+/, 'comment'],
        [/\*\//, 'comment', '@pop'],
        [/[\/*]/, 'comment']
      ]
    }
  });

  // Define themes
  monaco.editor.defineTheme('mongodb-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '00ED64', fontStyle: 'bold' },
      { token: 'variable.predefined', foreground: '56B6C2' },
      { token: 'string', foreground: '98C379' },
      { token: 'number', foreground: 'D19A66' },
      { token: 'type', foreground: 'E5C07B' },
      { token: 'comment', foreground: '5C6370', fontStyle: 'italic' },
    ],
    colors: {
      'editor.background': '#0a0a0a',
      'editor.foreground': '#E5E7EB',
      'editorCursor.foreground': '#00ED64',
      'editor.lineHighlightBackground': '#171717',
      'editorLineNumber.foreground': '#525252',
      'editorLineNumber.activeForeground': '#00ED64',
    }
  });

  monaco.editor.defineTheme('mongodb-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '00684A', fontStyle: 'bold' },
      { token: 'variable.predefined', foreground: '0184BC' },
      { token: 'string', foreground: '50A14F' },
      { token: 'number', foreground: '986801' },
      { token: 'type', foreground: 'C18401' },
      { token: 'comment', foreground: 'A0A1A7', fontStyle: 'italic' },
    ],
    colors: {
      'editor.background': '#F9FAFB',
      'editor.foreground': '#111827',
      'editorCursor.foreground': '#00684A',
      'editor.lineHighlightBackground': '#F3F4F6',
      'editorLineNumber.foreground': '#9CA3AF',
      'editorLineNumber.activeForeground': '#00684A',
    }
  });
}
