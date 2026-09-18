import { MongoDocument } from '../../types/mongo';

export const productosSeed: MongoDocument[] = [
  {
    _id: '662e08c49e71b2d038a1c945',
    nombre: 'Laptop Pro 15',
    categoria: 'Computadores',
    precio: 3500000,
    stock: 12,
    disponible: true
  },
  {
    _id: '662e08d81f82c3e149b2da56',
    nombre: 'Mouse Inalámbrico Silent',
    categoria: 'Accesorios',
    precio: 85000,
    stock: 50,
    disponible: true
  },
  {
    _id: '662e08ea8a93d4f25ac3eb67',
    nombre: 'Teclado Mecánico Retroiluminado',
    categoria: 'Accesorios',
    precio: 240000,
    stock: 18,
    disponible: true
  },
  {
    _id: '662e08fd4ba4e5036bd4fc78',
    nombre: 'Monitor 4K 27 Pulgadas',
    categoria: 'Monitores',
    precio: 1450000,
    stock: 8,
    disponible: true
  },
  {
    _id: '662e0910dc15f6147ce50d89',
    nombre: 'Audífonos Bluetooth Cancelación Ruido',
    categoria: 'Audio',
    precio: 620000,
    stock: 25,
    disponible: true
  },
  {
    _id: '662e09247d2607258df61e9a',
    nombre: 'Disco Duro Externo 2TB',
    categoria: 'Almacenamiento',
    precio: 310000,
    stock: 0,
    disponible: false
  },
  {
    _id: '662e09392e3718369ef72fab',
    nombre: 'Silla Gamer Ergonómica',
    categoria: 'Muebles',
    precio: 780000,
    stock: 6,
    disponible: true
  },
  {
    _id: '662e094c9f482947af0830bc',
    nombre: 'Cámara Web Full HD 1080p',
    categoria: 'Accesorios',
    precio: 165000,
    stock: 15,
    disponible: true
  },
  {
    _id: '662e09605a593a58b01941cd',
    nombre: 'Parlante Inteligente con Asistente',
    categoria: 'Audio',
    precio: 195000,
    stock: 22,
    disponible: true
  },
  {
    _id: '662e0973eb6a4b69c12a52de',
    nombre: 'Hub USB-C 7 en 1',
    categoria: 'Accesorios',
    precio: 125000,
    stock: 0,
    disponible: false
  }
];
