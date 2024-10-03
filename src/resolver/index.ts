import * as THREE from 'three'
import * as addons from 'three/addons'
import type { Resolver } from 'unplugin-auto-import/types'

export function useThree(): Resolver {
  const keys1 = Object.keys(THREE)
  const keys2 = Object.keys(addons)
  const hook: Resolver = (name: string) => {
    if (keys1.includes(name)) {
      return {
        name,
        from: 'three',
      }
    }
    if (keys2.includes(name)) {
      return {
        name,
        from: 'three/addons',
      }
    }
    if (['GUI'].includes(name)) {
      return {
        name,
        from: 'three/examples/jsm/libs/lil-gui.module.min',
      }
    }
    if (['Stats'].includes(name)) {
      return {
        name: 'default',
        from: 'three/addons/libs/stats.module',
        as: name,
      }
    }
    if (['TWEEN'].includes(name)) {
      return {
        name: 'default',
        from: 'three/examples/jsm/libs/tween.module',
        as: name,
      }
    }
  }
  return (name: string) => hook(name)
}
