import { Sudoku } from "sudoku-easy-solver";
const board = Sudoku.fromString(
  "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
);
for (let i = 0; i < 5; i++) {
  const hint = board.getHint({ explain: true, allowGuess: false });
  if (!hint) break;
  console.log(hint.explanation);
  board.placeNumber(hint.position, hint.value);
}
console.log(board.prettyPrint());
