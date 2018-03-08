/** 
 * Confirms that all rows, columns, and squares add up to 45
 * 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 = 45
*/
module.exports = inputPuzzle => new Promise((resolve, reject) => {
  const goodRows = inputPuzzle.rows.map(row => row.reduce((sum, tile) => sum + tile, 0)).every(row => row === 45)
  const goodColumns = inputPuzzle.columns.map(column => column.reduce((sum, tile) => sum + tile, 0)).every(column => column === 45)
  const goodSquares = inputPuzzle.squares.map(square => square.reduce((sum, tile) => sum + tile, 0)).every(square => square === 45)

  if (!goodRows || !goodColumns || !goodSquares) {
    console.log(inputPuzzle)
    throw new Error('Solved puzzle is invalid! :(')
  }
  return resolve(inputPuzzle)
})