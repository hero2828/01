const blocksImg = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAQCAIAAAD4YuoOAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGfSURBVDhPZZMxbsMwEAT5HX8hgDtXKQUYiIE07OVUafIAQ35BnpAfqPDvMvQIi4tCHA57K93ukZTax/Xae/95rmmawJbrupLvy52SnPJxe/+eX4mv8wuxKy/HQ3hzixzNBB7gyMnowShk2pCLEHhZFkvNAiCJzYBOcnajdJjq4WgEzcGKBistMwzSXHEYnchgnBhtnmebsxVKsOObZYYBPRHyZMRkloxLMipIoG4poxn2tWxIYEA/AAlCP4wtcx9uix51lVbIoPSpgGCIltHIYrXG/L3rHQYzD8fgeiMkHxD7FkUHjBbA2bWhlKyK2YdadWcyxPYfqKVN1MkGDMvbqv3JHouKPg05vqLdKWsT6Vi6G4XqiQcn6kGNI4quiiw/fJ0sUWcxim1VxbPCRgZASXhDm4FCisLk9Fl+TjAsgOraEHoA+DplKPUQjDuIojZiyDBgwjdrv4p6/A839OcOCEqxcgJIlphO1YnPt5OljKdEBgPkx39QFZXbqfvC02X7k9USpJTxBcEwoCfNOw9JmGwR0v4MCPYyU1Z8OR5+AaYiqFz1UTlXAAAAAElFTkSuQmCC`
const scene = new Scene()
const camera = new PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000)
camera.position.set(0, 5, 20).setLength(40)
const renderer = new WebGLRenderer()
renderer.setSize(innerWidth, innerHeight)
document.body.appendChild(renderer.domElement)
window.addEventListener('resize', (event) => {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
})

const controls = new OrbitControls(camera, renderer.domElement)
controls.target.set(8, 0, 8)
controls.update()

const light = new DirectionalLight(0xFFFFFF, 1)
light.position.setScalar(1)
scene.add(light, new AmbientLight(0xFFFFFF, 0.5))

const texAtlas = new TextureLoader().load(blocksImg)
const texStep = 1 / 2

const g = new BoxGeometry(1, 1, 1)
const m = new MeshLambertMaterial({
  onBeforeCompile: (shader) => {
    shader.uniforms.texAtlas = { value: texAtlas }
    shader.vertexShader = `
    	attribute float texIdx;
    	varying float vTexIdx;
      ${shader.vertexShader}
    `.replace(
      `void main() {`,
      `void main() {
      	vTexIdx = texIdx;
      `,
    )
    // console.log(shader.vertexShader);
    shader.fragmentShader = `
    	uniform sampler2D texAtlas;
    	varying float vTexIdx;
      ${shader.fragmentShader}
    `.replace(
      `#include <map_fragment>`,
      `#include <map_fragment>
      	
       	vec2 blockUv = ${texStep} * (floor(vTexIdx + 0.1) + vUv); 
        vec4 blockColor = texture(texAtlas, blockUv);
        diffuseColor *= blockColor;
      `,
    )
    console.log(shader.fragmentShader)
  },
})
m.defines = { USE_UV: '' }
const blocks = new InstancedMesh(g, m, 10240)

const perlin = new ImprovedNoise()
const vecUV = new Vector2()
const dummy = new Object3D()
const texIdx = new Float32Array(10240).fill(0)
let instIdx = 0
for (let x = 0; x < 16; x++) {
  for (let z = 0; z < 16; z++) {
    vecUV.set(x, z).divideScalar(16).multiplyScalar(2.5)
    const h = Math.floor(perlin.noise(vecUV.x, vecUV.y, 100) * 4) + 32
    for (let y = 0; y < h; y++) {
      dummy.position.set(x, y - 32, z)
      dummy.updateMatrix()
      blocks.setMatrixAt(instIdx, dummy.matrix)
      texIdx[instIdx] = y < (h - 1) ? 0 : 1
      instIdx++
    }
  }
}
g.setAttribute('texIdx', new InstancedBufferAttribute(texIdx, 1))

scene.add(blocks)

renderer.setAnimationLoop(() => {
  renderer.render(scene, camera)
})
