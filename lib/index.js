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

let parseAttributes

function jsParse (template, toRuntime) {
  let jml = parse(template)
  parseAttributes = toRuntime
                  ? parseAttributesWithRuntime
                  : parseAttributesWithoutRuntime
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

function parseAttributesWithoutRuntime (attributes) {
  let val
  Object.keys(attributes).forEach(key => {
    if (key[0] === ':') {
      val = attributes[key]
      val = gep.parse(val)
      val = gep.make(val, true)
      attributes[key] = val
    }
  })
}

function parseAttributesWithRuntime (attributes) {
  let val
  Object.keys(attributes).forEach(key => {
    if (key[0] === ':') {
      val = attributes[key]
      delete attributes[key]
      key = key.slice(1)
      if (attributes.hasOwnProperty(key)) {
        val = '\'' + attributes[key] + '\'+(' + val + ')'
      }
      val = gep.parse(val, true)
      attributes[key] = val
    }
  })
}
