import { Sudoku, SudokuDifficulty } from "sudoku-easy-solver";
const board = new Sudoku();
board.generate({
  difficulty: SudokuDifficulty.MEDIUM,
  seed: "first",
  symmetry: "rotational",
});
console.log(board.prettyPrint());
console.log(board.analyze().status);
console.log(board.rateDifficulty());
