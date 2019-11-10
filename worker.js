/* global SudokuSolver */
importScripts('./sudoku-solver.esm.js', './sudoku-board.esm.js', './empty-cell.esm.js')

var onCellUpdated = function (cell) {
  postMessage({ msg: 'onCellUpdated', cell: cell })
}

onmessage = function (e) {
  SudokuSolver.init(onCellUpdated)
  SudokuSolver.solve(e.data.puzzle)
  postMessage({ msg: 'done' })
}
