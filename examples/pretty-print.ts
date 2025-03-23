import { Sudoku } from '../src/Sudoku';
import * as fs from 'fs';

// Example Sudoku grid (the one provided in the original task)
const sudokuGrid = [
  [6, 0, 0, 7, 0, 0, 0, 0, 0],
  [0, 0, 5, 0, 6, 0, 7, 0, 0],
  [0, 0, 2, 0, 5, 9, 0, 8, 0],
  [4, 3, 0, 0, 9, 1, 0, 0, 0],
  [0, 2, 0, 0, 0, 0, 0, 4, 0],
  [0, 0, 0, 5, 3, 0, 0, 1, 2],
  [0, 5, 0, 6, 8, 0, 9, 0, 0],
  [0, 0, 3, 0, 1, 0, 2, 0, 0],
  [0, 0, 0, 0, 0, 7, 0, 0, 5],
];

// Create a Sudoku instance
const sudoku = new Sudoku(sudokuGrid);

// Print the original sudoku
console.log('Original Sudoku:');
const originalPretty = sudoku.prettyPrint();
console.log(originalPretty);

// Write original sudoku to file
fs.writeFileSync('examples/original.txt', originalPretty);

// Solve the sudoku
const solution = sudoku.solve();

// Print the solved sudoku if a solution exists
if (solution) {
  console.log('Solved Sudoku:');
  const solutionPretty = sudoku.prettyPrint(solution);
  
  // Try to print it to console - may get truncated
  console.log(solutionPretty);
  
  // Write solution to file - will be complete
  fs.writeFileSync('examples/solution-pretty.txt', solutionPretty);
  console.log('Solution saved to examples/solution-pretty.txt');
} else {
  console.log('No solution exists for this Sudoku.');
} 