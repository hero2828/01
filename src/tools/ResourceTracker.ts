import type { Mesh } from 'three'
import { Material, Object3D, Texture } from 'three'

export class ResourceTracker {
  resources: Set<unknown>

  constructor() {
    this.resources = new Set()
  }

  track<T extends Mesh>(resource: T) {
    if (!resource) {
      return resource
    }

    if (Array.isArray(resource)) {
      resource.forEach(ele => this.track(ele))
      return resource
    }
    if (resource.dispose || resource instanceof Object3D) {
      this.resources.add(resource)
    }

    if (resource instanceof Object3D) {
      this.track(resource.geometry)
      this.track(resource.material)
      this.track(resource.children)
    }
    else if (resource instanceof Material) {
      for (const value of Object.values(resource)) {
        if (value instanceof Texture) {
          this.track(value)
        }
      }
      if (resource.uniforms) {
        for (const value of Object.values(resource.uniforms)) {
          if (value) {
            const uniformVlaue = value.value
            if (uniformVlaue instanceof Texture || Array.isArray(uniformVlaue)) {
              this.track(uniformVlaue)
            }
          }
        }
      }
    }
    return resource
  }

  untrack<T>(resource: T) {
    this.resources.delete(resource)
  }

  dispose() {
    for (const resource of this.resources) {
      if (resource instanceof Object3D) {
        if (resource.parent) {
          resource.parent.remove(resource)
        }
      }
      if (resource.dispose) {
        resource.dispose()
      }
    }
  }
}
