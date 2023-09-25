export function swap<T>(arr: Array<T>, a: number, b: number) {
  const tmp = arr[a]
  arr[a] = arr[b]
  arr[b] = tmp
}

export class PreArray<T> {
  array: Array<T>
  length: number
  maxsize: number

  constructor(maxsize = 1000) {
    this.array = new Array(maxsize)
    this.length = 0
    this.maxsize = maxsize
  }

  push(item) {
    if (this.length >= this.maxsize) return false

    this.array[this.length] = item
    this.length += 1
    return true
  }

  pop() {
    if (this.length == 0) return null

    this.length -= 1
    const item = this.array[this.length]
    this.array[this.length] = undefined

    return item
  }
}

export class PoolArray<T> {
  active: Array<T>
  inactive: PreArray<number>

  constructor(zerofn: (i: number) => T, maxsize = 1000) {
    this.active = new Array(maxsize)
    this.inactive = new PreArray(maxsize)

    for (let i = 0; i < maxsize; i++) {
      this.active[i] = zerofn(i)
      this.inactive.push(maxsize - i - 1)
    }
  }

  free(idx) {
    const item = this.active[idx]
    this.inactive.push(idx)
    return item
  }

  next() {
    const nextid = this.inactive.pop()
    return this.active[nextid]
  }
}
