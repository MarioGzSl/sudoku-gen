import { Sudoku, SudokuDifficulty } from '../src/index';

// This example demonstrates that the generator now creates varied solutions
console.log('=== TESTING VARIED SUDOKU SOLUTIONS ===\n');

// Generate multiple sudokus and compare their solutions
const numSudokus = 3;
const solutions: string[] = [];

for (let i = 1; i <= numSudokus; i++) {
  console.log(`\nGenerating sudoku #${i}...`);
  
  const sudoku = new Sudoku();
  
  // Generate a puzzle
  sudoku.generate(SudokuDifficulty.EASY);
  
  // Get the solution
  const solution = sudoku.solve();
  
  // Store a string representation of the solution for comparison
  if (solution) {
    // Convert to a simple string for comparison
    const solutionStr = solution.flat().join('');
    solutions.push(solutionStr);
    
    // Print the solution grid
    console.log(`\nSolution #${i}:`);
    console.log(sudoku.prettyPrint(solution));
  }
}

// Compare the solutions to verify they are different
console.log('\n=== COMPARISON OF SOLUTIONS ===');
let allDifferent = true;

for (let i = 0; i < solutions.length; i++) {
  for (let j = i + 1; j < solutions.length; j++) {
    const areEqual = solutions[i] === solutions[j];
    console.log(`Solution #${i+1} vs Solution #${j+1}: ${areEqual ? 'SAME' : 'DIFFERENT'}`);
    
    if (areEqual) {
      allDifferent = false;
    }
  }
}

console.log(`\nOverall result: ${allDifferent ? 'ALL SOLUTIONS ARE DIFFERENT!' : 'Some solutions are still the same'}`);
console.log('If solutions are still the same, try running the example again as there is randomness involved.'); 