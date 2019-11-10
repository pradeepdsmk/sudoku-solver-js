/* global SudokuBoard */
// import { SudokuBoard } from './sudoku-board.esm.js'

// export
var SudokuSolver = (function () {
  const MAX_RECURSSIONS = 40
  var recurssionCount, stop
  var onCellUpdated

  var init = function (_onCellUpdated) {
    recurssionCount = 0
    stop = false
    onCellUpdated = _onCellUpdated
  }

  var solve = function (puzzle) {
    const board = new SudokuBoard(puzzle, onCellUpdated)

    recursiveSolve(board)
    console.info(`solved puzzle after ${recurssionCount} recurssions`)
  }

  var recursiveSolve = function (board) {
    recurssionCount++
    console.info('board# ' + recurssionCount)
    if (recurssionCount > MAX_RECURSSIONS) {
      stop = true
    }
    if (stop) {
      return
    }

    let emptyCell, newBoard, possibleNumber

    try {
      board.fixPossibles()
    } catch (ex) {
      console.info('caught exception', ex)
      return
    }

    if (!board.isSolved()) {
      for (emptyCell of board.emptyCells) {
        for (possibleNumber of emptyCell.possibles) {
          newBoard = board.clone()
          newBoard.setCell(possibleNumber, emptyCell.rowIndex, emptyCell.colIndex)
          recursiveSolve(newBoard)
          if (stop) {
            return
          }
        }
        if (stop) {
          return
        }
      }
    } else {
      stop = true
    }
  }

  return {
    init: init,
    solve: solve
  }
})()
