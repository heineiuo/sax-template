const sax = require('sax')
const fs = require('fs')

const template = fs.readFileSync('./template.html', 'utf8')


const parser = sax.parser(false);

let result = ''

let unclosedTag = []

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

parser.onerror = function (e) {
  // an error happened.
  // console.log(e)
};
parser.ontext = function (t) {
  // got some text.  t is the string of text.
  // console.log('text>>>>>>\n', t)
  result += t
};
parser.onopentag = function (node) {
  // opened a tag.  node has "name" and "attributes"
  // console.log('opentag>>>>>>\n', node)

  // if (unclosedTag.length > 0) {
  //   if (unclosedTag[unclosedTag.length - 1] === node.name) {
  //     result += renderCloseTag(unclosedTag.pop())
  //   }
  // }

  if (!node.isSlefClosing) {
    result += renderOpenTag(node.name, node.attributes)
    unclosedTag.push(node.name)
  } else {
    result += renderSelfClosingTag(node.name)
  }
}

parser.onclosetag = function(tagName) {
  // console.log('closetag>>>>>>\n', tagName)
  
  if (unclosedTag.length > 0) {
    if (unclosedTag[unclosedTag.length - 1] === tagName) {
      result += renderCloseTag(unclosedTag.pop())
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
    console.log('closeTag')
    result += renderCloseTag(unclosedTag.pop())
  }
console.timeEnd('sax template')
  
  console.log(result)
};

console.time('sax template')
parser.write(template).close();
