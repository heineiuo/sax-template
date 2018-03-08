const sax = require('sax')
const fs = require('fs')
const EventEmitter = require('events')


const renderCloseTag = (tag) => {

  return `</${tag.toLowerCase()}>`
}

const renderOpenTag = (tag, attributes) => {
  let attrKyes = Object.keys(attributes)
  if (attrKyes.length === 0) return `<${tag.toLowerCase()}>`
  const attrs = Object.keys(attributes).map(key => {
    return `${key.toLowerCase()}="${attributes[key]}"`
  })
  return `<${tag.toLowerCase()} ${attrs.join(' ')}>`
}

const renderSelfClosingTag = (tagName, attributes) => {
  let result = renderOpenTag(tag, attributes)
  return result.substr(0, result.length - 1) + '/>'
}


const saxt = (template, view, options) => {

  const emitter = new EventEmitter()
  const parser = sax.parser(false, options);

  let unclosedTag = []


  parser.onerror = function (e) {
    // an error happened.
    // console.log(e)
  };
  parser.ontext = function (t) {
    // got some text.  t is the string of text.
    // console.log('text>>>>>>\n', t)
    emitter.emit('data', t)
  };
  parser.onopentag = function (node) {
    // opened a tag.  node has "name" and "attributes"
    // console.log('opentag>>>>>>\n', node)

    // if (unclosedTag.length > 0) {
    //   if (unclosedTag[unclosedTag.length - 1] === node.name) {
    //     emitter.emit('data', renderCloseTag(unclosedTag.pop()))
    //   }
    // }

    if (!node.isSlefClosing) {
      emitter.emit('data', renderOpenTag(node.name, node.attributes))
      unclosedTag.push(node.name)
    } else {
      emitter.emit('data', renderSelfClosingTag(node.name))
    }
  }

  parser.onclosetag = function (tagName) {
    // console.log('closetag>>>>>>\n', tagName)

    if (unclosedTag.length > 0) {
      if (unclosedTag[unclosedTag.length - 1] === tagName) {
        emitter.emit('data', renderCloseTag(unclosedTag.pop()))
      }
    }
  }

  parser.onattribute = function (attr) {
    // an attribute.  attr has "name" and "value"
    // console.log('attr>>>>>>>\n', attr)
  };
  parser.onend = function () {
    // parser stream is done, and ready to have more stuff written to it.
    // console.log(`unclosedTag>>>>>>>>\n`, unclosedTag)
    while (unclosedTag.length > 0) {
      // console.log('closeTag')
      emitter.emit('data', renderCloseTag(unclosedTag.pop()))
    }

    emitter.emit('end')

  }

  process.nextTick(() => {
    if (typeof template ==='string'){
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
