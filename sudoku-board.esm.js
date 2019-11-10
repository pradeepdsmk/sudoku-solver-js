/* global EmptyCell */
// import { EmptyCell } from './empty-cell.esm.js'

// export
class SudokuBoard {
  constructor (_puzzle, _onCellUpdated) {
    this.a = []

    /** @type { EmptyCell[] } */
    this.emptyCells = []

    this.onCellUpdated = _onCellUpdated

    let i, j, cell

    for (i = 0; i < 9; i++) {
      this.a.push(Array(9).fill(0))
    }
    // this.a = Array(9).fill(Array(9).fill(0))

    for (i = 0; i < 9; i++) {
      for (j = 0; j < 9; j++) {
        this.a[i][j] = _puzzle[i][j]
        if (this.a[i][j] === 0) {
          cell = new EmptyCell(0, i, j)
          this.emptyCells.push(cell)
        }
      }
    }
  }
}

SudokuBoard.prototype.fixPossibles = function () {
  let numPossiblesFixed = 0
  let singlePossibleNumbersCount, singleOccuranceNumbersCount
  do {
    singlePossibleNumbersCount = this.updateSinglePossibleNumbers()
    // console.info(`total ${singlePossibleNumbersCount} single possible numbers updated`)

    singleOccuranceNumbersCount = this.updateSingleOccuranceNumbers()
    // console.info(`${singleOccuranceNumbersCount} single occurance numbers updated`)

    numPossiblesFixed = singlePossibleNumbersCount + singleOccuranceNumbersCount
  } while (numPossiblesFixed > 0)
}

SudokuBoard.prototype.isSolved = function () {
  return this.emptyCells.length === 0
}

SudokuBoard.prototype.clone = function () {
  const board = new SudokuBoard(this.a, this.onCellUpdated)
  return board
}

SudokuBoard.prototype.setCell = function (_number, _rowIndex, _colIndex) {
  this.a[_rowIndex][_colIndex] = _number
  // console.debug(`setCell (${_rowIndex}, ${_colIndex}) -> ${_number}`)
  this.updateUi(new EmptyCell(_number, _rowIndex, _colIndex))
  const index = this.emptyCells.findIndex(cell => cell.rowIndex === _rowIndex && cell.colIndex === _colIndex)
  if (index !== -1) {
    this.emptyCells.splice(index, 1)
  }
}

SudokuBoard.prototype.updateSinglePossibleNumbers = function () {
  /** @type { EmptyCell } */
  let cell

  /** @type { EmptyCell[] } */
  let cellsToUpdate

  let cumulativeTotalCellsUpdated = 0

  do {
    cellsToUpdate = []

    // console.debug(`updateSinglePossibleNumbers: ${this.emptyCells.length} empty cells identified`)

    for (cell of this.emptyCells) {
      cell.calculatePossibles(this.a)
      this.updateUi(cell)
      // console.debug(`updateSinglePossibleNumbers (${cell.rowIndex}, ${cell.colIndex}) -> ${cell.number}: ${cell.possibles.join(' ')}`)

      if (cell.possibles.length === 0) {
        throw new Error(`No possible numbers for cell at (${cell.rowIndex + 1}, ${cell.colIndex + 1})`)
      }

      if (cell.possibles.length === 1) {
        cellsToUpdate.push(new EmptyCell(cell.possibles[0], cell.rowIndex, cell.colIndex))
      }
    }

    // console.debug(`updateSinglePossibleNumbers: ${cellsToUpdate.length} empty cells have single possible numbers`)

    for (cell of cellsToUpdate) {
      this.setCell(cell.number, cell.rowIndex, cell.colIndex)
    }
    cumulativeTotalCellsUpdated += cellsToUpdate.length
  } while (cellsToUpdate.length > 0)

  return cumulativeTotalCellsUpdated
}

