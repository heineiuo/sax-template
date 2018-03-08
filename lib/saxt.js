const sax = require('sax')
const fs = require('fs')
const EventEmitter = require('events')
const get = require('lodash.get')

const saxt = (template, view, options) => {

  if (!view) {
    view = {}
  }

  if (!options) {
    options = {
      tagPrefix: 't-'
    }
  }

  const tagPrefix = (options.tagPrefix || 't-').toLowerCase()
  const emitter = new EventEmitter()
  const parser = sax.parser(false, options)

  const getTagName = (tag) => {
    let lowTag = tag.toLowerCase()
    return lowTag.indexOf(tagPrefix) === 0 ? lowTag.substr(tagPrefix.length) : lowTag
  }

  const unclosedTag = []

  parser.onerror = function (e) {
    emitter.emit('error', e)
  }
  parser.ontext = function (t) {
    emitter.emit('data', t)
  }

  // opened a tag.  node has "name" and "attributes"
  parser.onopentag = function (node) {

    const rawTag = node.name
    const attributes = node.attributes
    const tag = getTagName(node.name)

    let attrStr = ''
    let children = ''
    Object.keys(attributes).forEach(rawKey => {
      const key = rawKey.toLowerCase()
      let value = attributes[rawKey] || ''
      if (value.indexOf("{") === 0) {
        let closePos = value.indexOf('}')
        if (closePos > 0) {
          value = get(view, value.substr(1, closePos - 1)) || ''
        }
      }
      if (!typeof value === 'string') {
        value = JSON.stringify(value)
      }
      if (key === 'children') {
        children = value
      } else {
        attrStr += ` ${key.toLowerCase()}`
        if (value) {
          attrStr += `=${value}`
        }
      }
    })
    if (children) {
      emitter.emit('data', `<${tag}${attrStr}>${children}${node.isSelfClosing ? `</${tag}>` : ''}`)
    } else {
      emitter.emit('data', `<${tag}${attrStr}${node.isSelfClosing ? ' /' : ''}>`)
    }

    if (!node.isSelfClosing) {
      unclosedTag.push(node.name)
    }
  }

  parser.onclosetag = function (tagName) {
    emitter.emit('data', `</${getTagName(tagName)}>`)
    
    if (unclosedTag.length > 0) {
      unclosedTag.pop()
      // console.log(unclosedTag)
    }
  }

  // an attribute.  attr has "name" and "value"
  parser.onattribute = function (attr) {

  }

  // parser stream is done, and ready to have more stuff written to it.
  parser.onend = function () {
    while (unclosedTag.length > 0) {
      emitter.emit('data', `</${getTagName(unclosedTag.pop())}>`)
    }

    emitter.emit('end')
  }

  process.nextTick(() => {
    if (typeof template === 'string') {
      parser.write(template).close()
    } else {
      template.on('data', (data) => {
        parser.write(data)
      })
      template.on('end', () => {
        parser.close()
      })
    }
  })

  return emitter
}

module.exports = saxt
