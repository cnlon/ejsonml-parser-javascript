import Parser from '../../ejsonml-parser/lib/index.js'
import JmlParser from '../lib'

const parser = new Parser()
window.onload = function () {
  const jmlParser = new JmlParser({
    callback (jml) {
      const resNode = document.getElementById('jml')
      resNode.innerText = JSON.stringify(jml, null, 2)
    },
  })
  parser.install(jmlParser)

  const template =
  `
  <div *if="a" *for="a in c" class="className" style="background-color: red;" :style="style">
    <strong :text="name+',' + a">a</strong>你好
    <i></i>
    <!--comment!!-->
  </div>
  `
  const tplNode = document.getElementById('tpl')
  tplNode.innerText = template

  const ejml = parser.parse(template)
  const ejmlNode = document.getElementById('ejml')
  ejmlNode.innerText = JSON.stringify(ejml, null, 2)
}
