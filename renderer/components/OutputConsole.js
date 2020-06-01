import React from "react";
import { Terminal } from "xterm";
import * as fit from "xterm/lib/addons/fit/fit";
const { ipcRenderer } = require("electron");

let term = null;

//Declare terminal for use throughout the component lifecycle
class OutputConsole extends React.Component {
  constructor(props) {
    super(props);

    term = new Terminal({
      cols: 110,
      theme: { background: "transparent" }
    });
    //Set up some terminal options
    term.setOption("allowTransparency", true);
    term.setOption("cursorStyle", "bar");
    term.setOption("fontSize", 14);
    term.setOption("disableStdin", true);
  }

  componentDidMount() {
    //Grab div from the DOM to render terminal
    term.open(document.getElementById("output"));
    // apply 'fit' addon
    Terminal.applyAddon(fit);
    term.fit();

    ipcRenderer.on("craOut", (event, arg) => {
      term.write(arg);
    });
  }
  componentWillUnmount() {
    term.destroy();
  }
  render() {
    const divStyle = {
      height: "200px"
    };
    return <div id="output" style={divStyle} />;
  }
}
export default OutputConsole;
