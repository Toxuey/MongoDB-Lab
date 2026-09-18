export interface MongoExample {
  id: string;
  title: string;
  category: 'find' | 'filter' | 'insert' | 'update' | 'delete' | 'aggregate' | 'collections';
  categoryLabel: string;
  collection: 'usuarios' | 'peliculas' | 'productos' | 'general';
  code: string;
  description: string;
  tags: string[];
}

export const MONGO_EXAMPLES: MongoExample[] = [
  // 1. LISTAR & CONSULTAS BÁSICAS
  {
    id: 'find-all-users',
    title: 'Listar todos los usuarios',
    category: 'find',
    categoryLabel: 'Listar y Buscar',
    collection: 'usuarios',
    code: 'db.usuarios.find()',
    description: 'Devuelve todos los documentos de la colección usuarios.',
    tags: ['find', 'usuarios', 'listar', 'todos']
  },
  {
    id: 'find-movies-limit',
    title: 'Primeras 3 películas',
    category: 'find',
    categoryLabel: 'Listar y Buscar',
    collection: 'peliculas',
    code: 'db.peliculas.find().limit(3)',
    description: 'Limita la cantidad de resultados devueltos a un máximo de 3 documentos.',
    tags: ['limit', 'peliculas', 'limitar']
  },
  {
    id: 'find-products-sorted',
    title: 'Productos ordenados por precio (descendente)',
    category: 'find',
    categoryLabel: 'Listar y Buscar',
    collection: 'productos',
    code: 'db.productos.find().sort({ precio: -1 })',
    description: 'Ordena los productos del más caro al más barato usando .sort() (-1 descendente, 1 ascendente).',
    tags: ['sort', 'productos', 'ordenar', 'precio']
  },
  {
    id: 'find-projection-users',
    title: 'Proyección: Solo nombre y email',
    category: 'find',
    categoryLabel: 'Listar y Buscar',
    collection: 'usuarios',
    code: 'db.usuarios.find({}, { nombre: 1, email: 1, _id: 0 })',
    description: 'Especifica qué campos incluir (1) o excluir (0) en la respuesta.',
    tags: ['project', 'projection', 'campos', 'usuarios']
  },
  {
    id: 'find-one-movie',
    title: 'Buscar una sola película',
    category: 'find',
    categoryLabel: 'Listar y Buscar',
    collection: 'peliculas',
    code: 'db.peliculas.findOne({ director: "Christopher Nolan" })',
    description: 'Devuelve el primer documento que coincida con el criterio de búsqueda.',
    tags: ['findOne', 'peliculas', 'primer']
  },
  {
    id: 'distinct-cities',
    title: 'Ciudades únicas sin duplicados',
    category: 'find',
    categoryLabel: 'Listar y Buscar',
    collection: 'usuarios',
    code: 'db.usuarios.distinct("ciudad")',
    description: 'Obtiene una lista con todos los valores distintos para el campo ciudad.',
    tags: ['distinct', 'ciudades', 'únicos']
  },
  {
    id: 'count-available-products',
    title: 'Contar productos disponibles',
    category: 'find',
    categoryLabel: 'Listar y Buscar',
    collection: 'productos',
    code: 'db.productos.countDocuments({ disponible: true })',
    description: 'Cuenta el número de documentos que cumplen con la condición especificada.',
    tags: ['count', 'countDocuments', 'productos']
  },

  // 2. FILTRAR Y OPERADORES
  {
    id: 'filter-gt-age',
    title: 'Usuarios mayores o iguales a 30 años',
    category: 'filter',
    categoryLabel: 'Filtros y Operadores',
    collection: 'usuarios',
    code: 'db.usuarios.find({ edad: { $gte: 30 } })',
    description: 'Filtra usuarios usando el operador de comparación mayor o igual ($gte).',
    tags: ['gte', 'gt', 'edad', 'filtro']
  },
  {
    id: 'filter-in-cities',
    title: 'Usuarios en ciudades específicas ($in)',
    category: 'filter',
    categoryLabel: 'Filtros y Operadores',
    collection: 'usuarios',
    code: 'db.usuarios.find({ ciudad: { $in: ["Medellín", "Bogotá"] } })',
    description: 'Selecciona documentos donde el valor de ciudad esté contenido en la lista dada.',
    tags: ['in', 'ciudad', 'medellin', 'bogota']
  },
  {
    id: 'filter-or-logic',
    title: 'Filtro lógico $or (Accesorios o baratos)',
    category: 'filter',
    categoryLabel: 'Filtros y Operadores',
    collection: 'productos',
    code: 'db.productos.find({\n  $or: [\n    { categoria: "Accesorios" },\n    { precio: { $lt: 200000 } }\n  ]\n})',
    description: 'Une condiciones con disyunción lógica ($or): cumple si al menos una de las dos condiciones es verdadera.',
    tags: ['or', 'logico', 'accesorios', 'precio']
  },
  {
    id: 'filter-regex-movie',
    title: 'Búsqueda por texto con expresiones regulares ($regex)',
    category: 'filter',
    categoryLabel: 'Filtros y Operadores',
    collection: 'peliculas',
    code: 'db.peliculas.find({\n  titulo: { $regex: "padrino|interstellar", $options: "i" }\n})',
    description: 'Busca películas cuyo título contenga coincidencias ignorando mayúsculas y minúsculas (i).',
    tags: ['regex', 'texto', 'buscar', 'peliculas']
  },
  {
    id: 'filter-movie-years',
    title: 'Películas entre 2000 y 2015 con paginación',
    category: 'filter',
    categoryLabel: 'Filtros y Operadores',
    collection: 'peliculas',
    code: 'db.peliculas.find({\n  anio: { $gte: 2000, $lte: 2015 }\n})\n.sort({ calificacion: -1 })\n.skip(1)\n.limit(3)',
    description: 'Combina rango numérico ($gte, $lte) con ordenamiento descendente y paginación (.skip y .limit).',
    tags: ['rango', 'paginacion', 'skip', 'sort', 'peliculas']
  },

  // 3. INSERTAR DATOS
  {
    id: 'insert-one-user',
    title: 'Insertar un nuevo usuario',
    category: 'insert',
    categoryLabel: 'Insertar Datos',
    collection: 'usuarios',
    code: 'db.usuarios.insertOne({\n  nombre: "Mariana Silva",\n  email: "mariana.silva@example.com",\n  edad: 29,\n  ciudad: "Cartagena",\n  activo: true\n})',
    description: 'Inserta un nuevo documento en la colección usuarios y genera automáticamente un _id único.',
    tags: ['insertOne', 'crear', 'insertar', 'usuarios']
  },
  {
    id: 'insert-many-products',
    title: 'Insertar varios productos a la vez (lote)',
    category: 'insert',
    categoryLabel: 'Insertar Datos',
    collection: 'productos',
    code: 'db.productos.insertMany([\n  {\n    nombre: "Cámara Web 4K Pro",\n    categoria: "Accesorios",\n    precio: 320000,\n    stock: 20,\n    disponible: true\n  },\n  {\n    nombre: "Base Refrigerante Laptop",\n    categoria: "Accesorios",\n    precio: 110000,\n    stock: 35,\n    disponible: true\n  }\n])',
    description: 'Inserta múltiples documentos en una sola operación atómica con insertMany.',
    tags: ['insertMany', 'lote', 'productos', 'crear']
  },
  {
    id: 'insert-one-movie',
    title: 'Insertar una nueva película',
    category: 'insert',
    categoryLabel: 'Insertar Datos',
    collection: 'peliculas',
    code: 'db.peliculas.insertOne({\n  titulo: "Oppenheimer",\n  director: "Christopher Nolan",\n  anio: 2023,\n  genero: "Drama",\n  calificacion: 8.9,\n  disponible: true\n})',
    description: 'Agrega un estreno a la cartelera con sus respectivos atributos de metadatos.',
    tags: ['insertOne', 'peliculas', 'nolan']
  },

  // 4. ACTUALIZAR DATOS
  {
    id: 'update-one-set',
    title: 'Actualizar campos con $set',
    category: 'update',
    categoryLabel: 'Actualizar Datos',
    collection: 'usuarios',
    code: 'db.usuarios.updateOne(\n  { email: "carlos.restrepo@example.com" },\n  { $set: { ciudad: "Envigado", edad: 33 } }\n)',
    description: 'Modifica únicamente los campos indicados sin sobreescribir el resto del documento.',
    tags: ['updateOne', 'set', 'modificar', 'usuarios']
  },
  {
    id: 'update-inc-stock',
    title: 'Incrementar stock con $inc',
    category: 'update',
    categoryLabel: 'Actualizar Datos',
    collection: 'productos',
    code: 'db.productos.updateOne(\n  { nombre: "Mouse Inalámbrico Silent" },\n  { $inc: { stock: 10 } }\n)',
    description: 'Suma (o resta si es negativo) un valor numérico directamente al campo indicado.',
    tags: ['inc', 'incrementar', 'stock', 'productos']
  },
  {
    id: 'update-many-price',
    title: 'Ajuste masivo de precios ($inc en lote)',
    category: 'update',
    categoryLabel: 'Actualizar Datos',
    collection: 'productos',
    code: 'db.productos.updateMany(\n  { categoria: "Accesorios" },\n  { $inc: { precio: 5000 } }\n)',
    description: 'Actualiza todos los documentos que coincidan con la condición en una sola llamada.',
    tags: ['updateMany', 'accesorios', 'precios', 'masivo']
  },
  {
    id: 'replace-one-doc',
    title: 'Reemplazar documento completo (replaceOne)',
    category: 'update',
    categoryLabel: 'Actualizar Datos',
    collection: 'usuarios',
    code: 'db.usuarios.replaceOne(\n  { email: "juan.osorio@example.com" },\n  {\n    nombre: "Juan Camilo Osorio",\n    email: "juan.osorio@example.com",\n    edad: 42,\n    ciudad: "Pereira",\n    activo: true\n  }\n)',
    description: 'Reemplaza todo el contenido del documento conservando su _id original.',
    tags: ['replaceOne', 'reemplazar', 'usuarios']
  },

  // 5. BORRAR / ELIMINAR
  {
    id: 'delete-one-user',
    title: 'Eliminar un usuario por condición',
    category: 'delete',
    categoryLabel: 'Eliminar Datos',
    collection: 'usuarios',
    code: 'db.usuarios.deleteOne({ email: "juan.osorio@example.com" })',
    description: 'Elimina el primer documento que coincida con el filtro proporcionado.',
    tags: ['deleteOne', 'borrar', 'eliminar', 'usuarios']
  },
  {
    id: 'delete-many-products',
    title: 'Eliminar productos sin stock o inactivos',
    category: 'delete',
    categoryLabel: 'Eliminar Datos',
    collection: 'productos',
    code: 'db.productos.deleteMany({\n  $or: [\n    { stock: { $lte: 0 } },\n    { disponible: false }\n  ]\n})',
    description: 'Elimina todos los documentos que coincidan con la condición especificada.',
    tags: ['deleteMany', 'eliminar', 'borrar', 'productos']
  },

  // 6. AGREGACIONES Y MÉTRICAS
  {
    id: 'agg-group-category',
    title: 'Agrupar productos por categoría con promedio y total',
    category: 'aggregate',
    categoryLabel: 'Agregaciones & Métricas',
    collection: 'productos',
    code: 'db.productos.aggregate([\n  {\n    $group: {\n      _id: "$categoria",\n      totalProductos: { $sum: 1 },\n      stockTotal: { $sum: "$stock" },\n      precioPromedio: { $avg: "$precio" }\n    }\n  },\n  {\n    $sort: { totalProductos: -1 }\n  }\n])',
    description: 'Pipeline con $group y $sort para calcular métricas agregadas por cada categoría.',
    tags: ['aggregate', 'group', 'avg', 'sum', 'metricas']
  },
  {
    id: 'agg-movies-genre',
    title: 'Películas mejor valoradas agrupadas por género',
    category: 'aggregate',
    categoryLabel: 'Agregaciones & Métricas',
    collection: 'peliculas',
    code: 'db.peliculas.aggregate([\n  {\n    $match: { calificacion: { $gte: 8.5 } }\n  },\n  {\n    $group: {\n      _id: "$genero",\n      cantidad: { $sum: 1 },\n      ratingPromedio: { $avg: "$calificacion" },\n      mejorPuntaje: { $max: "$calificacion" }\n    }\n  },\n  {\n    $sort: { ratingPromedio: -1 }\n  }\n])',
    description: 'Aplica primero un filtro con $match y calcula estadísticas agrupadas por género.',
    tags: ['aggregate', 'match', 'group', 'peliculas', 'rating']
  },
  {
    id: 'agg-inventory-total',
    title: 'Totales globales de inventario (_id: null)',
    category: 'aggregate',
    categoryLabel: 'Agregaciones & Métricas',
    collection: 'productos',
    code: 'db.productos.aggregate([\n  {\n    $group: {\n      _id: null,\n      unidadesTotales: { $sum: "$stock" },\n      precioPromedioGlobal: { $avg: "$precio" }\n    }\n  }\n])',
    description: 'Calcula sumatorias sobre toda la colección agrupando con _id: null.',
    tags: ['aggregate', 'global', 'inventario', 'total']
  },

  // 7. GESTIÓN DE COLECCIONES Y BASE DE DATOS
  {
    id: 'show-collections',
    title: 'Listar todas las colecciones',
    category: 'collections',
    categoryLabel: 'Gestión de Colecciones',
    collection: 'general',
    code: 'show collections',
    description: 'Muestra los nombres de todas las colecciones existentes en la base de datos actual.',
    tags: ['show', 'collections', 'colecciones']
  },
  {
    id: 'create-collection',
    title: 'Crear una nueva colección',
    category: 'collections',
    categoryLabel: 'Gestión de Colecciones',
    collection: 'general',
    code: 'db.createCollection("pedidos")',
    description: 'Crea explícitamente una nueva colección vacía en la base de datos.',
    tags: ['createCollection', 'crear', 'colecciones']
  },
  {
    id: 'collection-stats',
    title: 'Estadísticas e índices de una colección',
    category: 'collections',
    categoryLabel: 'Gestión de Colecciones',
    collection: 'productos',
    code: 'db.productos.stats()',
    description: 'Obtiene metadatos detallados: conteo de documentos, tamaño en bytes e índices.',
    tags: ['stats', 'estadisticas', 'diagnostico']
  },
  {
    id: 'drop-collection',
    title: 'Eliminar una colección completa (drop)',
    category: 'collections',
    categoryLabel: 'Gestión de Colecciones',
    collection: 'general',
    code: 'db.pedidos.drop()',
    description: 'Elimina permanentemente una colección y todos sus documentos asociados.',
    tags: ['drop', 'eliminar', 'colecciones']
  }
];
