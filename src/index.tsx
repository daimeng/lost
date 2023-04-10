import { Component, render, version } from 'inferno';
import { game } from './game';
import { coords12, coords21, genmaze } from './gen';
import MainScene from './main-scene';
import './main.css';

const container = document.getElementById('app');

const w = 8
const h = 8

class MyComponent extends Component<any, any> {

  maze: Array<[number, number]>
  grid: Array<Array<number>>

  constructor(props, context) {
    super(props, context);

    this.maze = genmaze(h, w)
    this.grid = new Array(h).fill(null).map((_, i) => {
      return new Array(w).fill(0).map((_, j) => {
        let border = 0
        const coord = coords21(j, i, w)
        if (this.maze.findIndex(([a, b]) => a === coord && b === coords21(j, i - 1, w)) !== -1) {
          border |= 1
        }
        if (this.maze.findIndex(([a, b]) => a === coord && b === coords21(j + 1, i, w)) !== -1) {
          border |= 2
        }
        if (this.maze.findIndex(([a, b]) => a === coord && b === coords21(j, i + 1, w)) !== -1) {
          border |= 4
        }
        if (this.maze.findIndex(([a, b]) => a === coord && b === coords21(j - 1, i, w)) !== -1) {
          border |= 8
        }

        return border
      })
    })
  }

  public render() {
    return (
      <div className="grid">
        {this.grid.map((row, i) =>
          <div className="grid-row">
            {row.map((borders, j) => {
              return <div className={`grid-cell borders-${borders}`}>
                {borders}
              </div>
            })}
          </div>
        )}
      </div>
    )
  }
}

render(<MyComponent />, container)

game
