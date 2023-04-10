import { Component, render } from 'inferno';
import { game } from './game';
import './main.css';

const container = document.getElementById('app');

type Props = {
  grid: Array<Array<number>>
  pconf: {
    x: number,
    y: number,
    gx: number,
    gy: number,
  }
}

class MyComponent extends Component<Props, { hidden: boolean }> {
  constructor() {
    super()

    this.state = {
      hidden: true
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.toggleMap)
  }

  componentDidUnmount() {
    document.removeEventListener('keydown', this.toggleMap)
  }

  toggleMap = (ev: KeyboardEvent) => {
    if (ev.shiftKey && ev.key === 'Z') {
      this.setState(s => ({ hidden: !s.hidden }))
    }
  }

  public render() {
    const { grid, pconf } = this.props
    const { hidden } = this.state

    if (grid == null) return null
    return (
      <div className={`grid ${hidden ? 'hidden' : ''}`}>
        {grid.map((row, i) =>
          <div className="grid-row">
            {row.map((borders, j) => {
              return <div className={`grid-cell borders-${borders} ${j === pconf.x && i === pconf.y ? 'grid-curr' : ''} ${j === pconf.gx && i === pconf.gy ? 'grid-goal' : ''}`}>
                {borders}
              </div>
            })}
          </div>
        )}
      </div>
    )
  }
}

render(<MyComponent grid={null} pconf={null} />, container)

game.events.on('genmaze', function (grid, pconf) {
  render(<MyComponent grid={grid} pconf={pconf} />, container)
})
