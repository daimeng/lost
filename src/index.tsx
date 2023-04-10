import { Component, render } from 'inferno';
import { game } from './game';
import './main.css';

const container = document.getElementById('app');

type Props = {
  grid: Array<Array<number>>
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
    const { grid } = this.props
    const { hidden } = this.state

    if (grid == null) return null

    return (
      <div className={`grid ${hidden ? 'hidden' : ''}`}>
        {grid.map((row, i) =>
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

render(<MyComponent grid={null} />, container)

game.events.on('genmaze', function (grid) {
  render(<MyComponent grid={grid} />, container)
})
