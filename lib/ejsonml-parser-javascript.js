/**
 * ejsonml-parser-javascript --- By longhao <longhaohe@gmail.com> (http://longhaohe.com/)
 * Github: https://github.com/longhaohe/ejsonml-parser-javascript
 * MIT Licensed.
 */

const Gep = require('gep')

const defaultSubScopes = '$event,$index'

const gep = new Gep({
  scope: '$',
  scopes: {
    '_': defaultSubScopes,
  },
  params: ['$', '_'],
})
const boundMap = {
  'class': ' ',
  'style': ';',
}
function noop () {}

module.exports = class JmlParser {
  constructor ({
      callback = noop,
  } = {}) {
    this.callback = callback
  }
  parse (ejml) {
    this.coverSubScope()
    this.callback(this.translate(ejml))
  }
  translate (ejml) {
    if (Array.isArray(ejml)) {
      return `['${ejml[0]}',${this.parseAttributes(ejml[1])},${this.walk(ejml[2])}]`
    }
    return `'${ejml.trim()}'`
  }
  walk (children) {
    if (!children.length) {
      return 'null'
    }
    return `[${children
      .map(child => this.translate(child))
      .join(',')}]`
  }
  parseAttributes (attributes) {
    let keys = Object.keys(attributes)
    if (!keys.length) {
      return 'null'
    }
    let bindedAttrs = {}
    let attrs = {}
    let bindAttr, attr
    keys.forEach(key => {
      if (key[0] === ':') { // attribute
        bindAttr = attributes[key]
        key = key.slice(1)
        attr = this.getTrimmedAttribute(attributes, key)
        if (attr) {
          bindAttr = `'${attr}'+(${bindAttr})`
        }
        bindedAttrs[key] = `${key}:${this.parseExpression(bindAttr)}`
      } else if (key[0] === '@' || key === '*if') { // event or directive if
        bindedAttrs[key] = `'${key}':${this.parseExpression(attributes[key])}`
      } else if (key === '*for') { // directive for
        bindAttr = attributes[key]
        bindAttr = bindAttr.split(' ')
        attr = bindAttr[0]
        bindAttr = bindAttr[2]
        bindedAttrs[key] = `'${key}':${this.parseExpression(bindAttr)}`
        bindedAttrs['_forKey'] = `_forKey:${attr}`
        this.coverSubScope(attr)
      } else {
        attrs[key] = `${key}:'${attributes[key]}'`
      }
    })
    Object.assign(attrs, bindedAttrs)
    return `{${Object.keys(attrs)
      .map(key => attrs[key])
      .join(',')}}`
  }
  getTrimmedAttribute (attributes, key) {
    if (!attributes.hasOwnProperty(key)) {
      return
    }
    let attr = attributes[key]
    attr = attr.trim()
    let bound = boundMap[key]
    if (bound && attr[attr.length - 1] !== bound) {
      attr += bound
    }
    return attr
  }
  coverSubScope (scope) {
    scope = scope
          ? defaultSubScopes + ',' + scope
          : defaultSubScopes
    gep._scopeREs['_'] = this.parseKeywordsToRE(scope)
  }
  parseKeywordsToRE (keywords) {
    return new RegExp(
      `^(?:${keywords.replace(/\$/g, '\\$').replace(/,/g, '\\b|')}\\b)`
    )
  }
  parseExpression (expression) {
    return gep.make(gep.parse(expression), true)
  }
}
