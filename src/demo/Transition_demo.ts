import { FxScene, Transition } from '../cls/Transition'

const stats = new Stats()
document.body.appendChild(stats.dom)
// 渲染器
const renderer = new WebGLRenderer({ antialias: true })
renderer.setSize(innerWidth, innerHeight)
renderer.setClearColor(0x000000)
document.body.appendChild(renderer.domElement)

const uniforms = {
  progress: {
    value: 0.0,
  },
}
const gui = new GUI()
gui.add(uniforms.progress, 'value', 0, 1).name('进度条')

const scene01 = new FxScene({ renderer })
const ambient01 = new AmbientLight(0xFFFFFF, 10)
scene01.scene.add(ambient01)
const box = new Mesh(
  new BoxGeometry(),
  new MeshBasicMaterial({ color: 0xFF5C00 }),
)
scene01.scene.add(box)
const scene02 = new FxScene({ renderer })
const ambient02 = new AmbientLight(0x00FF00, 10)
scene02.scene.add(ambient02)
const sp = new Mesh(
  new IcosahedronGeometry(),
  new MeshBasicMaterial({ color: 0x00FF00 }),
)
scene02.scene.add(sp)
const transition = new Transition({
  renderer,
  sceneList: [scene01, scene02],
})

function animate() {
  transition.render(uniforms)
  requestAnimationFrame(animate)
}
animate()

function resize() {
  transition.resize()
}
window.addEventListener('resize', resize)
