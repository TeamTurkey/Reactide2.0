import React from 'react';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';

let term = null;

//Declare terminal for use throughout the component lifecycle
class OutputConsole extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // apply 'fit' addon
    Terminal.applyAddon(fit);

    term = new Terminal({
      theme: { background: 'transparent' }
    });
    //Set up some terminal options
    term.setOption('allowTransparency', true);
    term.setOption('cursorStyle', 'block');
    term.setOption('cursorBlink', true);
    term.setOption('fontSize', 14);
    //Grab div from the DOM to render terminal
    term.open(document.getElementById('output'));
    // let greeting = '';
    term.fit();
  }
  componentWillReceiveProps(nextProps) {
    const {craOut} = nextProps;
    term.write(craOut);
  }
  componentWillUnmount() {
    term.destroy();
  }
  render() {
    const divStyle = {
      height: '200px'
    }
    return (
      <div id='output' style={divStyle} />
    )
  }
}
export default OutputConsole;