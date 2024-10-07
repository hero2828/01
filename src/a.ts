import grass from '@/assets/grass.jpg?url'
import sand from '@/assets/sand.jpg?url'

const stats = new Stats()
document.body.appendChild(stats.dom)
// 渲染器
const renderer = new WebGLRenderer({ antialias: true })
renderer.setSize(innerWidth, innerHeight)
renderer.setClearColor(0x000000)
document.body.appendChild(renderer.domElement)

// 场景
const scene = new Scene()

// 相机
const camera = new PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000,
)
camera.position.set(15, 22, 25)
// 灯光
const ambient = new AmbientLight(0xFFFFFF, 2) // 环境灯光
// 将光源加入场景
scene.add(ambient)
const uniforms = {
  u_time: { value: 0.0 },
  u_texture: { value: new TextureLoader().load(grass) },
  u_texture2: { value: new TextureLoader().load(sand) },
}
async function init() {
  const grassObj = await new TextureLoader().loadAsync(grass)
  const geo = new CylinderGeometry(1, 1, 3, 6, 1, false)
  const mat = new MeshBasicMaterial({

  })

  const count = 50

  const mesh = new InstancedMesh(geo, mat, count ** 2)

  const matrix = new Matrix4()
  const color = new Color().setHex(0xFFFFFF)
  let index = 0
  const simple = new SimplexNoise()

  for (let i = -count / 2; i < count / 2; i++) {
    for (let j = count / -2; j < count / 2; j++) {
      const position = tileToPosition(i, j)
      let noise = (simple.noise(i * 0.1, j * 0.1) + 1)
      noise = noise ** 2

      if (noise > 2) {
        color.setHex(0xFF5C00)
        noise = 2
      }
      else if (noise > 1) {
        color.setHex(0xFF0000)
        noise = 1
      }
      else if (noise > 0.7) {
        color.setHex(0xFFFF00)
        noise = 0.7
      }
      else if (noise > 0.3) {
        color.setHex(0x00FF00)
        noise = 0.3
      }
      else {
        color.setHex(0xFFFFFF)
        noise = 0
      }
      matrix.setPosition(position.x, noise, position.y)
      mesh.setMatrixAt(index, matrix)
      mesh.setColorAt(index, color)
      index++
    }
  }
  scene.add(mesh)
}
init()

// 控制器
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
const clock = new Clock()
function animate() {
  uniforms.u_time.value = clock.getElapsedTime()
  stats.update()
  camera.updateProjectionMatrix()
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}
animate()

function resize() {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
}
window.addEventListener('resize', resize)
function tileToPosition(tileX: number, tileY: number) {
  return new Vector2((tileX + (tileY % 2) * 0.5) * 1.77, tileY * 1.535)
}
