/**
 * Formateador de consultas y scripts MongoDB.
 * Ajusta indentación, saltos y espacios en operadores y objetos anidados.
 */
export function formatMongoCommand(code: string, indentSpaces = 2): string {
  if (!code || !code.trim()) return code;

  const lines = code.split(/\r?\n/);
  const formattedLines: string[] = [];
  const indentStep = ' '.repeat(indentSpaces);
  let depth = 0;
  let inBlockComment = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      formattedLines.push('');
      continue;
    }

    if (inBlockComment) {
      if (trimmed.includes('*/')) {
        inBlockComment = false;
      }
      formattedLines.push(indentStep.repeat(depth) + trimmed);
      continue;
    }

    if (trimmed.startsWith('/*')) {
      if (!trimmed.includes('*/')) {
        inBlockComment = true;
      }
      formattedLines.push(indentStep.repeat(depth) + trimmed);
      continue;
    }

    // Identificar caracteres de cierre iniciales fuera de cadenas/comentarios
    let inStr = false;
    let strChar = '';
    let isLineComment = false;
    let leadingClosings = 0;
    let isLeading = true;

    for (let j = 0; j < trimmed.length; j++) {
      const char = trimmed[j];
      const next = trimmed[j + 1];

      if (isLineComment) break;

      if (inStr) {
        if (char === '\\') {
          j++;
        } else if (char === strChar) {
          inStr = false;
        }
        continue;
      }

      if (char === '/' && next === '/') {
        isLineComment = true;
        break;
      }

      if (char === '"' || char === "'" || char === '`') {
        inStr = true;
        strChar = char;
        isLeading = false;
        continue;
      }

      if (isLeading) {
        if (char === '}' || char === ']' || char === ')') {
          leadingClosings++;
        } else if (char !== ' ' && char !== '\t' && char !== ',' && char !== ';') {
          isLeading = false;
        }
      }
    }

    // Nivel de indentación para la línea actual
    const lineDepth = Math.max(0, depth - leadingClosings);
    const indent = indentStep.repeat(lineDepth);

    // Formatear espacios dentro de la línea (fuera de strings y comentarios)
    let formattedLine = '';
    inStr = false;
    strChar = '';
    isLineComment = false;

    for (let j = 0; j < trimmed.length; j++) {
      const char = trimmed[j];
      const next = trimmed[j + 1];

      if (isLineComment) {
        formattedLine += char;
        continue;
      }

      if (inStr) {
        formattedLine += char;
        if (char === '\\') {
          j++;
          if (j < trimmed.length) formattedLine += trimmed[j];
        } else if (char === strChar) {
          inStr = false;
        }
        continue;
      }

      if (char === '/' && next === '/') {
        isLineComment = true;
        formattedLine += char;
        continue;
      }

      if (char === '"' || char === "'" || char === '`') {
        inStr = true;
        strChar = char;
        formattedLine += char;
        continue;
      }

      // Espacio después de dos puntos (ej: campo: valor)
      if (char === ':') {
        formattedLine += ':';
        if (next && next !== ' ' && next !== '\t') {
          formattedLine += ' ';
        }
        continue;
      }

      // Espacio después de coma (ej: a, b)
      if (char === ',') {
        formattedLine += ',';
        if (next && next !== ' ' && next !== '\t') {
          formattedLine += ' ';
        }
        continue;
      }

      formattedLine += char;
    }

    formattedLines.push(indent + formattedLine);

    // Calcular cambio neto de profundidad para las líneas siguientes
    inStr = false;
    strChar = '';
    isLineComment = false;
    let netChange = 0;

    const bracketTokens: string[] = [];
    for (let j = 0; j < trimmed.length; j++) {
      const char = trimmed[j];
      const next = trimmed[j + 1];

      if (isLineComment) break;

      if (inStr) {
        if (char === '\\') {
          j++;
        } else if (char === strChar) {
          inStr = false;
        }
        continue;
      }

      if (char === '/' && next === '/') {
        isLineComment = true;
        break;
      }

      if (char === '"' || char === "'" || char === '`') {
        inStr = true;
        strChar = char;
        continue;
      }

      if (char === '{' || char === '[' || char === '(' || char === '}' || char === ']' || char === ')') {
        bracketTokens.push(char);
      }
    }

    for (let k = 0; k < bracketTokens.length; k++) {
      const b = bracketTokens[k];
      const nextB = bracketTokens[k + 1];

      // Compresión de apertura combinada al final de línea (ej: find({ o aggregate([)
      if (b === '(' && (nextB === '{' || nextB === '[') && k === bracketTokens.length - 2) {
        netChange++;
        k++;
      } else if ((b === '}' || b === ']') && nextB === ')' && k === 0 && bracketTokens.length === 2) {
        netChange--;
        k++;
      } else if (b === '{' || b === '[' || b === '(') {
        netChange++;
      } else if (b === '}' || b === ']' || b === ')') {
        netChange--;
      }
    }

    depth = Math.max(0, depth + netChange);
  }

  return formattedLines.join('\n');
}
