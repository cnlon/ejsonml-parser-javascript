/**
 * ${name} --- By longhao <longhaohe@gmail.com> (http://longhaohe.com/)
 * Github: https://github.com/longhaohe/${name}
 * MIT Licensed.
 */

const parse = require('ejsonml-parser')
const Gep = require('gep')

module.exports = jsParse

const gep = new Gep()
const commentRE = /^<!--.*-->$/
const boundMap = {
  'class': ' ',
  'style': ';',
}

let toRuntime

function jsParse (template, debug) {
  let jml = parse(template)
  toRuntime = !debug
  return translate(jml)
}

function translate (jml) {
  if (!jml) {
    return ''
  } else if (Array.isArray(jml)) {
    parseAttributes(jml[1])
    jml[2] = jml[2]
            .filter(child => !commentRE.test(child))
            .map(child => translate(child))
  }
  return jml
}

function parseAttributes (attributes) {
  let val
  Object.keys(attributes).forEach(key => {
    if (key[0] === ':') {
      val = attributes[key]
      delete attributes[key]
      key = key.slice(1)
      if (attributes.hasOwnProperty(key)) {
        val = `'${attributes[key] + (boundMap[key] || '')}'+(${val})`
      }
      val = gep.parse(val)
      val = gep.make(val, toRuntime)
      attributes[key] = val
    }
  })
}
