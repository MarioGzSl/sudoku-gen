# Ejemplos ejecutables

Desde el repositorio: `npm ci`, `npm run build` y `node examples/quick-start.mjs`.
En tu aplicación, instala `sudoku-easy-solver` e importa las mismas funciones.

| Ejemplo | Qué demuestra |
| --- | --- |
| [quick-start.mjs](quick-start.mjs) | Generación reproducible, unicidad y dificultad estimada del tablero. |
| [analyze.mjs](analyze.mjs) | Comprobar existencia y unicidad de soluciones. |
| [hints.mjs](hints.mjs) | Pistas explicadas sin resolver ni modificar el tablero automáticamente. |
| [two-step-hint.mjs](two-step-hint.mjs) | Una página con la casilla resaltada que permite revelar el número y su explicación. |
| [game.mjs](game.mjs) | Casillas iniciales protegidas, deshacer, rehacer y guardar una partida. |
| [images.mjs](images.mjs) | SVG y PNG de un sudoku, su solución y una pista. |
| [worker.mjs](worker.mjs) | Resolver en un worker de Node.js. |

Ejecuta `node examples/two-step-hint.mjs` y abre `sudoku-images/two-step-hint.html`
en el navegador. Puedes revelar la pista con el ratón o el teclado.

La exportación PNG requiere `@resvg/resvg-js`. Los ejemplos visuales escriben en
`sudoku-images/`. Puedes cambiar el destino con `SUDOKU_OUTPUT_DIR`.
Todos estos ejemplos se ejecutan con `npm run test:examples`.
