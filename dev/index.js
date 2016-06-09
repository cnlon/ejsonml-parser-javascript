import parse from '../lib'

window.onload = function () {
  const template =
  `
  <div class="className" style="background-color: red;" :style="style">
    <strong :text="name+','"></strong>你好
    <!--comment!!-->
  </div>
  `
  const tplNode = document.getElementById('tpl')
  tplNode.innerText = template

  const ejml = parse(template)
  const resNode = document.getElementById('res')
  resNode.innerText = JSON.stringify(ejml, null, '  ')
}
