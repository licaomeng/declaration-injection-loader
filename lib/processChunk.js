const getOptionsArray = require('./getOptionsArray')
const inject = require('./inject')

function processChunk(source, map) {
  this.cacheable()

  const optionsArray = getOptionsArray(this)
  let newSource = source

  for (const options of optionsArray) {
    newSource = inject(newSource, options)
  }

  this.callback(null, newSource, map)
}

module.exports = processChunk
