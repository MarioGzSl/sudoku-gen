# sudoku-easy-solver

A TypeScript library for generating, solving and validating Sudoku puzzles.

## Installation

```bash
npm install sudoku-easy-solver
```

## Usage

### Creating a Sudoku

```typescript
import { Sudoku, SudokuDifficulty } from 'sudoku-easy-solver';

// Create an empty Sudoku
const sudoku = new Sudoku();

// Generate a new Sudoku with medium difficulty (default)
sudoku.generate();

// Generate a Sudoku with specific difficulty
sudoku.generate(SudokuDifficulty.HARD);

// Get the current grid
const grid = sudoku.getGrid();
console.log(grid);
```

### Setting an existing Sudoku

```typescript
import { Sudoku } from 'sudoku-easy-solver';

// Example Sudoku grid (0 represents empty cells)
const grid = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

// Create a Sudoku with the existing grid
const sudoku = new Sudoku(grid);

// Or set a grid to an existing Sudoku instance
const emptySudoku = new Sudoku();
emptySudoku.setGrid(grid);
```

### Solving a Sudoku

```typescript
import { Sudoku } from 'sudoku-easy-solver';

// Create a Sudoku with an existing grid
const sudoku = new Sudoku(existingGrid);

// Solve the Sudoku
const solution = sudoku.solve();

if (solution) {
  console.log('Sudoku solved:', solution);
} else {
  console.log('No solution exists for this Sudoku');
}
```

### Getting a hint

```typescript
import { Sudoku } from 'sudoku-easy-solver';

const sudoku = new Sudoku(existingGrid);

const hint = sudoku.getHint();
if (hint) {
  const { position, value } = hint;
  console.log(`Hint: Place ${value} at row ${position.row}, column ${position.col}`);
}
```

### Checking if a Sudoku is valid or solved

```typescript
import { Sudoku } from 'sudoku-easy-solver';

const sudoku = new Sudoku(existingGrid);

// Check if the Sudoku is valid (follows Sudoku rules)
const isValid = sudoku.isValid();
console.log('Is valid:', isValid);

// Check if the Sudoku is solved (completely filled and valid)
const isSolved = sudoku.isSolved();
console.log('Is solved:', isSolved);
```

### Placing numbers manually

```typescript
import { Sudoku } from 'sudoku-easy-solver';

const sudoku = new Sudoku();

// Place a number at a specific position
const success = sudoku.placeNumber({ row: 0, col: 0 }, 5);
if (success) {
  console.log('Number placed successfully');
} else {
  console.log('Invalid move');
}

// Clear a cell
sudoku.clearCell({ row: 0, col: 0 });
```

## Development

### CI/CD

This project uses GitHub Actions for continuous integration and deployment:

- **Validation**: Runs tests on pull requests to ensure code quality
- **Automatic Publishing**: When you push to the main branch with an updated version in package.json, the package is automatically published to npm

For more details on the npm publishing workflow, see [.github/README.md](.github/README.md).

## License

MIT 