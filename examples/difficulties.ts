import { Sudoku, SudokuDifficulty } from '../src/index';

// Function to generate a sudoku with a specific difficulty
function generateAndDisplaySudoku(difficulty: SudokuDifficulty): void {
  console.log(`\n=== GENERATING ${difficulty.toUpperCase()} SUDOKU ===\n`);
  
  const sudoku = new Sudoku();
  const grid = sudoku.generate(difficulty);
  
  console.log(sudoku.prettyPrint());
  
  // Count empty cells to verify the difficulty level
  let emptyCells = 0;
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        emptyCells++;
      }
    }
  }
  
  console.log(`Empty cells: ${emptyCells} out of 81 (${Math.round(emptyCells/81*100)}%)`);
  
  // If we also want to display the solution for verification
  console.log("\nSolution:");
  const solution = sudoku.solve();
  if (solution) {
    console.log(sudoku.prettyPrint(solution));
  } else {
    console.log("No solution found.");
  }
}

// Generate a sudoku for each difficulty level
generateAndDisplaySudoku(SudokuDifficulty.EASY);
generateAndDisplaySudoku(SudokuDifficulty.MEDIUM);
generateAndDisplaySudoku(SudokuDifficulty.HARD);
generateAndDisplaySudoku(SudokuDifficulty.EXPERT); 