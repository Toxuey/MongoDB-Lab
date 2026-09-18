# Colecciones de Ejemplo para Pruebas

Esta carpeta contiene conjuntos de datos en formato JSON listos para ser importados y utilizados en **MongoDB Lab**.

## Archivos Disponibles

| Archivo | Colección Sugerida | Descripción | Documentos | Campos Principales |
| :--- | :--- | :--- | :--- | :--- |
| `players.json` | `jugadores` o `players` | Plantillas oficiales de jugadores del Mundial Rusia 2018 | 736 | `team`, `number`, `pos`, `fifa_popular_name`, `birth_date`, `shirt_name`, `club`, `height`, `weight` |
| `teams.json` | `equipos` o `teams` | Selecciones participantes con su abreviatura y confederación | 32 | `id`, `abbreviation`, `country`, `confederation` |
| `match.json` | `partidos` o `matches` | Calendario de partidos, fechas y enfrentamientos directos | 60 | `id`, `team_1`, `team_2`, `date`, `time` |

## ¿Cómo importar estos archivos a MongoDB Lab?

1. Descarga cualquiera de los archivos `.json` de esta carpeta a tu computadora.
2. Abre la aplicación MongoDB Lab en el navegador.
3. En la barra lateral izquierda, haz clic en el enlace **Importar** (o en el botón `+` para crear una colección).
4. Asigna un nombre a la colección (por ejemplo: `jugadores`, `equipos` o `partidos`).
5. Haz clic en **Elegir archivo .json**, selecciona el archivo descargado y presiona **Crear e Importar**.
6. ¡Listo! Podrás consultar, filtrar, paginar y ejecutar operaciones con `find()`, `aggregate()`, `updateOne()`, etc., directamente en la consola.
