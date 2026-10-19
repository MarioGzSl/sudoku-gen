import { solveGridAsync } from "sudoku-easy-solver/async";
import { parseGrid } from "sudoku-easy-solver";
const grid = parseGrid(
  "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
);
console.log(await solveGridAsync(grid));
