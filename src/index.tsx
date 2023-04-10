import { Component, render } from 'inferno';
import { game } from './game';
import './main.css';

const container = document.getElementById('app');

type Props = {
  grid: Array<Array<number>>
}

class MyComponent extends Component<Props, any> {
  public render() {
    const { grid } = this.props

    if (grid == null) return null

    return (
      <div className="grid">
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
