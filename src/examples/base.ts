import { DirectionalLight, DoubleSide, type WebGLRenderer } from 'three'
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise'
import { FxScene } from '../cls/Transition'

const perm = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180]

export function perlin(x: number) {
  const x1 = Math.floor(x)
  const x2 = x1 + 1
  const grad1 = perm[x1 % 255] * 2.0 - 255.0
  const grad2 = perm[x2 % 255] * 2.0 - 255.0
  const v1 = x - x1
  const v2 = x - x2
  const t = 3 * v1 ** 2 - 2 * v1 ** 3
  const p1 = grad1 * v1
  const p2 = grad2 * v2
  return p1 + t * (p2 - p1)
}

export function useBase(renderer: WebGLRenderer) {
  const canvas = document.createElement('CANVAS') as HTMLCanvasElement
  canvas.width = 128
  canvas.height = 128

  const context = canvas.getContext('2d') as CanvasRenderingContext2D
  context.fillStyle = 'royalblue'
  context.fillRect(0, 0, 128, 128)
  context.fillStyle = 'white'
  context.fillRect(6, 6, 128 - 6, 128 - 6)

  const isoTexture = new CanvasTexture(canvas)
  isoTexture.repeat.set(20, 40)
  isoTexture.wrapS = RepeatWrapping
  isoTexture.wrapT = RepeatWrapping

  const fxScene = new FxScene({ renderer })
  fxScene.scene.background = new Color(0x444444)
  const light = new DirectionalLight(0xFF5C00, Math.PI)
  light.position.set(1, 3, 5)
  fxScene.scene.add(light)
  const mesh = new Mesh(
    new PlaneGeometry(3, 6, 50, 100),
    new MeshLambertMaterial({
      map: isoTexture,
    }),
  )
  const pos = mesh.geometry.attributes.position.array
  for (let i = 0; i < pos.length; i += 3) {
    const z = perlin(i + 0.232423217884)
    pos[i + 2] = z * 0.001
  }
  mesh.geometry.computeVertexNormals()
  mesh.geometry.attributes.position.needsUpdate = true
  fxScene.scene.add(mesh)
  return fxScene
}
