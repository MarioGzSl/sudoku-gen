import {
  parseGrid,
  analyze,
  solveGrid,
  getCandidates,
} from "sudoku-easy-solver";
const grid = parseGrid(
  "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
);
console.log(analyze(grid));
console.log(getCandidates(grid, { row: 0, col: 2 }));
console.log(solveGrid(grid));
