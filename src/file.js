/**
 * Transforms input file into array of 9 rows
*/
module.exports = input => new Promise((resolve, reject) => {
  const output = {
    rows: [],
    columns: [],
    squares: []
  }
  // process rows
  let start = 0
  for (let i = 0; i < input.length; i++) {
    if (input[i] === 0x0a) {
      output.rows.push(input.slice(start, i).toString().split('').map(Number))
      output.columns.push([])
      output.squares.push([])
      start = ++i
    }
  }

  // derive columns from rows
  output.columns.forEach((column, columnIdx) => {
    output.rows.forEach((row) => {
      column.push(row[columnIdx])
    })
  })

  // populate squares
  for (let square = 0; square < 3; square++) {
    const workingIdx = square * 3
    for (let i = workingIdx; i < workingIdx + 3; i++) {
      for (let offset = 0; offset < 9; offset += 3) {
        for (let j = offset; j < offset + 3; j++) {
          output.squares[square + offset].push(output.rows[i][j])
        }
      }
    }
  }
  return resolve(output)
})
