# Test puzzle attribution

`norvig-top95.txt` contains Peter Norvig's 95 difficult Sudoku examples, retrieved
from https://norvig.com/top95.txt on 2026-10-19. Background and solving techniques:
https://norvig.com/sudoku.html.

These puzzle data exercise a range of search paths. Tests independently check every
row, column, box and original clue; they do not merely compare two calls to our solver.
Generator tests also use a separate, set-based solution counter.
