const fs = require('fs')
const Mustache = require('mustache')
const saxt = require('../lib/saxt')

const view = {
  title: "wow",
  post: `
  <div><p>hello world</p></div>
  `
}



const runSaxt = () => new Promise(resolve => {
  console.time('saxt')

  // const template = fs.readFileSync('./template2.html', 'utf8')
  const template = fs.createReadStream(__dirname + '/template2.html')

  const stream = saxt(template, view)

  let result = ''
  stream.on('data', (data) => {
    result += data
  })

  stream.on('end', () => {
    console.timeEnd('saxt')
    fs.writeFileSync(__dirname + '/template2-saxt.html', result, 'utf8')
    resolve()
  })
})

const runMustache = () => {
  console.time('mustache')
  const msttemplate = fs.readFileSync(__dirname + '/template2.mst', 'utf8')
  
  const result = Mustache.render(msttemplate, view)
  console.timeEnd('mustache')
  fs.writeFileSync(__dirname + '/template2-mst.html', result, 'utf8')
}


process.nextTick(async () => {
  await runSaxt()
  await runMustache()
})