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
  - [3. Catálogo Interactivo de Ejemplos](#3-catálogo-interactivo-de-ejemplos)
  - [4. Redimensionar Consola y Resultados](#4-redimensionar-consola-y-resultados)
  - [5. Crear Nuevas Colecciones e Importar Datos](#5-crear-nuevas-colecciones-e-importar-datos)
  - [6. Soporte Móvil y Tablets](#6-soporte-móvil-y-tablets)
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
- **Pestaña interactiva de Ejemplos:** Catálogo integrado con consultas listas para usar, clasificadas por categorías (Colecciones, Consultas, Filtros, Inserción, Actualización, Eliminación y Agregaciones), con resaltado de sintaxis y botón para cargar directamente a la consola.
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

### 3. Catálogo Interactivo de Ejemplos
La aplicación cuenta con una pestaña dedicada llamada **Ejemplos** accesible desde la barra superior junto a la Consola:
- **Categorías organizadas:** Filtra consultas por tipo de operación: Colecciones, Consultas, Filtros, Inserción de datos, Actualización, Eliminación y Agregaciones.
- **Filtro por colección y buscador en tiempo real:** Encuentra ejemplos específicos para `usuarios`, `peliculas`, `productos` o utiliza términos de búsqueda.
- **Probar en consola:** Cada tarjeta incluye la acción de probar en consola, la cual traslada el comando al editor Monaco y cambia la vista automáticamente para su ejecución.
- **Copia rápida:** Copia el comando al portapapeles sin necesidad de seleccionar texto manualmente.

### 4. Redimensionar Consola y Resultados
- **Arrastrar libremente:** Pasa el ratón sobre la barra divisoria horizontal (se ilumina en verde con un icono de agarre central) y arrástrala hacia arriba o abajo para darle el tamaño que necesites a la consola o a la tabla de resultados.
- **Restablecer con doble clic:** Si deseas volver a una distribución equilibrada, haz **doble clic** sobre la barra y se ajustará automáticamente al 40% de consola y 60% de resultados.
- **Persistencia:** La aplicación recuerda tu tamaño preferido incluso si recargas la página.

### 5. Crear Nuevas Colecciones e Importar Datos
- **Crear desde cero:** Haz clic en el botón `+` en la cabecera de la barra lateral izquierda. Asigna un nombre, selecciona el tipo de `_id`, agrega columnas y haz clic en `Crear Colección`.
- **Importar un archivo JSON:** Haz clic en el enlace `Importar` en el pie de la barra lateral o en el botón `Subir JSON` dentro de cualquier tabla para cargar datos existentes.

### 6. Soporte Móvil y Tablets
- Al usar la aplicación en smartphones o tablets en modo vertical, verás un botón de menú lateral en el encabezado. Tócalo para desplegar el explorador de colecciones.
- Al seleccionar una colección, el cajón se cerrará automáticamente para mostrarte los datos sin distracciones.

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
