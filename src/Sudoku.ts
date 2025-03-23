import { SudokuGrid, SudokuDifficulty, Position } from './types';

/**
 * Sudoku class to generate, set and solve Sudoku puzzles
 */
export class Sudoku {
  private grid: SudokuGrid = Array(9).fill(0).map(() => Array(9).fill(0));
  private solution: SudokuGrid | null = null;

  /**
   * Constructor for Sudoku class
   * @param grid Optional initial grid
   */
  constructor(grid?: SudokuGrid) {
    if (grid) {
      this.setGrid(grid);
    }
  }

  /**
   * Get the current Sudoku grid
   * @returns The current grid
   */
  public getGrid(): SudokuGrid {
    return this.grid.map(row => [...row]);
  }

  /**
   * Set a grid to an existing Sudoku
   * @param grid The grid to set
   * @throws Error if the grid is invalid
   */
  public setGrid(grid: SudokuGrid): void {
    if (!this.isValidGrid(grid)) {
      throw new Error('Invalid Sudoku grid');
    }
    
    // Deep copy the grid
    this.grid = grid.map(row => [...row]);
    this.solution = null; // Reset solution when grid changes
  }

  /**
   * Generate a new Sudoku puzzle
   * @param difficulty The difficulty level of the puzzle
   * @returns The generated grid
   */
  public generate(difficulty: SudokuDifficulty = SudokuDifficulty.MEDIUM): SudokuGrid {
    // Generate a solved Sudoku first
    this.grid = Array(9).fill(0).map(() => Array(9).fill(0));
    this.solve();
    
    // Store the solution
    this.solution = this.grid.map(row => [...row]);
    
    // Remove numbers based on difficulty
    const cellsToRemove = this.getCellsToRemoveByDifficulty(difficulty);
    this.removeRandomCells(cellsToRemove);
    
    return this.getGrid();
  }

  /**
   * Solve the current Sudoku puzzle
   * @returns The solved grid or null if no solution exists
   */
  public solve(): SudokuGrid | null {
    const emptyCells = this.findEmptyCells();
    
    if (emptyCells.length === 0) {
      // Grid is already filled
      return this.getGrid();
    }
    
    // Make a copy of the grid to work with
    const workingGrid = this.grid.map(row => [...row]);
    
    if (this.solveRecursive(workingGrid)) {
      this.grid = workingGrid;
      this.solution = workingGrid.map(row => [...row]);
      return this.getGrid();
    }
    
    return null;
  }

  /**
   * Check if the current Sudoku is valid
   * @returns True if valid, false otherwise
   */
  public isValid(): boolean {
    return this.isValidGrid(this.grid);
  }

  /**
   * Check if the current Sudoku is solved
   * @returns True if solved, false otherwise
   */
  public isSolved(): boolean {
    // A solved Sudoku has all cells filled and is valid
    const hasEmptyCells = this.grid.some(row => row.includes(0));
    return !hasEmptyCells && this.isValid();
  }

