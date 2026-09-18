import { MongoDocument } from '../../types/mongo';

export const usuariosSeed: MongoDocument[] = [
  {
    _id: '65f4621ab7e34d1908c9012a',
    nombre: 'Carlos Restrepo',
    email: 'carlos.restrepo@example.com',
    edad: 32,
    ciudad: 'Medellín',
    activo: true
  },
  {
    _id: '65f4622b8a21e4f509c9143b',
    nombre: 'Valentina Gómez',
    email: 'valentina.gomez@example.com',
    edad: 27,
    ciudad: 'Bogotá',
    activo: true
  },
  {
    _id: '65f46241a491bc300ad8274c',
    nombre: 'Juan Camilo Osorio',
    email: 'juan.osorio@example.com',
    edad: 41,
    ciudad: 'Cali',
    activo: false
  },
  {
    _id: '65f46255ef88219c0be7315d',
    nombre: 'Daniela Morales',
    email: 'daniela.morales@example.com',
    edad: 24,
    ciudad: 'Barranquilla',
    activo: true
  },
  {
    _id: '65f4626dc091ea280cf6496e',
    nombre: 'Andrés Felipe Castro',
    email: 'andres.castro@example.com',
    edad: 35,
    ciudad: 'Bucaramanga',
    activo: false
  },
  {
    _id: '65f4628292d3f7810ea5587f',
    nombre: 'Mariana Herrera',
    email: 'mariana.herrera@example.com',
    edad: 29,
    ciudad: 'Cartagena',
    activo: true
  },
  {
    _id: '65f4629718ea69020fb46180',
    nombre: 'Mateo Cárdenas',
    email: 'mateo.cardenas@example.com',
    edad: 38,
    ciudad: 'Pereira',
    activo: true
  },
  {
    _id: '65f462ad71cb943310c37a91',
    nombre: 'Laura Sofía Benítez',
    email: 'laura.benitez@example.com',
    edad: 22,
    ciudad: 'Manizales',
    activo: true
  },
  {
    _id: '65f462c159df816411d283a2',
    nombre: 'Sebastián Vargas',
    email: 'sebastian.vargas@example.com',
    edad: 45,
    ciudad: 'Bogotá',
    activo: false
  },
  {
    _id: '65f462d63a8e27c512e19cb3',
    nombre: 'Camila Pineda',
    email: 'camila.pineda@example.com',
    edad: 30,
    ciudad: 'Medellín',
    activo: true
  }
];
