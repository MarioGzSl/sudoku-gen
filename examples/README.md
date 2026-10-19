# Ejemplos ejecutables

Desde el repositorio: `npm ci`, `npm run build` y `node examples/quick-start.mjs`.
En tu aplicación, instala `sudoku-easy-solver` e importa las mismas funciones.

| Ejemplo | Qué demuestra |
| --- | --- |
| [quick-start.mjs](quick-start.mjs) | Generación reproducible, resolución y análisis. |
| [analyze.mjs](analyze.mjs) | Comprobar existencia y unicidad de soluciones. |
| [hints.mjs](hints.mjs) | Pistas explicadas sin resolver ni modificar el tablero automáticamente. |
| [game.mjs](game.mjs) | Casillas iniciales protegidas, deshacer, rehacer y guardar una partida. |
| [images.mjs](images.mjs) | SVG y PNG de un sudoku, su solución y una pista. |
| [worker.mjs](worker.mjs) | Resolver en un worker de Node.js. |

La exportación PNG requiere `@resvg/resvg-js`. El ejemplo de imágenes escribe en
`sudoku-images/`; puedes cambiar el destino con `SUDOKU_OUTPUT_DIR`.
Todos estos ejemplos se ejecutan con `npm run test:examples`.
