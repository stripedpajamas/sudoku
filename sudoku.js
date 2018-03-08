const fs = require('fs')
const path = require('path')
const processFile = require('./src/file')
const solve = require('./src/solve')
const verify = require('./src/verify')
const output = require('./src/output')

const file = fs.readFileSync(path.resolve(__dirname, process.argv[2]))

processFile(file)
  .then(solve)
  .then(verify)
  .then(output)
  .catch(e => console.log('Could not solve puzzle:', e))