  /**
   * Get a hint for the next move
   * @returns A position and value for the next move, or null if no hint is available
   */
  public getHint(): { position: Position, value: number } | null {
    if (!this.solution) {
      this.solve();
      if (!this.solution) {
        return null; // No solution exists
      }
    }
    
    // Find an empty cell
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.grid[row][col] === 0) {
          return {
            position: { row, col },
            value: this.solution[row][col]
          };
        }
      }
    }
    
    return null; // No empty cells
  }

  /**
   * Place a number in the grid
   * @param position Position to place the number
   * @param value Number to place (1-9)
   * @returns True if the number was placed, false if it's an invalid move
   */
  public placeNumber(position: Position, value: number): boolean {
    const { row, col } = position;
    
    // Validate bounds
    if (row < 0 || row >= 9 || col < 0 || col >= 9) {
      return false;
    }
    
    // Validate value
    if (value < 1 || value > 9) {
      return false;
    }
    
    // Check if the cell is already filled
    if (this.grid[row][col] !== 0) {
      return false;
    }
    
    // Check if the placement is valid
    if (!this.isValidPlacement(row, col, value)) {
      return false;
    }
    
    // Place the number
    this.grid[row][col] = value;
    return true;
  }

  /**
   * Clear a cell in the grid
   * @param position Position to clear
   * @returns True if the cell was cleared, false otherwise
   */
  public clearCell(position: Position): boolean {
    const { row, col } = position;
    
    // Validate bounds
    if (row < 0 || row >= 9 || col < 0 || col >= 9) {
      return false;
    }
    
    this.grid[row][col] = 0;
    return true;
  }

  /**
   * Reset the grid to empty
   */
  public reset(): void {
    this.grid = Array(9).fill(0).map(() => Array(9).fill(0));
    this.solution = null;
  }

  /**
   * Print the Sudoku grid in a pretty format
   * @param grid The grid to print (defaults to the current grid)
   * @returns A string representation of the grid in a nice format
   */
  public prettyPrint(grid?: SudokuGrid): string {
    const gridToPrint = grid || this.grid;
    let result = '';
    
    // Top border
    result += '+-------+-------+-------+\n';
    
    for (let row = 0; row < 9; row++) {
      result += '| ';
      
      for (let col = 0; col < 9; col++) {
        // Add the cell value (empty space for 0)
        const cellValue = gridToPrint[row][col] === 0 ? ' ' : gridToPrint[row][col];
        result += cellValue + ' ';
        
        // Add vertical separator after every 3 columns
        if ((col + 1) % 3 === 0) {
          result += '| ';
        }
      }
      
      result += '\n';
      
      // Add horizontal separator after every 3 rows
      if ((row + 1) % 3 === 0 && row < 8) {
        result += '+-------+-------+-------+\n';
      }
    }
    
    // Bottom border
    result += '+-------+-------+-------+\n';
    
    return result;
  }

  // Private helper methods

  /**
   * Check if a grid is valid
   * @param grid The grid to check
   * @returns True if valid, false otherwise
   */
  private isValidGrid(grid: SudokuGrid): boolean {
    // Check dimensions
    if (grid.length !== 9) {
      return false;
    }
    
    for (let row = 0; row < 9; row++) {
      if (grid[row].length !== 9) {
        return false;
      }
      
      // Check if all values are valid
      for (let col = 0; col < 9; col++) {
        const value = grid[row][col];
        if (value < 0 || value > 9 || !Number.isInteger(value)) {
          return false;
        }
        
        // Skip checking empty cells
        if (value === 0) {
          continue;
        }
        
        // Temporarily set cell to empty to check if placement is valid
        const temp = grid[row][col];
        grid[row][col] = 0;
        const isValid = this.isValidPlacement(row, col, temp, grid);
        grid[row][col] = temp;
        
        if (!isValid) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Check if a number can be placed at a specific position
   * @param row Row index
   * @param col Column index
   * @param value Value to place
   * @param grid Optional grid to check against (defaults to this.grid)
   * @returns True if valid, false otherwise
   */
  private isValidPlacement(row: number, col: number, value: number, grid: SudokuGrid = this.grid): boolean {
    // Check row
    for (let c = 0; c < 9; c++) {
      if (c !== col && grid[row][c] === value) {
        return false;
      }
    }
    
    // Check column
    for (let r = 0; r < 9; r++) {
      if (r !== row && grid[r][col] === value) {
        return false;
      }
    }
    
    // Check 3x3 box
    const boxStartRow = Math.floor(row / 3) * 3;
    const boxStartCol = Math.floor(col / 3) * 3;
    
    for (let r = boxStartRow; r < boxStartRow + 3; r++) {
      for (let c = boxStartCol; c < boxStartCol + 3; c++) {
        if (r !== row && c !== col && grid[r][c] === value) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Find all empty cells in the grid
   * @returns Array of empty cell positions
   */
  private findEmptyCells(): Position[] {
    const emptyCells: Position[] = [];
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.grid[row][col] === 0) {
          emptyCells.push({ row, col });
        }
      }
    }
    
    return emptyCells;
  }

  /**
   * Recursive solver using backtracking
   * @param grid Grid to solve
   * @returns True if solved, false otherwise
   */
  private solveRecursive(grid: SudokuGrid): boolean {
    // Find an empty cell
    let emptyCell: Position | null = null;
    
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          emptyCell = { row, col };
          break;
        }
      }
      if (emptyCell) break;
    }
    
    // If no empty cell is found, the puzzle is solved
    if (!emptyCell) {
      return true;
    }
    
    const { row, col } = emptyCell;
    
    // Try placing each number 1-9
    for (let num = 1; num <= 9; num++) {
      if (this.isValidPlacement(row, col, num, grid)) {
        // Place number
        grid[row][col] = num;
        
        // Recursively solve the rest of the puzzle
        if (this.solveRecursive(grid)) {
          return true;
        }
        
        // If placing this number doesn't lead to a solution, backtrack
        grid[row][col] = 0;
      }
    }
    
    // No solution found with the current configuration
    return false;
  }

  /**
   * Get the number of cells to remove based on difficulty
   * @param difficulty The difficulty level
   * @returns Number of cells to remove
   */
  private getCellsToRemoveByDifficulty(difficulty: SudokuDifficulty): number {
    switch (difficulty) {
      case SudokuDifficulty.EASY:
        return 35; // 46 filled cells
      case SudokuDifficulty.MEDIUM:
        return 45; // 36 filled cells
      case SudokuDifficulty.HARD:
        return 52; // 29 filled cells
      case SudokuDifficulty.EXPERT:
        return 58; // 23 filled cells
      default:
        return 45; // Default to medium
    }
  }

  /**
   * Remove random cells from the grid
   * @param count Number of cells to remove
   */
  private removeRandomCells(count: number): void {
    const positions: Position[] = [];
    
    // Get all positions
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        positions.push({ row, col });
      }
    }
    
    // Shuffle positions
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    
    // Remove cells
    for (let i = 0; i < Math.min(count, positions.length); i++) {
      const { row, col } = positions[i];
      this.grid[row][col] = 0;
    }
  }
} 