import { generatePuzzle, SudokuGame } from "sudoku-easy-solver";
const game = new SudokuGame(generatePuzzle({ seed: "game" }));
const hint = game.getHint();
if (hint) game.placeNumber(hint.position, hint.value);
game.undo();
game.redo();
const restored = SudokuGame.deserialize(game.serialize());
console.log(restored.getGrid());
