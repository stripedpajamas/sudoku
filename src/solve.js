const utility = require('./util')

/**
 * the main solver
 */
module.exports = inputPuzzle => new Promise((resolve, reject) => {
  const puzzle = inputPuzzle
  let map = utility.createPossibilityMap(puzzle)
  let updatedPuzzle = utility.updatePuzzle(puzzle, map)
  let newUpdatedPuzzle
  let newMap
  let mainIterations = 0
  let stage1Iterations = 0
  
  while (Object.keys(map).length) {
    // stage 1: get the obvious stuff
    while (Object.keys(map).length) {
      newUpdatedPuzzle = utility.updatePuzzle(updatedPuzzle, map)
      newMap = utility.createPossibilityMap(newUpdatedPuzzle)
      if (Object.keys(map).every((xy, idx) => xy === Object.keys(newMap)[idx])) {
        // new map has all the same entries as old map, so nothing was updated
        break
      }
      map = newMap
      updatedPuzzle = newUpdatedPuzzle
      stage1Iterations++
    }

    // stage 2: prune the map
    map = utility.prunePossibilities(updatedPuzzle, newMap)
    updatedPuzzle = utility.updatePuzzle(updatedPuzzle, newMap)
    mainIterations++
    if (mainIterations > 100) {
      throw new Error('We appear to be stuck :(')
    }
  }
  console.log('Solved in %d main iterations, %d sub-iterations', mainIterations, stage1Iterations)
  return resolve(updatedPuzzle)
})