import { MongoCollection, MongoDatabase } from '../../types/mongo';
import { usuariosSeed } from './usuarios';
import { peliculasSeed } from './peliculas';
import { productosSeed } from './productos';

export function getInitialDatabase(): MongoDatabase {
  const createCollection = (name: string, documents: any[]): MongoCollection => ({
    name,
    documents: JSON.parse(JSON.stringify(documents)),
    createdAt: new Date().toISOString(),
    indexes: ['_id']
  });

  return {
    name: 'database',
    collections: {
      usuarios: createCollection('usuarios', usuariosSeed),
      peliculas: createCollection('peliculas', peliculasSeed),
      productos: createCollection('productos', productosSeed)
    }
  };
}
