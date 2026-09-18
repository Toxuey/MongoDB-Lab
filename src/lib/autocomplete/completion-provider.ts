import type { Monaco } from '@monaco-editor/react';
import { MongoDatabase } from '../../types/mongo';
import { MONGO_METHODS, MONGO_OPERATORS, extractFieldsFromCollection } from './monaco-mongodb';

export function createMongoCompletionProvider(monaco: Monaco, getDatabase: () => MongoDatabase, getSelectedCollection: () => string) {
  return {
    triggerCharacters: ['.', '$', '{', ' ', ':', '"'],
    provideCompletionItems: (model: any, position: any) => {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions: any[] = [];
      const db = getDatabase();
      const collections = Object.keys(db.collections);

      // 1. Trigger "db." -> suggest database methods and collections
      if (/db\.$/.test(textUntilPosition) || /db\.\w*$/.test(textUntilPosition)) {
        const snippetRule = monaco.languages.CompletionItemInsertTextRule?.InsertAsSnippet ?? 4;

        suggestions.push(
          {
            label: 'createCollection',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'createCollection("${1:nombre}")',
            insertTextRules: snippetRule,
            detail: 'db.createCollection(nombre)',
            documentation: 'Crea una nueva colección en la base de datos.',
            range,
          },
          {
            label: 'getCollectionNames',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'getCollectionNames()',
            detail: 'db.getCollectionNames()',
            documentation: 'Devuelve un array con los nombres de todas las colecciones.',
            range,
          },
          {
            label: 'getCollection',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'getCollection("${1:nombre}")',
            insertTextRules: snippetRule,
            detail: 'db.getCollection(nombre)',
            documentation: 'Devuelve la colección para ejecutar operaciones sobre ella.',
            range,
          }
        );

        collections.forEach(colName => {
          suggestions.push({
            label: colName,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: colName,
            detail: `Colección (${db.collections[colName].documents.length} documentos)`,
            range,
          });
        });
        return { suggestions };
      }

      // 2. Trigger "db.<collection>." -> suggest methods
      const colMethodMatch = textUntilPosition.match(/db\.([a-zA-Z0-9_-]+)\.\w*$/);
      if (colMethodMatch && !['createCollection', 'getCollectionNames'].includes(colMethodMatch[1])) {
        MONGO_METHODS.forEach(m => {
          suggestions.push({
            label: m.label,
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: `${m.label}()`,
            detail: 'Método de colección',
            documentation: m.doc,
            range,
          });
        });
        return { suggestions };
      }

      // 3. Inside query object -> suggest fields and operators
      const selectedColName = getSelectedCollection();
      const activeCol = db.collections[selectedColName];

      if (activeCol) {
        const fields = extractFieldsFromCollection(activeCol);
        fields.forEach(field => {
          suggestions.push({
            label: field,
            kind: monaco.languages.CompletionItemKind.Field,
            insertText: field,
            detail: `Campo en ${selectedColName}`,
            range,
          });
        });
      }

      // Operators
      MONGO_OPERATORS.forEach(op => {
        suggestions.push({
          label: op.label,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: op.label,
          detail: 'Operador MongoDB',
          documentation: op.doc,
          range,
        });
      });

      return { suggestions };
    },
  };
}
