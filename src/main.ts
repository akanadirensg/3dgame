import './style.css'
import { initScene } from './scene'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="three-container"></div>
`

const container = document.getElementById('three-container')!
initScene(container)
