import type { WebGLRenderer } from 'three'
import { AmbientLight, Mesh, OrthographicCamera, PerspectiveCamera, PlaneGeometry, Scene, ShaderMaterial, WebGLRenderTarget } from 'three'
import { OrbitControls } from 'three/addons'

export class FxScene {
  renderer: WebGLRenderer
  fbo: WebGLRenderTarget
  camera: PerspectiveCamera
  scene: Scene
  clearColor: number = 0x000000
  controls: OrbitControls
  constructor({ renderer }: { renderer: WebGLRenderer }) {
    this.renderer = renderer
    this.fbo = new WebGLRenderTarget(innerWidth, innerHeight)
    this.camera = new PerspectiveCamera(50, innerWidth / innerHeight, 1, 1000)
    this.camera.position.z = 10
    this.scene = new Scene()
    // 控制器
    this.controls = new OrbitControls(this.camera, renderer.domElement)
    this.controls.enableDamping = true
  }

  resize() {
    this.camera.aspect = innerWidth / innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(innerWidth, innerHeight)
  }

  render(rtt: boolean) {
    this.renderer.setClearColor(this.clearColor)
    if (rtt) {
      this.renderer.setRenderTarget(this.fbo)
      this.renderer.clear()
    }
    else {
      this.renderer.setRenderTarget(null)
    }
    this.renderer.render(this.scene, this.camera)
  }
}

export class Transition {
  scene: Scene
  camera: OrthographicCamera
  ambient: AmbientLight
  geometry: PlaneGeometry
  material: ShaderMaterial
  mesh: Mesh
  renderer: WebGLRenderer
  sceneList: FxScene[]
  index: number
  constructor({ renderer, sceneList }: { renderer: WebGLRenderer, sceneList: FxScene[] }) {
    this.index = 0
    this.renderer = renderer
    this.sceneList = sceneList
    this.scene = new Scene()
    this.camera = new OrthographicCamera(innerWidth / -2, innerWidth / 2, innerHeight / 2, innerHeight / -2, -10, 10)
    this.camera.position.set(0, 0, 2)
    this.ambient = new AmbientLight(0xFFFFFF, 2)
    this.scene.add(this.ambient)
    this.geometry = new PlaneGeometry(innerWidth, innerHeight)
    this.material = new ShaderMaterial({
      uniforms: {
        tDiffuse1: {
          value: sceneList[0].fbo.texture,
        },
        tDiffuse2: {
          value: sceneList[1].fbo.texture,
        },
        progress: {
          value: 0,
        },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = vec2( uv.x, uv.y );
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        uniform float progress;
        uniform sampler2D tDiffuse1;
        uniform sampler2D tDiffuse2;
        varying vec2 vUv;

        void main() {
          vec2 uv=vUv*10.0;
          vec3 color=vec3(0.0);
          vec3 color1 = texture2D( tDiffuse1, vUv ).xyz;
          vec3 color2 = texture2D( tDiffuse2, vUv ).xyz;
          color=mix(color1.xyz,color2.xyz,progress);
          gl_FragColor = vec4(color.xyz,1.0);
        }
      `,
    })
    this.mesh = new Mesh(this.geometry, this.material)
    this.scene.add(this.mesh)
  }

  resize() {
    this.sceneList.forEach((scene) => {
      scene.resize()
    })
    this.camera.left = innerWidth / -2
    this.camera.right = innerWidth / 2
    this.camera.top = innerHeight / 2
    this.camera.bottom = innerHeight / -2
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(innerWidth, innerHeight)
  }

  render(uniforms: any) {
    this.material.uniforms.progress.value = uniforms.progress.value
    const index = this.index
    const next = index + 1
    if (uniforms.progress.value <= 0) {
      this.sceneList[index].render(false)
    }
    else if (uniforms.progress.value >= 1) {
      this.sceneList[next].render(false)
    }
    else {
      this.sceneList[index].render(true)
      this.sceneList[next].render(true)
      this.renderer.setRenderTarget(null)
      this.renderer.render(this.scene, this.camera)
    }
  }
}
