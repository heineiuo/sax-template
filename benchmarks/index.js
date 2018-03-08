const fs = require('fs')
const Mustache = require('mustache')
const saxt = require('../lib/saxt')

const view = {
  title: "wow",
  post: `
  <div><p>hello world</p></div>
  `
}


const justCopy = (cname) => new Promise(resolve => {
  console.time(cname)

  const template = fs.createReadStream(__dirname + '/template2.html')

  const stream = template

  let result = ''
  stream.on('data', (data) => {
    result += data
  })

  stream.on('end', () => {
    fs.writeFileSync(__dirname + '/template2-copy.html', result, 'utf8')
    console.timeEnd(cname)
    resolve()
  })
})



const runSaxt = (cname) => new Promise(resolve => {
  console.time(cname)

  // const template = fs.readFileSync('./template2.html', 'utf8')
  const template = fs.createReadStream(__dirname + '/template2.html')

  const stream = saxt(template, view)

  let result = ''
  stream.on('data', (data) => {
    result += data
  })

  stream.on('end', () => {
    fs.writeFileSync(__dirname + '/template2-saxt.html', result, 'utf8')
    console.timeEnd(cname)
    resolve()
  })
})

const runMustache = (cname) => {
  console.time(cname)
  const msttemplate = fs.readFileSync(__dirname + '/template2.mst', 'utf8')
  const result = Mustache.render(msttemplate, view)
  fs.writeFileSync(__dirname + '/template2-mst.html', result, 'utf8')
  console.timeEnd(cname)
}


process.nextTick(async () => {
  await justCopy('justcopy')
  await runSaxt('saxt')
  await runMustache('mustache')
  await runMustache('mustache twice')
})