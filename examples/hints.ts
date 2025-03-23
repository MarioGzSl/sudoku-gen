import { Sudoku, SudokuDifficulty } from '../src/index';

// Simulate a game with hints
console.log('=== SUDOKU GAME WITH HINTS ===\n');

// Create a Sudoku instance and generate a puzzle
const sudoku = new Sudoku();
const grid = sudoku.generate(SudokuDifficulty.MEDIUM);

// Display the initial puzzle
console.log('Initial Sudoku:');
console.log(sudoku.prettyPrint());

// Simulate the player requesting hints
console.log('\n=== SIMULATING 5 CONSECUTIVE HINTS ===');

// Get 5 consecutive hints
for (let i = 1; i <= 5; i++) {
  const hint = sudoku.getHint();
  
  if (hint) {
    const { position, value } = hint;
    console.log(`\nHint #${i}:`);
    console.log(`Place the number ${value} in position [${position.row+1},${position.col+1}]`);
    
    // Place the number on the board
    sudoku.placeNumber(position, value);
    
    // Display the updated board
    console.log('\nBoard after applying the hint:');
    console.log(sudoku.prettyPrint());
  } else {
    console.log('\nNo more hints available, the sudoku is complete.');
    break;
  }
}

// Check if the sudoku is solved
if (sudoku.isSolved()) {
  console.log('\nThe sudoku is completely solved!');
} else {
  console.log('\nThe sudoku is not completely solved yet.');
  console.log('Remaining cells to complete: ' + 
    sudoku.getGrid().flat().filter(cell => cell === 0).length);
  
  // Solve the sudoku to show the complete solution
  console.log('\nComplete solution:');
  const solution = sudoku.solve();
  if (solution) {
    console.log(sudoku.prettyPrint(solution));
  } else {
    console.log('Error! Could not find a solution.');
  }
} 