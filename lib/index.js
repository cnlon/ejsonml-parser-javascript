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
const childMap = {
  'text': true,
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
    let child = parseAttributes(jml[1])
    if (child) {
      jml[2] = [child]
    } else {
      jml[2] = jml[2]
               .filter(child => !commentRE.test(child))
               .map(child => translate(child))
    }
  }
  return jml
}

function parseAttributes (attributes) {
  let bindAttr, attr, child
  Object.keys(attributes).forEach(key => {
    if (key[0] === ':') {
      bindAttr = attributes[key]
      delete attributes[key]
      key = key.slice(1)
      attr = getTrimmedAttribute(attributes, key)
      if (attr) {
        bindAttr = `'${attr}'+(${bindAttr})`
      }
      bindAttr = gep.parse(bindAttr)
      bindAttr = gep.make(bindAttr, toRuntime)
      if (childMap[key]) {
        child = bindAttr
      } else {
        attributes[key] = bindAttr
      }
    }
  })
  return child
}

function getTrimmedAttribute (attributes, key) {
  if (!attributes.hasOwnProperty(key)) return
  let attr = attributes[key]
  attr = attr.trim()
  let bound = boundMap[key]
  if (bound && attr[attr.length - 1] !== bound) {
    attr += bound
  }
  return attr
}
