import { DelayedRendered } from './delayed-renderer.esm.js'

export const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export var App = (function () {
  var isInitialized = false

  /** @type { HTMLElement } */
  var puzzleContainer

  /** @type { HTMLTableSectionElement } */
  var tbody

  /** @type { HTMLButtonElement } */
  var resetButton

  /** @type { HTMLButtonElement } */
  var solveButton

  /** @type { HTMLButtonElement } */
  var randomPuzzleGenerateButton

  var puzzle

  var worker

  var init = function () {
    if (isInitialized) {
      return
    }

    drawBoard()

    resetButton = document.getElementById('reset')
    solveButton = document.getElementById('solve')
    randomPuzzleGenerateButton = document.getElementById('random-puzzle-generate')

    bindUiActions()

    DelayedRendered.init(tbody)

    worker = new Worker('worker.js')
    worker.onmessage = function (e) {
      if (e.data.msg === 'onCellUpdated') {
        updateCell(e.data.cell)
      }
      if (e.data.msg === 'done') {
        solveButton.disabled = true
        resetButton.disabled = false
        randomPuzzleGenerateButton.disabled = true
      }
    }

    isInitialized = true
  }

  var drawBoard = function () {
    puzzleContainer = document.getElementById('puzzle-container')
    let tr, td, i, j
    const table = document.createElement('table')
    tbody = document.createElement('tbody')
    table.appendChild(tbody)

    const tdProto = document.createElement('td')
    tdProto.contentEditable = true
    tdProto.classList.add('cell')

    for (i = 0; i < 9; i++) {
      tr = document.createElement('tr')
      for (j = 0; j < 9; j++) {
        td = tdProto.cloneNode()
        td.dataset.row = i
        td.dataset.col = j
        tr.appendChild(td)
      }
      tbody.appendChild(tr)
    }

    puzzleContainer.appendChild(table)
  }

  var bindUiActions = function () {
    puzzleContainer.addEventListener('keydown', onKeyDown)

    solveButton.addEventListener('click', onSolve)

    randomPuzzleGenerateButton.addEventListener('click', onRandomPuzzleGenerate)

    resetButton.addEventListener('click', onReset)
  }

  var onReset = function (e) {
    let row, cell
    for (row of tbody.rows) {
      for (cell of row.cells) {
        cell.classList.remove('frozen')
        cell.textContent = ''
      }
    }

    resetPuzzle()

    resetButton.disabled = false
    randomPuzzleGenerateButton.disabled = false
    solveButton.disabled = false
  }

  var resetPuzzle = function () {
    // puzzle = Array(9).fill(Array(9).fill(0))
    let i
    for (i = 0; i < 9; i++) {
      puzzle.push(Array(9).fill(0))
    }
  }

  var onSolve = function (e) {
    solveButton.disabled = true
    resetButton.disabled = true
    randomPuzzleGenerateButton.disabled = true

    // SudokuSolver.init(puzzle)
    // SudokuSolver.solve()

    worker.postMessage({ msg: 'solve', puzzle: puzzle })

    freezeBoard()
  }

  var updateCell = function (cell) {
    DelayedRendered.render(cell)
  }

  var onRandomPuzzleGenerate = function (e) {
    const a = [
      [6, 0, 8, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 6, 0, 9, 2, 1, 0],
      [0, 3, 0, 0, 0, 0, 4, 0, 7],

      [7, 0, 0, 0, 9, 0, 8, 5, 0],
      [0, 2, 0, 7, 4, 5, 0, 9, 0],
      [0, 5, 1, 0, 6, 0, 0, 0, 3],

      [4, 0, 2, 0, 0, 0, 0, 7, 0],
      [0, 8, 6, 5, 0, 4, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 6, 0, 4]
    ]

    // const a = [
    //   [0, 0, 0, 0, 0, 8, 0, 0, 5],
    //   [3, 0, 7, 2, 0, 0, 0, 0, 1],
    //   [0, 0, 8, 0, 0, 4, 0, 0, 2],

    //   [0, 0, 0, 0, 0, 0, 0, 1, 0],
    //   [0, 9, 0, 6, 1, 7, 0, 3, 0],
    //   [0, 5, 0, 0, 0, 0, 0, 0, 0],

    //   [1, 0, 0, 5, 0, 0, 9, 0, 0],
    //   [9, 0, 0, 0, 0, 1, 8, 0, 3],
    //   [6, 0, 0, 4, 0, 0, 0, 0, 0]
    // ]

    puzzle = a

    renderPuzzle()
  }

  var renderPuzzle = function () {
    let i, j
    for (i = 0; i < 9; i++) {
      for (j = 0; j < 9; j++) {
        if (puzzle[i][j] === 0) {
          continue
        }
        tbody.rows[i].cells[j].textContent = puzzle[i][j]
      }
    }

    freezeBoard()
  }

  var freezeBoard = function () {
    let row, cell
    for (row of tbody.rows) {
      for (cell of row.cells) {
        if (NUMBERS.includes(parseInt(cell.textContent))) {
          cell.classList.add('frozen')
        }
      }
    }
  }

  var onKeyDown = function (e) {
    if (!e.target.classList.contains('cell')) {
      e.preventDefault()
      return false
    }

    const keysToHandle = ['Delete', 'Backspace', 'Tab', 'Enter']

    const td = e.target
    const key = e.key

    if (isArrowKeyEventHandled(key, td)) {
      // e.preventDefault()
      return true
    }

    if (td.classList.contains('frozen')) {
      if (keysToHandle.includes(key)) {
        e.preventDefault()
        return false
      }

      if (key.length > 1) {
        return true // let window handle it
      }

      // we prevent everything else
      e.preventDefault()
      return false
    } else {
      if (keysToHandle.includes(key)) {
        // we handle only delete key
        if (key === 'Delete') {
          return true
        }
        // rest all, we prevent
        e.preventDefault()
        return false
      }

      // non-printable characters
      if (key.length > 1) {
        return false
      }

      const number = parseInt(key)
      if (!NUMBERS.includes(number)) {
        e.preventDefault()
        return false
      }

      td.textContent = ''
    }
  }

  var isArrowKeyEventHandled = function (key, td) {
    const row = parseInt(td.dataset.row)
    const col = parseInt(td.dataset.col)
    if (key === 'ArrowLeft') {
      moveCellFocus(row, col - 1)
      return true
    } else if (key === 'ArrowRight') {
      moveCellFocus(row, col + 1)
      return true
    } else if (key === 'ArrowUp') {
      moveCellFocus(row - 1, col)
      return true
    } else if (key === 'ArrowDown') {
      moveCellFocus(row + 1, col)
      return true
    }
    return false
  }

  var moveCellFocus = function (row, col) {
    if (col === 9) {
      col = 0
      row++
    }

    if (col === -1) {
      col = 8
      row--
    }

    if (row === 9) {
      row = 0
    }

    if (row === -1) {
      row = 8
    }

    if (row >= 0 && row < 9 && col >= 0 && col < 9) {
      tbody.rows[row].cells[col].focus()
      return true
    }
  }

  return {
    init: init
  }
})()
