# sudoku-gen Examples

This folder contains several examples showing how to use the sudoku-gen library to generate and solve Sudoku puzzles.

## Available Examples

### 1. Solving a Predefined Sudoku
**File:** `solve.ts`

This example shows how to solve an existing Sudoku using a predefined grid.

To run:
```bash
npx ts-node examples/solve.ts
```

### 2. Generate and Solve a Sudoku
**File:** `generate-and-solve.ts`

This example shows how to generate a new Sudoku and then solve it.

To run:
```bash
npx ts-node examples/generate-and-solve.ts
```

### 3. Generate Sudokus with Different Difficulty Levels
**File:** `difficulties.ts`

This example generates Sudokus with all available difficulty levels (EASY, MEDIUM, HARD, EXPERT) and shows the solutions.

To run:
```bash
npx ts-node examples/difficulties.ts
```

### 4. Using the Hint System
**File:** `hints.ts`

This example simulates a game where the user requests hints to solve a Sudoku.

To run:
```bash
npx ts-node examples/hints.ts
```

## How to Run the Examples

Make sure you have all dependencies installed:

```bash
npm install
```

Then you can run any of the examples with:

```bash
npx ts-node examples/[filename].ts
```

## Additional Notes

- Each example is commented to facilitate understanding
- You can modify the examples to adapt them to your needs
- The generated Sudokus will be different each time you run the examples 