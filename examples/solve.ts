import { Sudoku } from '../src/Sudoku';

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

// Create a Sudoku instance with the provided grid
const sudoku = new Sudoku(sudokuGrid);

// Check if the sudoku is valid
console.log('Sudoku valid:', sudoku.isValid());

// Print the original sudoku in a pretty format
console.log('Original Sudoku:');
console.log(sudoku.prettyPrint());

// Solve the sudoku
const solucion = sudoku.solve();

if (solucion) {
  console.log('Solution found:');
  // Print the solution using the pretty print method
  console.log(sudoku.prettyPrint(solucion));
} else {
  console.log('No solution found for this sudoku.');
} 