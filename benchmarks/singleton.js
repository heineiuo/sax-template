const fs = require('fs')
const Mustache = require('mustache')
const saxt = require('../lib/saxt')

const view = {
  title: { foo: "wo w", html: `
    </div>
      fdas
    </div>
  `},
  title1: 'wow',
  post: `
  <div><p>hello world</p></div>
  `
}


const template = `<html>
  <head>
    <meta charset="utf8" />
    <meta />
    <t-title title="{title}" children={title1}></t-title>
    </head>

    <body>
      <input type="text" >
      <p></p>
      <br/>
    </body>
  </html>
`

const cname = 'saxt'

console.time(cname)
const stream = saxt(template, view)

let result = ''
stream.on('data', (data) => {
  result += data
})

stream.on('end', () => {
  fs.writeFileSync(__dirname + '/template2-saxt.html', result, 'utf8')
  console.timeEnd(cname)
})