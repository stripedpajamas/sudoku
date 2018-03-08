/**
 * Returns the square index based on row and column
 * @param {number} x the row
 * @param {number} y the column
 */
const findSquare = (x, y) => {
  // there's definitely a more mathematical approach to derive square index
  // from row and column, but my brain hurts already
  const allSquares = {
    0: ['00', '01', '02', '10', '11', '12', '20', '21', '22'],
    1: ['30', '31', '32', '40', '41', '42', '50', '51', '52'],
    2: ['60', '61', '62', '70', '71', '72', '80', '81', '82'],
    3: ['03', '04', '05', '13', '14', '15', '23', '24', '25'],
    4: ['33', '34', '35', '43', '44', '45', '53', '54', '55'],
    5: ['63', '64', '65', '73', '74', '75', '83', '84', '85'],
    6: ['06', '07', '08', '16', '17', '18', '26', '27', '28'],
    7: ['36', '37', '38', '46', '47', '48', '56', '57', '58'],
    8: ['66', '67', '68', '76', '77', '78', '86', '87', '88']
  }
  const square = Object.keys(allSquares).find(squareIdx => allSquares[squareIdx].includes(`${x}${y}`))
  const squareIdx = allSquares[square].findIndex(xy => xy === `${x}${y}`)
  return { square, squareIdx }
}

/**
 * Creates a map based on rows/columns/squares with
 * tile location -> possibile right answers
 * @param {object} puzzle - the object with rows/columns/squares
 */
const createPossibilityMap = (puzzle) => {
  const possibilityMap = {}
  puzzle.rows.forEach((row, rowIdx) => {
    // iterate through each row
    row.forEach((tile, tileIdx) => {
      // iterate through each tile
      const currentTileValue = tile
      if (currentTileValue !== 0) {
        // if tile is not blank, no need to process it
        return
      }

      const { square, squareIdx } = findSquare(rowIdx, tileIdx)
      // try every number, filter out collisions in rows/columns/squares
      const allPosibilities = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(guess => (
        !puzzle.rows[rowIdx].includes(guess) &&
        !puzzle.columns[tileIdx].includes(guess) &&
        !puzzle.squares[square].includes(guess)
      ))

      if (!allPosibilities.length) {
        // get out fast
        throw new Error(`Impossible puzzle state, no possibility for ${rowIdx}, ${tileIdx}`)
      }

      possibilityMap[`${rowIdx},${tileIdx}`] = {
        possibilities: allPosibilities,
        square: { square, squareIdx }
      }
    })
  })
  return possibilityMap
}

/**
 * Looks for sets of possibilities in same row/column/square
 * and removes those same entries from all other sets in the row/column/square.
 * Currently only looking for sets of 2
 * @param {object} puzzle
 * @param {object} possibilityMap
 */
const prunePossibilities = (inputPuzzle, inputPossibilityMap) => {
  const puzzle = inputPuzzle
  const possibilityMap = inputPossibilityMap

  // Rows
  puzzle.rows.forEach((row, rowIdx) => {
    row.forEach((tile, tileIdx) => {
      if (tile !== 0) {
        return
      }
      const tileId = `${rowIdx},${tileIdx}`
      const possibilities = possibilityMap[tileId].possibilities
      const match = Object.keys(possibilityMap).filter((xy) => {
        const split = xy.split(',')
        const x = parseInt(split[0], 10)
        const y = parseInt(split[1], 10)
        const anothersPossibilities = possibilityMap[xy].possibilities
        return (
          x === rowIdx && // same row
          y !== tileIdx && // not the same column
          possibilities.length === anothersPossibilities.length && // same number of possibilities
          possibilities.every((p, i) => anothersPossibilities[i] === p) && // they all match
          possibilities.length === 2 // because more than that is tricky
        )
      })
      if (match.length === 1) {
        // found a pair, so remove others in this row with those possibilities
        const pairId = match[0]
        const targets = possibilityMap[pairId].possibilities
        Object.keys(possibilityMap).forEach((xy) => {
          if (xy !== tileId && xy !== pairId) {
            const split = xy.split(',')
            const x = parseInt(split[0], 10)
            if (x === rowIdx) {
              possibilityMap[xy].possibilities = possibilityMap[xy].possibilities.filter(p => !targets.includes(p))
            }
          }
        })
      }
    })
  })

  // Columns
  puzzle.columns.forEach((column, columnIdx) => {
    column.forEach((tile, tileIdx) => {
      if (tile !== 0) {
        return
      }
      const tileId = `${tileIdx},${columnIdx}`
      const possibilities = possibilityMap[tileId].possibilities
      const match = Object.keys(possibilityMap).filter((xy) => {
        const split = xy.split(',')
        const x = parseInt(split[0], 10)
        const y = parseInt(split[1], 10)
        const anothersPossibilities = possibilityMap[xy].possibilities
        return (
          x !== tileIdx && // not the same row
          y === columnIdx && // same column
          possibilities.length === anothersPossibilities.length && // same number of possibilities
          possibilities.every((p, i) => anothersPossibilities[i] === p) && // they all match
          possibilities.length === 2 // because more than that is tricky
        )
      })
      if (match.length === 1) {
        // found a pair, so remove others in this column with those possibilities
        const pairId = match[0]
        const targets = possibilityMap[pairId].possibilities
        Object.keys(possibilityMap).forEach((xy) => {
          if (xy !== tileId && xy !== pairId) {
            const split = xy.split(',')
            const y = parseInt(split[1], 10)
            if (y === columnIdx) {
              possibilityMap[xy].possibilities = possibilityMap[xy].possibilities.filter(p => !targets.includes(p))
            }
          }
        })
      }
    })
  })
  return possibilityMap
}

/**
 * Updates the puzzle to fill in any tiles with only 1 possible correct answer
 * @param {object} puzzle the object with rows/columns/squares
 * @param {object} possibilityMap the map of all possible answers for each tile
 */
const updatePuzzle = (puzzle, possibilityMap) => {
  const updatedPuzzle = puzzle
  Object.keys(possibilityMap)
    .filter(xy => possibilityMap[xy].possibilities.length === 1)
    .forEach((xy) => {
      const split = xy.split(',')
      const x = parseInt(split[0], 10)
      const y = parseInt(split[1], 10)
      const definite = possibilityMap[xy].possibilities[0]
      const { square, squareIdx } = possibilityMap[xy].square
      updatedPuzzle.rows[x][y] = definite
      updatedPuzzle.columns[y][x] = definite
      updatedPuzzle.squares[square][squareIdx] = definite
    })
  return updatedPuzzle
}

/**
 * Verifies that there are no dupes in rows/columns/squares
 * @param {object} puzzle
 */
const verifyValid = (puzzle) => {
  const rowsGood = puzzle.rows.filter(x => x !== 0).every(row => (new Set(row)).size === row.length)
  const columnsGood = puzzle.columns.filter(x => x !== 0).every(column => (new Set(column)).size === column.length)
  const squaresGood = puzzle.squares.filter(x => x !== 0).every(square => (new Set(square)).size === square.length)

  return rowsGood && columnsGood && squaresGood
}

module.exports = {
  findSquare,
  createPossibilityMap,
  prunePossibilities,
  updatePuzzle,
  verifyValid
}
