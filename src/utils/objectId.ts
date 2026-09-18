let counter = Math.floor(Math.random() * 0xffffff);

export function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const machineAndProcess = Math.floor(Math.random() * 0xffffffffff).toString(16).padStart(10, '0');
  counter = (counter + 1) % 0xffffff;
  const counterHex = counter.toString(16).padStart(6, '0');
  return (timestamp + machineAndProcess + counterHex).toLowerCase();
}

export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export function getObjectIdTimestamp(id: string): Date | null {
  if (!isValidObjectId(id)) return null;
  const timestampHex = id.substring(0, 8);
  const seconds = parseInt(timestampHex, 16);
  return new Date(seconds * 1000);
}
