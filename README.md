<p align="center">
  <img src="public/mongodb-lab.svg" width="84" height="84" alt="MongoDB Lab Logo" />
</p>

<h1 align="center">MongoDB Lab</h1>

<p align="center">
  <strong>Entorno interactivo, profesional y 100% offline para aprender, practicar y experimentar con MongoDB directamente en el navegador.</strong>
</p>

<p align="center">
  <a href="https://github.com/Toxuey/MongoDB-Lab"><img src="https://img.shields.io/badge/Open%20Source-GitHub-00ED64?logo=github&logoColor=white" alt="Open Source" /></a>
  <img src="https://img.shields.io/badge/License-GPLv3-00ED64.svg" alt="License" />
  <img src="https://img.shields.io/badge/React-19-61dafb.svg" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178c6.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6-646cff.svg" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-38bdf8.svg" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Client--Side-IndexedDB-emerald.svg" alt="IndexedDB" />
</p>

---

## Tabla de Contenido

- [¿Qué es MongoDB Lab?](#qué-es-mongodb-lab)
- [Características Principales](#características-principales)
- [Colecciones Incluidas](#colecciones-incluidas)
- [Guía de Uso: ¿Cómo usar la aplicación?](#guía-de-uso-cómo-usar-la-aplicación)
  - [1. Explorar y Editar Colecciones](#1-explorar-y-editar-colecciones)
  - [2. Usar la Consola Interactiva](#2-usar-la-consola-interactiva)
  - [3. Redimensionar Consola y Resultados](#3-redimensionar-consola-y-resultados)
  - [4. Crear Nuevas Colecciones e Importar Datos](#4-crear-nuevas-colecciones-e-importar-datos)
  - [5. Soporte Móvil y Tablets](#5-soporte-móvil-y-tablets)
- [Ejemplos Prácticos de Consultas](#ejemplos-prácticos-de-consultas)
  - [Creación y Poblado de una Colección de Ejemplo](#creación-y-poblado-de-una-colección-de-ejemplo)
  - [Gestión de Colecciones mediante Código](#gestión-de-colecciones-mediante-código)
  - [Consultas Básicas y Filtros](#consultas-básicas-y-filtros)
  - [Operadores Lógicos y Búsqueda por Expresiones Regulares](#operadores-lógicos-y-búsqueda-por-expresiones-regulares)
  - [Ordenamiento, Proyección y Paginación](#ordenamiento-proyección-y-paginación)
  - [Agregaciones (Aggregation Pipeline)](#agregaciones-aggregation-pipeline)
  - [Inserción, Actualización y Eliminación](#inserción-actualización-y-eliminación)
- [Requisitos e Instalación](#requisitos-e-instalación)
- [Arquitectura y Tecnologías](#arquitectura-y-tecnologías)
- [Licencia](#licencia)

---

## ¿Qué es MongoDB Lab?

**MongoDB Lab** es un laboratorio virtual y simulador de bases de datos NoSQL que corre íntegramente en el navegador cliente. 

Permite escribir comandos reales de MongoDB en una consola profesional (tipo *mongosh* impulsada por Monaco Editor), inspeccionar resultados en tablas interactivas estilo Supabase o en formato JSON, y gestionar colecciones locales almacenadas de forma persistente en **IndexedDB**.

> **100% Privado y Offline:** No requiere instalar el motor de base de datos de MongoDB en tu sistema operativo, no requiere cuenta en MongoDB Atlas y ningún dato sale jamás de tu equipo.

---

## Características Principales

- **Consola Monaco Editor con autocompletado inteligente:**
  - Sugerencia de métodos al escribir `db.`.
  - Sugerencia automática de los campos reales de los documentos al abrir un filtro `{`.
  - Atajo rápido de ejecución: `Ctrl + Enter` (o `Cmd + Enter`).
- **Separador de paneles dinámico y ajustable:** Arrastra la barra entre la consola y los resultados para darles el tamaño que prefieras (con doble clic para restablecer al 40%/60%).
- **Visor Dual de Datos:** Alterna al instante entre **Tabla interactiva** (con ordenamiento por columnas, buscador en tiempo real y paginación) y **JSON formateado**.
- **Edición e Inserción estilo Supabase:** Agrega filas con el botón `+ Insertar fila` o haz doble clic sobre cualquier celda para editarla en tiempo real.
- **Creador visual de esquemas:** Asigna claves primarias `_id` personalizadas (*ObjectId*, *UUIDv4*, *Auto-incremental* o *Manual*), define tipos de columnas y utiliza plantillas rápidas.
- **Importación y Exportación JSON:** Sube o descarga archivos `.json` para respaldar o poblar colecciones al instante.
- **100% Responsivo:** Menú lateral en modo cajón (drawer) off-canvas para usar cómodamente en celulares y tablets.

---

## Colecciones Incluidas

La base de datos inicial incluye tres colecciones preparadas para pruebas inmediatas:

| Colección | Descripción | Campos Principales |
| :--- | :--- | :--- |
| **`usuarios`** | Directorio de usuarios registrados | `_id`, `nombre`, `email`, `edad`, `ciudad`, `activo` |
| **`peliculas`** | Catálogo de películas clásicas y contemporáneas | `_id`, `titulo`, `director`, `anio`, `genero`, `calificacion`, `disponible` |
| **`productos`** | Inventario de hardware, monitores y periféricos | `_id`, `nombre`, `categoria`, `precio`, `stock`, `disponible` |

---

## Guía de Uso: ¿Cómo usar la aplicación?

### 1. Explorar y Editar Colecciones
1. En la **barra lateral izquierda**, haz clic en cualquiera de las tres colecciones (`usuarios`, `peliculas` o `productos`).
2. En la pestaña **Colección**, puedes:
   - **Buscar:** Escribe en la caja de búsqueda para filtrar registros al instante por cualquier campo.
   - **Alternar vista:** Pulsa **Tabla** para ver las filas en cuadrícula o **JSON** para ver el árbol estructurado.
   - **Insertar datos:** Pulsa el botón `+ Insertar fila` para agregar un nuevo registro rápidamente.
   - **Copiar:** Pulsa `Copiar` en la vista JSON para llevar los datos al portapapeles.

### 2. Usar la Consola Interactiva
1. Haz clic en la pestaña **Consola** en la barra superior.
2. Escribe cualquier comando válido de MongoDB. Por ejemplo:
   ```javascript
   db.usuarios.find({ activo: true })
   ```
3. Presiona `Ctrl + Enter` (o pulsa el botón verde **Ejecutar**).
4. El panel inferior te mostrará el número de resultados, el tiempo de ejecución en milisegundos y los documentos coincidentes.

### 3. Redimensionar Consola y Resultados
- **Arrastrar libremente:** Pasa el ratón sobre la barra divisoria horizontal (se ilumina en verde con un icono de agarre central) y arrástrala hacia arriba o abajo para darle el tamaño que necesites a la consola o a la tabla de resultados.
- **Restablecer con doble clic:** Si deseas volver a una distribución equilibrada, haz **doble clic** sobre la barra y se ajustará automáticamente al 40% de consola y 60% de resultados.
- **Persistencia:** La aplicación recuerda tu tamaño preferido incluso si recargas la página.

### 4. Crear Nuevas Colecciones e Importar Datos
- **Crear desde cero:** Haz clic en el botón `+` en la cabecera de la barra lateral izquierda. Asigna un nombre, selecciona el tipo de `_id`, agrega columnas y haz clic en `Crear Colección`.
- **Importar un archivo JSON:** Haz clic en el enlace `Importar` en el pie de la barra lateral o en el botón `Subir JSON` dentro de cualquier tabla para cargar datos existentes.

### 5. Soporte Móvil y Tablets
- Al usar la aplicación en smartphones o tablets en modo vertical, verás un botón de menú lateral en el encabezado. Tócalo para desplegar el explorador de colecciones.
- Al seleccionar una colección, el cajón se cerrará automáticamente para mostrarte los datos sin distracciones.

---

## Ejemplos Prácticos de Consultas

Puedes copiar y pegar estos ejemplos directamente en la **Consola**:

### Creación y Poblado de una Colección de Ejemplo

Puedes crear una colección nueva desde cero, poblarla con múltiples registros y consultarla de inmediato:

```javascript
// Paso 1: Crear la colección explícitamente en la base de datos
db.createCollection("clientes")

// Paso 2: Insertar múltiples documentos de prueba
db.clientes.insertMany([
  {
    nombre: "Mariana Silva",
    email: "mariana.silva@example.com",
    ciudad: "Bogotá",
    comprasRealizadas: 5,
    activo: true
  },
  {
    nombre: "Esteban Morales",
    email: "esteban.morales@example.com",
    ciudad: "Medellín",
    comprasRealizadas: 12,
    activo: true
  },
  {
    nombre: "Camilo Vega",
    email: "camilo.vega@example.com",
    ciudad: "Cali",
    comprasRealizadas: 1,
    activo: false
  }
])

// Paso 3: Consultar los clientes activos con más de 3 compras
db.clientes.find({ activo: true, comprasRealizadas: { $gt: 3 } })

// Paso 4: Verificar que la colección aparece en el listado
show collections
```

Al ejecutar estos comandos, la colección `clientes` aparecerá instantáneamente en la barra lateral izquierda, permitiéndote también explorarla o editarla en modo tabla visual desde la pestaña **Colección**.

### Gestión de Colecciones mediante Código
```javascript
// Crear una colección explícitamente desde la consola
db.createCollection("articulos")

// Listar todas las colecciones existentes en la base de datos
show collections
// o también:
db.getCollectionNames()

// Creación implícita: al insertar en una colección nueva, se crea automáticamente
db.inventario.insertOne({
  codigo: "INV-001",
  articulo: "Teclado Mecánico",
  cantidad: 25
})

// Inspeccionar métricas y estadísticas de una colección
db.usuarios.stats()

// Eliminar una colección mediante código
db.articulos.drop()
```

### Consultas Básicas y Filtros
```javascript
// Buscar usuarios activos
db.usuarios.find({ activo: true })

// Buscar películas estrenadas a partir del año 2000
db.peliculas.find({ anio: { $gte: 2000 } })

// Buscar productos con precio mayor a 100,000
db.productos.find({ precio: { $gt: 100000 } })
```

### Operadores Lógicos y Búsqueda por Expresiones Regulares
```javascript
// Películas de Ciencia Ficción o con calificación igual o superior a 9.0
db.peliculas.find({
  $or: [
    { genero: "Ciencia Ficción" },
    { calificacion: { $gte: 9.0 } }
  ]
})

// Usuarios con correo de example.com (búsqueda insensible a mayúsculas)
db.usuarios.find({ email: { $regex: "@example\\.com$", $options: "i" } })
```

### Ordenamiento, Proyección y Paginación
```javascript
// Los 3 productos con mayor stock, mostrando solo nombre, precio y stock
db.productos.find({}, { nombre: 1, precio: 1, stock: 1, _id: 0 })
  .sort({ stock: -1 })
  .limit(3)

// Películas ordenadas por calificación de mayor a menor con paginación
db.peliculas.find()
  .sort({ calificacion: -1 })
  .skip(2)
  .limit(3)
```

### Agregaciones (Aggregation Pipeline)
```javascript
// Agrupar productos por categoría, calculando la cantidad y el precio promedio
db.productos.aggregate([
  {
    $group: {
      _id: "$categoria",
      totalProductos: { $sum: 1 },
      precioPromedio: { $avg: "$precio" }
    }
  },
  { $sort: { totalProductos: -1 } }
])
```

### Inserción, Actualización y Eliminación
```javascript
// Insertar un nuevo usuario
db.usuarios.insertOne({
  nombre: "Laura Medina",
  email: "laura.medina@example.com",
  edad: 29,
  ciudad: "Cartagena",
  activo: true
})

// Incrementar el stock y actualizar el precio de un producto
db.productos.updateOne(
  { nombre: "Mouse Inalámbrico Silent" },
  { $inc: { stock: 10 }, $set: { precio: 90000 } }
)

// Eliminar películas no disponibles
db.peliculas.deleteMany({ disponible: false })
```

---

## Requisitos e Instalación

### Requisitos Previos
- **[Node.js](https://nodejs.org/)** versión 18 o superior.
- Gestor de paquetes **npm**, **pnpm** o **yarn**.

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/Toxuey/MongoDB-Lab.git

# 2. Navegar al directorio del proyecto
cd MongoDB-Lab

# 3. Instalar las dependencias
npm install

# 4. Iniciar el servidor local de desarrollo
npm run dev
```

Abre tu navegador en `http://localhost:5173/`.

### Construcción para Producción

```bash
npm run build
```

Los archivos finales compilados y optimizados se generarán en la carpeta `dist/`.

---

## Arquitectura y Tecnologías

| Componente | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) | Interfaz declarativa de alto rendimiento |
| **Lenguaje** | [TypeScript](https://www.typescriptlang.org/) | Tipado estricto y seguridad de código |
| **Bundler** | [Vite 6](https://vitejs.dev/) | Compilación ultrarrápida y recarga en caliente |
| **Estilos** | [Tailwind CSS v4](https://tailwindcss.com/) | Diseño moderno, modo oscuro y Glassmorphism |
| **Editor de Código** | [Monaco Editor](https://microsoft.github.io/monaco-editor/) | Resaltado de sintaxis, atajos y autocompletado |
| **Iconos** | [Lucide React](https://lucide.dev/) | Iconografía limpia y coherente |
| **Almacenamiento** | [IndexedDB (idb)](https://github.com/jakearchibald/idb) | Persistencia local 100% offline |
| **Estado Global** | [Zustand](https://github.com/pmndrs/zustand) | Gestión reactiva de datos y preferencias |

---

## Licencia

Este proyecto es de código abierto y está distribuido bajo la **Licencia Pública General de GNU v3.0 (GPL-3.0)**. Consulta el archivo [LICENSE](LICENSE) para más información.
