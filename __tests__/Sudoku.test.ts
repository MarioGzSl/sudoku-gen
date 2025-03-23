import { Sudoku, SudokuDifficulty } from '../src';

describe('Sudoku', () => {
  describe('constructor', () => {
    it('should create an empty grid when no initial grid is provided', () => {
      const sudoku = new Sudoku();
      const grid = sudoku.getGrid();
      
      // Check dimensions
      expect(grid.length).toBe(9);
      for (let row = 0; row < 9; row++) {
        expect(grid[row].length).toBe(9);
      }
      
      // Check all cells are empty (0)
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          expect(grid[row][col]).toBe(0);
        }
      }
    });
    
    it('should initialize with a provided grid', () => {
      const initialGrid = [
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
      
      const sudoku = new Sudoku(initialGrid);
      const grid = sudoku.getGrid();
      
      // Check that the grid was correctly copied
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          expect(grid[row][col]).toBe(initialGrid[row][col]);
        }
      }
    });
    
    it('should throw an error when an invalid grid is provided', () => {
      const invalidGrid = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5]
        // Missing one row
      ];
      
      expect(() => new Sudoku(invalidGrid as any)).toThrow('Invalid Sudoku grid');
    });
  });
  
  describe('generate', () => {
    it('should generate a valid Sudoku puzzle', () => {
      const sudoku = new Sudoku();
      const grid = sudoku.generate();
      
      expect(sudoku.isValid()).toBe(true);
    });
    
    it('should generate puzzles with different difficulties', () => {
      const easyPuzzle = new Sudoku().generate(SudokuDifficulty.EASY);
      const hardPuzzle = new Sudoku().generate(SudokuDifficulty.HARD);
      
      // Count non-empty cells
      const countNonEmptyCells = (grid: number[][]) => {
        let count = 0;
        for (let row = 0; row < 9; row++) {
          for (let col = 0; col < 9; col++) {
            if (grid[row][col] !== 0) {
              count++;
            }
          }
        }
        return count;
      };
      
      const easyCount = countNonEmptyCells(easyPuzzle);
      const hardCount = countNonEmptyCells(hardPuzzle);
      
      // Hard puzzles should have fewer filled cells than easy puzzles
      expect(hardCount).toBeLessThan(easyCount);
    });
  });
  
  describe('solve', () => {
    it('should solve a valid Sudoku puzzle', () => {
      const initialGrid = [
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
      
      const sudoku = new Sudoku(initialGrid);
      const solution = sudoku.solve();
      
      expect(solution).not.toBeNull();
      expect(sudoku.isSolved()).toBe(true);
    });
  });
  
  describe('placeNumber', () => {
    it('should place a valid number', () => {
      const sudoku = new Sudoku();
      const result = sudoku.placeNumber({ row: 0, col: 0 }, 5);
      
      expect(result).toBe(true);
      expect(sudoku.getGrid()[0][0]).toBe(5);
    });
    
    it('should not place a number if it violates Sudoku rules', () => {
      const sudoku = new Sudoku();
      
      // Place a 5 at (0, 0)
      sudoku.placeNumber({ row: 0, col: 0 }, 5);
      
      // Try to place another 5 in the same row
      const result = sudoku.placeNumber({ row: 0, col: 3 }, 5);
      
      expect(result).toBe(false);
      expect(sudoku.getGrid()[0][3]).toBe(0); // Cell should remain empty
    });
  });
  
  describe('clearCell', () => {
    it('should clear a cell', () => {
      const sudoku = new Sudoku();
      
      // Place a number
      sudoku.placeNumber({ row: 0, col: 0 }, 5);
      expect(sudoku.getGrid()[0][0]).toBe(5);
      
      // Clear the cell
      const result = sudoku.clearCell({ row: 0, col: 0 });
      
      expect(result).toBe(true);
      expect(sudoku.getGrid()[0][0]).toBe(0);
    });
  });
}); 