import { Component, render, version } from 'inferno';
import { game } from './game';
import MainScene from './main-scene';
import './main.css';

// const container = document.getElementById('app');

class MyComponent extends Component<any, any> {

  constructor(props, context) {
    super(props, context);
  }

  public render() {
    return (
      <></>
    )
  }
}

game
