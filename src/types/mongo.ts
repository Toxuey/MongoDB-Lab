export type BsonValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Date
  | BsonValue[]
  | { [key: string]: BsonValue };

export interface MongoDocument {
  _id: any;
  [key: string]: any;
}

export interface CollectionStats {
  count: number;
  avgObjSize: number;
  storageSize: number;
  totalIndexSize: number;
  indexes: number;
}

export type ColumnType = 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';

export interface ColumnDefinition {
  name: string;
  type: ColumnType;
  defaultValue?: any;
  required?: boolean;
}

export type IdTypeOption = 'objectId' | 'uuid' | 'incremental' | 'manual';

export interface CollectionSchema {
  idType: IdTypeOption;
  columns: ColumnDefinition[];
}

export interface MongoCollection {
  name: string;
  documents: MongoDocument[];
  createdAt: string;
  indexes: string[];
  schema?: CollectionSchema;
}

export interface MongoDatabase {
  name: string;
  collections: Record<string, MongoCollection>;
}

export interface CursorOptions {
  sort?: Record<string, 1 | -1>;
  skip?: number;
  limit?: number;
  projection?: Record<string, 0 | 1>;
}

export interface StepEvaluation {
  field: string;
  operator: string;
  expected: any;
  actual: any;
  passed: boolean;
  description: string;
}

export interface DocumentExplanation {
  docId: string;
  matches: boolean;
  steps: StepEvaluation[];
  summary: string;
}

export interface ExecutionStats {
  executionTimeMs: number;
  documentsExamined: number;
  documentsReturned: number;
  indexesUsed: string[];
  inMemorySort: boolean;
}

export interface QueryResult {
  success: boolean;
  data: any;
  error?: string;
  stats?: ExecutionStats;
  explanation?: DocumentExplanation[];
  commandText?: string;
  operation?: string;
  collectionName?: string;
  timestamp: string;
}

export interface CommandHistoryItem {
  id: string;
  command: string;
  collection: string;
  operation: string;
  success: boolean;
  timestamp: string;
  isFavorite: boolean;
  executionTimeMs: number;
}
