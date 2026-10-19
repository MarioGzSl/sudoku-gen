import sudoku = require("sudoku-easy-solver");
import image = require("sudoku-easy-solver/image");
import asyncApi = require("sudoku-easy-solver/async");
const board = new sudoku.Sudoku();
board.generate({ seed: 42 });
const png: Promise<Uint8Array> = image.renderSudokuPng(board.getGrid());
asyncApi.solveGridAsync(board.getGrid());
