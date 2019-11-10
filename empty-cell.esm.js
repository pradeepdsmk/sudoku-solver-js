// import { NUMBERS } from './app.esm.js'

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

// export
class EmptyCell {
  constructor (_number, _rowIndex, _colIndex) {
    this.number = _number
    this.possibles = []
    this.rowIndex = _rowIndex
    this.colIndex = _colIndex
  }
}

EmptyCell.prototype.clone = function () {
  const cell = new EmptyCell(this.number, this.rowIndex, this.colIndex)
  cell.possibles = this.possibles.slice(0)
  return cell
}

EmptyCell.prototype.calculatePossibles = function (_a) {
  this.possibles = NUMBERS.slice(0)

  let i, j
  for (i = 0; i < 9; i++) {
    if (i === this.colIndex) {
      continue
    }
    this.eliminatePossible(_a[this.rowIndex][i])
  }

  for (i = 0; i < 9; i++) {
    if (i === this.rowIndex) {
      continue
    }
    this.eliminatePossible(_a[i][this.colIndex])
  }

  const subBoxRowStart = Math.floor(this.rowIndex / 3) * 3
  const subBoxColStart = Math.floor(this.colIndex / 3) * 3
  for (i = subBoxRowStart; i <= subBoxRowStart + 2; i++) {
    for (j = subBoxColStart; j <= subBoxColStart + 2; j++) {
      if (i === this.rowIndex || j === this.colIndex) {
        continue
      }
      this.eliminatePossible(_a[i][j])
    }
  }
}

EmptyCell.prototype.eliminatePossible = function (i) {
  if (i === 0) {
    return
  }

  const index = this.possibles.indexOf(i)
  if (index === -1) {
    return
  }

  this.possibles.splice(index, 1)
}