SudokuBoard.prototype.updateSingleOccuranceNumbers = function () {
/** @type { EmptyCell } */
  let cell

  /** @type { EmptyCell[] } */
  let cellsToUpdate

  let cumulativeTotalCellsUpdated = 0

  // do {
  cellsToUpdate = []

  // console.debug(`updateSingleOccuranceNumbers: ${this.emptyCells.length} empty cells identified`)

  for (cell of this.emptyCells) {
    const rowCellToUpdate = this.findSingleOccuranceNumbersIn(cell, this.otherEmptyRowCells(cell))
    if (rowCellToUpdate) {
      cellsToUpdate.push(rowCellToUpdate)
    } else {
      const colCellToUpdate = this.findSingleOccuranceNumbersIn(cell, this.otherEmptyColCells(cell))
      if (colCellToUpdate) {
        cellsToUpdate.push(colCellToUpdate)
      } else {
        const subBoxCellToUpdate = this.findSingleOccuranceNumbersIn(cell, this.otherEmptySubBoxCells(cell))
        if (subBoxCellToUpdate) {
          cellsToUpdate.push(subBoxCellToUpdate)
        }
      }
    }
  }

  // console.debug(`updateSingleOccuranceNumbers: ${cellsToUpdate.length} empty cells have single occurance numbers`)

  for (cell of cellsToUpdate) {
    this.setCell(cell.number, cell.rowIndex, cell.colIndex)
  }
  cumulativeTotalCellsUpdated += cellsToUpdate.length
  // } while (cellsToUpdate.length > 0)

  return cumulativeTotalCellsUpdated
}

SudokuBoard.prototype.otherEmptyRowCells = function (cell) {
  let i; let rowCell; const emptyRowCells = []
  for (i = 0; i < 9; i++) {
    if (i === cell.colIndex) {
      continue
    }

    rowCell = this.emptyCells.find(x => x.rowIndex === cell.rowIndex && x.colIndex === i)
    if (rowCell !== undefined) {
      emptyRowCells.push(rowCell)
    }
  }
  return emptyRowCells
}

SudokuBoard.prototype.otherEmptyColCells = function (cell) {
  let i; let colCell; const emptyColCells = []
  for (i = 0; i < 9; i++) {
    if (i === cell.rowIndex) {
      continue
    }
    colCell = this.emptyCells.find(x => x.rowIndex === i && x.colIndex === cell.colIndex)
    if (colCell !== undefined) {
      emptyColCells.push(colCell)
    }
  }
  return emptyColCells
}

SudokuBoard.prototype.otherEmptySubBoxCells = function (cell) {
  let i; let j; let subBoxCell; const emptySubBoxCells = []
  const subBoxRowStart = Math.floor(cell.rowIndex / 3) * 3
  const subBoxColStart = Math.floor(cell.colIndex / 3) * 3
  for (i = subBoxRowStart; i <= subBoxRowStart + 2; i++) {
    for (j = subBoxColStart; j <= subBoxColStart + 2; j++) {
      if (i === cell.rowIndex && j === cell.colIndex) {
        continue
      }
      subBoxCell = this.emptyCells.find(x => x.rowIndex === i && x.colIndex === cell.colIndex)
      if (subBoxCell !== undefined) {
        emptySubBoxCells.push(subBoxCell)
      }
    }
  }
  return emptySubBoxCells
}

SudokuBoard.prototype.findSingleOccuranceNumbersIn = function (cell, otherCells) {
  let possibleNumber, numOccurances, otherCell; const cellsToUpdate = []
  for (possibleNumber of cell.possibles) {
    numOccurances = 0
    for (otherCell of otherCells) {
      if (otherCell.possibles.includes(possibleNumber)) {
        numOccurances++
      }
    }
    if (numOccurances === 0) {
      cellsToUpdate.push(new EmptyCell(possibleNumber, cell.rowIndex, cell.colIndex))
    }
  }

  if (cellsToUpdate.length === 0) {
    return null
  }

  if (cellsToUpdate.length > 1) {
    const possibleNumbers = []
    let x
    for (x of cellsToUpdate) {
      possibleNumbers.push(x.number)
    }
    throw new Error(`Multiple single-occurance numbers ${possibleNumbers.join()} for single cell at (${cell.rowIndex},${cell.colIndex})`)
  }

  return cellsToUpdate[0]
}

SudokuBoard.prototype.updateUi = function (cell) {
  this.onCellUpdated(cell)
}
