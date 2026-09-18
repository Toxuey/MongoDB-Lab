import { CursorOptions } from './mongo';

export type MongoMethod =
  | 'find'
  | 'findOne'
  | 'insertOne'
  | 'insertMany'
  | 'updateOne'
  | 'updateMany'
  | 'replaceOne'
  | 'deleteOne'
  | 'deleteMany'
  | 'countDocuments'
  | 'distinct'
  | 'aggregate'
  | 'createCollection'
  | 'drop'
  | 'getCollectionNames'
  | 'stats';

export interface ParsedMongoCommand {
  raw: string;
  collection: string;
  method: MongoMethod;
  filter?: Record<string, any>;
  updateDoc?: Record<string, any>;
  documents?: Record<string, any>[];
  document?: Record<string, any>;
  distinctField?: string;
  pipeline?: Record<string, any>[];
  cursorOptions: CursorOptions;
}

export interface ParseError {
  message: string;
  line?: number;
  column?: number;
}
