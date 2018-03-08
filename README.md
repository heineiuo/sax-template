# saxt

SAX T(emplate)

A server-side template engine based on sax-js

## Install

```bash
npm i saxt
```


## Usage

saxt use `<t-tag attr="{attrValue}" />` syntax. 

The `tag` can be any html tag like `html`, `meta`, `div` etc. 
The `attr` can be static value or wrapped with `{}`, then it will bind view props

If attr is `children`, the attrValue will be passed to the children element.

The `saxt()` will return a readable stream, like: 

```jsx
const saxt = require('saxt')
const view = { foo: "bar" }
const stream = saxt(`<t-div children={foo}></t-div>`, view, { /* some options */ })

let result = ''
stream.on('data', (data) => {
  result += data
  // or do stuff like `res.write(data)`
})

stream.on('end', () => {
  assert(result === `<div>bar</div>`)
  // or do stuff like `res.end()`
})
```


## Example

```jsx
const saxt = require('saxt')
const view = {
  post: `<div>
          <p>hello world</p>
        </div>`,

  charset: 'utf8'
}

// 1. children example
saxt(`
  <t-div id="post" children={post} />
`, view)

// result >>>
<div id="post">
<div>
  <p>hello world</p>
</div>
</div>



// 2. attr example
saxt(`
  <t-meta charset={charset} />
`, view)

// result >>>>
<meta charset="utf8"></meta>

```

## License 

MIT License