const Mustache = require('mustache')
const fs = require('fs')
const template = fs.readFileSync('./template.html', 'utf8')

console.time('mustache')

Mustache.render(template, {})

console.timeEnd('mustache')