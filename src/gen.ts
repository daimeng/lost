const DIRS = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
]

export type Point = [number, number]

const path = new Map()

function swap<T>(arr: Array<T>, a: number, b: number) {
  const tmp = arr[a]
  arr[a] = arr[b]
  arr[b] = tmp
}

export function genmaze(h: number, w: number): Array<[number, number]> {
  // const grid = new Array(h).fill(null).map(() => {
  //   return new Array(w).fill(0)
  // })
  const maze = []

  const open = new Array(h * w).fill(0).map((_, i) => i)

  while (open.length) {
    // pop random
    const idx = Math.floor(Math.random() * open.length)
    // swap and pop
    swap(open, idx, open.length - 1)
    let curr = open.pop()

    // reset path tacker
    path.clear()

    outer: while (curr != null) {
      const [x, y] = coords12(curr, w)
      let nextpoint: Point
      let success = false

      const tried = [false, false, false, false]
      while (!tried.every(Boolean)) {
        const dir = Math.floor(Math.random() * 4)
        if (tried[dir]) continue
        tried[dir] = true

        const [dx, dy] = DIRS[dir]
        nextpoint = [x + dx, y + dy]

        if (nextpoint[0] < 0 || nextpoint[0] >= w || nextpoint[1] < 0 || nextpoint[1] >= h) {
          continue
        }
        const nextid = coords21(...nextpoint, w)
        // add curr to next step to path
        path.set(curr, nextid)

        const nextloc = open.findIndex(x => x === nextid)
        // if next already part of maze
        if (nextloc === -1) {
          if (path.has(nextid)) {
            // if part of current path, rewind
            path.delete(curr)
            continue
          } else {
            // if not part of current path, save
            break outer
          }
        }

        // else continue to next, add to maze
        swap(open, nextloc, open.length - 1)
        curr = open.pop()
        success = true
        break
      }

      if (success) continue

      if (nextpoint[0] < 0 || nextpoint[0] >= w || nextpoint[1] < 0 || nextpoint[1] >= h) {
        break
      }
      if (tried.every(Boolean)) {
        break
      }
    }

    // record path to maze
    for (let [k, v] of path) {
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
