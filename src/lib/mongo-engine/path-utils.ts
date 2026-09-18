export function getNestedValue(obj: any, path: string): any {
  if (!obj || typeof obj !== 'object') return undefined;
  if (path in obj) return obj[path];

  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length; i++) {
    if (current === null || current === undefined) return undefined;
    const part = parts[i];

    if (Array.isArray(current) && !isNaN(Number(part))) {
      current = current[Number(part)];
    } else if (Array.isArray(current)) {
      // If current is array of objects, map remaining path
      const restPath = parts.slice(i).join('.');
      return current.map(item => getNestedValue(item, restPath)).flat();
    } else {
      current = current[part];
    }
  }

  return current;
}

export function setNestedValue(obj: any, path: string, value: any): void {
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object' || current[part] === null) {
      current[part] = {};
    }
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
}

export function deleteNestedValue(obj: any, path: string): void {
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object') return;
    current = current[part];
  }

  delete current[parts[parts.length - 1]];
}
