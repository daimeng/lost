import seedrandom from "seedrandom"
import { RPRE } from "./game"

const RSIZE = 5
export const EMPTYROOM = new Array(RSIZE).fill(null).map((_, i, arr) => {
    return new Array(RSIZE).fill(0)
})

export function randRoom(borders: number, x: number, y: number) {
    const rng = seedrandom(`${RPRE}-${x}-${y}`)
    const room = new Array(RSIZE).fill(null).map((_, i, arr) => {
        return new Array(RSIZE).fill(0).map(() => Math.max(Math.floor(rng() * 7), 0) + 1)
    })

    if (!(borders & 0b0001)) {
        for (let i = 0; i < RSIZE; i++) {
            room[0][i] = 51 + Math.floor(rng() * 4)
        }
    }

    if (!(borders & 0b0100)) {
        for (let i = 0; i < RSIZE; i++) {
            room[RSIZE - 1][i] = 51 + Math.floor(rng() * 4)
        }
    }

    if (!(borders & 0b0010)) {
        for (let i = 0; i < RSIZE; i++) {
            room[i][RSIZE - 1] = 51 + Math.floor(rng() * 4)
        }
    }

    if (!(borders & 0b1000)) {
        for (let i = 0; i < RSIZE; i++) {
            room[i][0] = 51 + Math.floor(rng() * 4)
        }
    }

    room[0][0] = 51 + Math.floor(rng() * 4)
    room[4][0] = 51 + Math.floor(rng() * 4)
    room[0][4] = 51 + Math.floor(rng() * 4)
    room[4][4] = 51 + Math.floor(rng() * 4)

    return room
}
