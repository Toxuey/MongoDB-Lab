import React from 'react';

const MONGO_METHODS = new Set([
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
  'sort',
  'limit',
  'skip',
  'project',
]);

// Paleta Rainbow para paréntesis, llaves y corchetes
const RAINBOW_BRACKETS = [
  'text-amber-400 font-bold',     // Nivel 0 / 4: Dorado / Ámbar
  'text-purple-400 font-bold',    // Nivel 1 / 5: Violeta / Púrpura
  'text-sky-400 font-bold',       // Nivel 2 / 6: Celeste / Cyan
  'text-[#00ED64] font-bold',     // Nivel 3 / 7: Verde esmeralda
];

export const MongoCodeHighlight: React.FC<{ code: string }> = ({ code }) => {
  const renderedElements = React.useMemo(() => {
    // Regex para descomponer tokens: strings, números, operadores con $, palabras, corchetes/llaves/paréntesis y puntuación
    const tokenRegex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\/\/[^\n]*|\b-?\d+(?:\.\d+)?\b|\$[a-zA-Z0-9_]+|\b[a-zA-Z_][a-zA-Z0-9_]*\b|[{}()[\]]|[:.,;]|\s+|[^\s\w])/g;

    const matches = code.match(tokenRegex) || [code];
    let bracketDepth = 0;

    return matches.map((token, index) => {
      // 1. Espacios y saltos de línea
      if (/^\s+$/.test(token)) {
        return <span key={index}>{token}</span>;
      }

      // 2. Comentarios
      if (token.startsWith('//')) {
        return (
          <span key={index} className="text-neutral-500 italic">
            {token}
          </span>
        );
      }

      // 3. Cadenas de texto
      if (token.startsWith('"') || token.startsWith("'")) {
        // Si dentro de comillas es un operador como "$categoria" o "$sum"
        const inner = token.slice(1, -1);
        if (inner.startsWith('$')) {
          return (
            <span key={index} className="text-fuchsia-400 font-medium">
              {token}
            </span>
          );
        }
        return (
          <span key={index} className="text-amber-300 font-normal">
            {token}
          </span>
        );
      }

      // 4. Operadores de MongoDB que inician con $ (ej: $gte, $match, $group, $set)
      if (token.startsWith('$')) {
        return (
          <span key={index} className="text-purple-400 font-semibold">
            {token}
          </span>
        );
      }

      // 5. Números
      if (/^-?\d+(\.\d+)?$/.test(token)) {
        return (
          <span key={index} className="text-orange-400 font-mono">
            {token}
          </span>
        );
      }

      // 6. Booleans y null
      if (token === 'true' || token === 'false' || token === 'null') {
        return (
          <span key={index} className="text-rose-400 font-semibold">
            {token}
          </span>
        );
      }

      // 7. Objeto raíz "db"
      if (token === 'db' || token === 'show') {
        return (
          <span key={index} className="text-sky-400 font-bold">
            {token}
          </span>
        );
      }

      // 8. Métodos nativos de MongoDB
      if (MONGO_METHODS.has(token)) {
        return (
          <span key={index} className="text-yellow-300 font-semibold">
            {token}
          </span>
        );
      }

      // 9. Nombres de colecciones conocidas
      if (token === 'usuarios' || token === 'peliculas' || token === 'productos' || token === 'pedidos' || token === 'collections') {
        return (
          <span key={index} className="text-teal-300 font-medium">
            {token}
          </span>
        );
      }

      // 10. Rainbow Brackets (paréntesis, llaves, corchetes)
      if (token === '{' || token === '(' || token === '[') {
        const colorClass = RAINBOW_BRACKETS[bracketDepth % RAINBOW_BRACKETS.length];
        bracketDepth++;
        return (
          <span key={index} className={colorClass}>
            {token}
          </span>
        );
      }

      if (token === '}' || token === ')' || token === ']') {
        bracketDepth = Math.max(0, bracketDepth - 1);
        const colorClass = RAINBOW_BRACKETS[bracketDepth % RAINBOW_BRACKETS.length];
        return (
          <span key={index} className={colorClass}>
            {token}
          </span>
        );
      }

      // 11. Puntuación (: , .)
      if (token === ':') {
        return (
          <span key={index} className="text-neutral-400 font-bold mx-0.5">
            :
          </span>
        );
      }
      if (token === '.') {
        return (
          <span key={index} className="text-neutral-500">
            .
          </span>
        );
      }
      if (token === ',') {
        return (
          <span key={index} className="text-neutral-500">
            ,
          </span>
        );
      }

      // 12. Nombres de campo / identificadores genéricos
      return (
        <span key={index} className="text-neutral-200">
          {token}
        </span>
      );
    });
  }, [code]);

  return <>{renderedElements}</>;
};
