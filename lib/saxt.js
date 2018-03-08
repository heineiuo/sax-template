const sax = require('sax')
const EventEmitter = require('events')
const get = require('lodash.get')

const singletonTags = [
  "area",
  "base",
  "br",
  "col",
  "command",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]

const DEFAULT_BUF_SIZE = 200

const getTagName = function (tag, tagPrefix) {
  let lowTag = tag.toLowerCase()
  return lowTag.indexOf(tagPrefix) === 0 ? lowTag.substr(tagPrefix.length) : lowTag
}


const saxt = function (template, view, options) {

  if (!view) {
    view = {}
  }

  if (!options) {
    options = {
      tagPrefix: 't-'
    }
  }

  const BUF_SIZE = options.BUF_SIZE || DEFAULT_BUF_SIZE
  const tagPrefix = (options.tagPrefix || 't-').toLowerCase()
  const emitter = new EventEmitter()
  const parser = sax.parser(false, options)


  let buf = ''
  const lazyEmit = function (data, force) {
    force = typeof force === 'boolean' ? force : false
    buf += data
    if ((buf.length > BUF_SIZE) || force) {
      emitter.emit('data', buf)
      buf = ''
    }
  }

  const unclosedTag = []

  parser.onerror = function (e) {
    emitter.emit('error', e)
  }
  parser.ontext = function (t) {
    lazyEmit(t)
  }

  // opened a tag.  node has "name" and "attributes"
  parser.onopentag = function (node) {

    const rawTag = node.name
    const attributes = node.attributes
    const tag = getTagName(node.name, tagPrefix)

    let attrStr = ''
    let children = ''
    Object.keys(attributes).forEach(function (rawKey) {
      const key = rawKey.toLowerCase()
      let value = attributes[rawKey] || ''
      if (value.indexOf("{") === 0) {
        let closePos = value.indexOf('}')
        if (closePos > 0) {
          value = get(view, value.substr(1, closePos - 1)) || ''
        }
      }
      if (!(typeof value === 'string')) {
        value = encodeURIComponent(JSON.stringify(value))
      }
      if (key === 'children') {
        children = value
      } else {
        attrStr += ` ${key.toLowerCase()}`
        if (value) {
          attrStr += `="${value}"`
        }
      }
    })

    if (singletonTags.indexOf(tag) === -1) {
      lazyEmit(`<${tag}${attrStr}>${children}`)
    } else {
      lazyEmit(`<${tag}${attrStr} />`)
    }

    // if (children) {
    //   lazyEmit(`<${tag}${attrStr}>${children}${node.isSelfClosing ? `</${tag}>` : ''}`)
    // } else {
    //   lazyEmit(`<${tag}${attrStr}${node.isSelfClosing ? ' /' : ''}>`)
    // }

    // console.log(`${tag} is ${!node.isSelfClosing ? 'NOT ':''} slefClosing`)
    if (!node.isSelfClosing && singletonTags.indexOf(tag) === -1) {
      // unclosedTag.push(node.name)
    }
  }

  parser.onclosetag = function (tagName) {
    const tag = getTagName(tagName, tagPrefix)
    // console.log(`${tagName} close tag got`)
    if (singletonTags.indexOf(tag) === -1) {
      lazyEmit(`</${tag}>`)
    }

    // if (unclosedTag.length > 0) {
    // unclosedTag.pop()
    // console.log(unclosedTag)
    // }
  }

  // an attribute.  attr has "name" and "value"
  parser.onattribute = function (attr) {

  }

  // parser stream is done, and ready to have more stuff written to it.
  parser.onend = function () {
    while (unclosedTag.length > 0) {
      lazyEmit(`</${getTagName(unclosedTag.pop(), tagPrefix)}>`)
    }

    lazyEmit('', true)
    emitter.emit('end')
  }

  process.nextTick(function () {
    if (typeof template === 'string') {
      parser.write(template).close()
    } else {
      template.on('data', function (data) {
        parser.write(data)
      })
      template.on('end', function () {
        parser.close()
      })
    }
  })

  return emitter
}

module.exports = saxt
