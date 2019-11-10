export var DelayedRendered = (function () {
  const delayIncrement = 200
  var tbody
  var delay
  var items

  var init = function (_tbody) {
    tbody = _tbody
    delay = 0
    items = []
  }

  var render = function (cell) {
    items.push(cell)
    setTimeout(function () {
      updateCell()
    }, delay)
    delay += delayIncrement
  }

  var updateCell = function () {
    const cell = items.shift()
    if (cell === undefined) {
      return
    }

    const td = tbody.rows[cell.rowIndex].cells[cell.colIndex]
    beginHighlightCell(td)
      .then(function () {
        return updateCellData(td, cell)
      })
      .then(function () {
        return endHighlightCell(td)
      })

    if (items.length === 0) {
      delay = 0 // reset
    }
  }

  var updateCellData = function (td, cell) {
    return new Promise(function (resolve, reject) {
      if (cell.number > 0) {
        td.textContent = cell.number
        td.classList.remove('diag')
      } else {
        td.textContent = cell.possibles.join(' ')
        td.classList.add('diag')
      }

      setTimeout(function () {
        resolve()
      }, delayIncrement)
    })
  }

  var beginHighlightCell = function (td) {
    return new Promise(function (resolve, reject) {
      td.classList.add('highlight')
      setTimeout(function () {
        resolve()
      }, delayIncrement / 2)
    })
  }

  var endHighlightCell = function (td) {
    return new Promise(function (resolve, reject) {
      td.classList.remove('highlight')
      resolve()
    })
  }

  return {
    init: init,
    render: render
  }
})()
