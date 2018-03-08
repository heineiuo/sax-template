const fs = require('fs')

const saxt = require('./lib/saxt')


const template = fs.readFileSync('./template.html', 'utf8')
// const template = fs.createReadStream('./template.html')


console.time('saxt')

const stream = saxt(template)

let result = ''
stream.on('data', (data) => {
  result += data
})

stream.on('end', () => {
  console.timeEnd('saxt')
  // console.log(result)
})
