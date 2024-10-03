import { BufferGeometry, InstancedBufferAttribute, InstancedBufferGeometry, Line, Vector2, Vector3 } from 'three'

export class DepthData extends WebGLRenderTarget {
  constructor(size, camParams) {
    super(size, size)
    this.texture.minFilter = NearestFilter
    this.texture.magFilter = NearestFilter
    this.stencilBuffer = false
    this.depthTexture = new DepthTexture()
    this.depthTexture.format = DepthFormat
    this.depthTexture.type = UnsignedIntType

    const hw = camParams.width * 0.5
    const hh = camParams.height * 0.5
    const d = camParams.depth
    this.depthCam = new OrthographicCamera(-hw, hw, hh, -hh, 0, d)
    this.depthCam.layers.set(1)
    this.depthCam.position.set(0, d, 0)
    this.depthCam.lookAt(0, 0, 0)
  }

  update(renderer: any, scene: any) {
    renderer.setRenderTarget(this)
    renderer.render(scene, this.depthCam)
    renderer.setRenderTarget(null)
  }
}

export class Rain extends Line {
  constructor(size: Vector3, amount: number, gu: any) {
    const v = new Vector3()
    const gBase = new BufferGeometry().setFromPoints([new Vector2(0, 0), new Vector2(0, 1)])
    const g = new InstancedBufferGeometry().copy(gBase)
    g.setAttribute('instPos', new InstancedBufferAttribute(
      new Float32Array(
        Array.from({ length: amount }, () => {
          v.random().subScalar(0.5)
          v.y += 0.5
          v.multiply(size)
          return [...v]
        }).flat(),
      ),
      3,
    ))
    g.instanceCount = amount

    const m = new LineBasicMaterial({
      color: 0x4488FF,
      transparent: true,
      onBeforeCompile: (shader) => {
        shader.uniforms.depthData = gu.depthData
        shader.uniforms.time = gu.time
        shader.vertexShader = `
          uniform float time;
          
          attribute vec3 instPos;
          
          varying float colorTransition;
          varying vec3 vPos;
          ${shader.vertexShader}
        `.replace(
    `#include <begin_vertex>`,
    `#include <begin_vertex>
          
          float t = time;
          vec3 iPos = instPos;
          iPos.y = mod(20. - instPos.y - t * 5., 20.);
          
          transformed.y *= 0.5;
          transformed += iPos;
          
          vPos = transformed;
          
          colorTransition = position.y;
          `,
  )
        // console.log(shader.vertexShader);

        shader.fragmentShader = `
          uniform sampler2D depthData;
          varying float colorTransition;
          varying vec3 vPos;
          ${shader.fragmentShader}
        `.replace(
    `vec4 diffuseColor = vec4( diffuse, opacity );`,
    `
          vec2 depthUV = (vPos.xz + 10.) / 20.;
          depthUV.y = 1. - depthUV.y;
          
          float depthVal = 1. - texture(depthData, depthUV).r;
          float actualDepth = depthVal * 20.;
          
          if(vPos.y < actualDepth) discard;
          
          float trns = 1. - colorTransition;
          
          float distVal = smoothstep(3., 0., vPos.y - actualDepth);
          vec3 col = mix(diffuse, vec3(0.9), distVal); // the closer, the whiter
          vec4 diffuseColor = vec4( mix(col, col + 0.1, pow(trns, 16.)), (opacity * (0.25 + 0.75 * distVal)) * trns );
          `,
  )
        // console.log(shader.fragmentShader);
      },
    })
    super(g, m)
    this.frustumCulled = false
  }
}
