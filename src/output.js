/** 
 * Logs input stream to console
*/
module.exports = inputPuzzle => {
  console.log(inputPuzzle.rows.map(row => row.join('')).join('\n'))
}