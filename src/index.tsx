import { Component, render } from 'inferno';
import { game } from './game';

import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'
import acorn from './acorn'
import './interpreter'
import './grid.css'
import './main.css'

window['acorn'] = acorn

const container = document.getElementById('app');

const toolbox = {
  "kind": "flyoutToolbox",
  "contents": [
    {
      "kind": "block",
      "type": "controls_if"
    },
    {
      "kind": "block",
      "type": "controls_repeat_ext"
    },
    {
      "kind": "block",
      "type": "logic_compare"
    },
    {
      "kind": "block",
      "type": "math_number"
    },
    {
      "kind": "block",
      "type": "math_arithmetic"
    },
    {
      "kind": "block",
      "type": "text"
    },
    {
      "kind": "block",
      "type": "text_print"
    },
  ]
}

const blocklyArea = document.getElementById('blocklyArea')
const blocklyDiv = document.getElementById('blocklyDiv')
const workspace = Blockly.inject(
  blocklyDiv,
  { toolbox }
)
const onresize = function () {
  // Compute the absolute coordinates and dimensions of blocklyArea.
  let element: HTMLElement = blocklyArea;
  let x = 0
  let y = 0
  do {
    x += element.offsetLeft
    y += element.offsetTop
    element = element.offsetParent as HTMLElement
  } while (element)
  // Position blocklyDiv over blocklyArea.
  blocklyDiv.style.left = x + 'px'
  blocklyDiv.style.top = y + 'px'
  blocklyDiv.style.width = blocklyArea.offsetWidth + 'px'
  blocklyDiv.style.height = blocklyArea.offsetHeight + 'px'
  Blockly.svgResize(workspace)
};
window.addEventListener('resize', onresize, false)
onresize()

type Props = {
  grid: Array<Array<number>>
  pconf: {
    x: number,
    y: number,
    gx: number,
    gy: number,
  }
}

type State = { hidden: boolean }

const initFunc = function (interpreter, globalObject) {
  interpreter.setProperty(globalObject, 'url', String(location))

  var wrapper = function alert(text) {
    return window.alert(text);
  }
  interpreter.setProperty(globalObject, 'alert',
    interpreter.createNativeFunction(wrapper))
}

class MyComponent extends Component<Props, State> {
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

  parse = () => {
    const code = javascriptGenerator.workspaceToCode(workspace)
    var interp = new Interpreter(code, initFunc)
    console.log(code)
    interp.run()
  }

  public render() {
    const { grid, pconf } = this.props
    const { hidden } = this.state

    if (grid == null) return null
    return (
      <div id="controls">
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
        <button onClick={this.parse}>PARSE</button>
      </div>
    )
  }
}

render(<MyComponent grid={null} pconf={null} />, container)

game.events.on('genmaze', function (grid, pconf) {
  render(<MyComponent grid={grid} pconf={pconf} />, container)
})

game

// game.events.on('genmaze', function (grid, pconf) {
//   render(<MyComponent grid={grid} pconf={pconf} />, container)
// })
