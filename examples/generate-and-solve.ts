import { Sudoku, SudokuDifficulty } from '../src/index';

// Create an empty Sudoku instance
const sudoku = new Sudoku();

// Generate a new puzzle with MEDIUM difficulty
console.log('Generating a new MEDIUM difficulty sudoku...');
const generatedGrid = sudoku.generate(SudokuDifficulty.MEDIUM);

// Display the generated sudoku
console.log('Generated Sudoku:');
console.log(sudoku.prettyPrint());

// Save the original sudoku before solving
const originalGrid = sudoku.getGrid();

// Solve the sudoku
console.log('\nSolving the sudoku...');
const solution = sudoku.solve();

if (solution) {
  console.log('Solution found:');
  console.log(sudoku.prettyPrint(solution));
  
  // Verify that the solution is valid
  console.log('\nVerification:');
  console.log(`Is the solution valid? ${sudoku.isValid() ? 'Yes' : 'No'}`);
  console.log(`Is it completely solved? ${sudoku.isSolved() ? 'Yes' : 'No'}`);
  
  // Count how many cells were empty in the original puzzle
  let emptyCount = 0;
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (originalGrid[row][col] === 0) {
        emptyCount++;
      }
    }
  }
  console.log(`\nThe original puzzle had ${emptyCount} empty cells out of 81 total.`);
} else {
  console.log('No solution could be found for this sudoku.');
} 