import seedrandom from "seedrandom"
import { RPRE } from "./game"
import { swap } from "./utils/array"

const DX = [
  0,
  1,
  0,
  -1,
]

const DY = [
  1,
  0,
  -1,
  0,
]

const OPPO = [
  2,
  3,
  0,
  1,
]

export type Point = [number, number]

const path = new Map<number, number>()

export function genmaze(h: number, w: number): Array<[number, number]> {
  const rng = seedrandom(RPRE + '-genmaze')
  const maze = []
  const open = new Array(h * w).fill(0).map((_, i) => i)
  let olen = open.length

  // swap and pop random
  const idx = Math.floor(rng() * olen)
  swap(open, idx, olen - 1)
  const start = open[olen - 1]
  olen -= 1

  const visited = new Array(h * w).fill(false)
  visited[start] = true

  while (olen > 0) {
    // swap and pop random
    const idx = Math.floor(rng() * olen)
    swap(open, idx, olen - 1)
    let curr = open[olen - 1]
    olen -= 1

    // reset path tacker
    path.clear()

    while (!visited[curr]) {
      const [x, y] = coords12(curr, w)

      // find first valid neighbor
      const tried = [false, false, false, false]
      while (!tried.every(Boolean)) {
        const dir = Math.floor(rng() * 4)

        // pick again if already tried
        if (tried[dir]) continue
        tried[dir] = true

        const nx = x + DX[dir]
        const ny = y + DY[dir]

        if (
          nx < 0 || nx >= w
          || ny < 0 || ny >= h
        ) {
          continue
        }
        const nextid = coords21(nx, ny, w)

        // add curr to next step to path
        path.set(curr, nextid)
        curr = nextid
        break
      }
    }

    // record path to maze
    for (let [k, v] of path) {
      const openid = open.findIndex(x => x === k)
      if (openid !== -1 && openid < olen) {
        swap(open, openid, olen - 1)
        olen -= 1
      }
      visited[k] = true

      maze.push([k, v])
      maze.push([v, k])
    }
  }

  return maze
}

export function coords12(i: number, w: number): Point {
  const x = i % w
  const y = (i - x) / w

  return [x, y]
}

export function coords21(x: number, y: number, w: number): number {
  return y * w + x
}
