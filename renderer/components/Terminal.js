import React from 'react';
import { Terminal } from 'xterm';
import shell from 'shelljs';
import * as fit from 'xterm/lib/addons/fit/fit';
Terminal.applyAddon(fit);
class XTerm extends React.Component {
    constructor() {
      super();
      this.state = {
        currCommand: '',
        cwd: '',
      }
    }
    componentDidMount(){
      //Declaring actual terminal
      

      console.log("Creating new terminal");
      const term = new Terminal();
      term.setOption('cursorStyle', 'block');
      term.setOption('cursorBlink', true);
      //term.setOption('convertEol', true);
      term.open(document.getElementById('terminal'));
      let greeting = this.state.user + ' ' + this.state.cwd + '\r\n';
      term.write(greeting);
      term.fit();
      term.on('key', (key,ev) => {
        if(ev.keyCode === 13) {
          term.write('\r\n' + greeting);
          term.write('$ ');
          term.write("\u001B[1C")
          //run something in the terminal
          //output the response and then reset currCommand
          this.setState({currCommand: ''});
        } 
        if(ev.keyCode === 8) {
          term.write('\b \b');
          this.setState({currCommand: this.state.currCommand.slice(0, -1)});
        } else{
          term.write(key);
          this.setState({currCommand: this.state.currCommand + key});
        }
        console.log(this.state.currCommand);
      })
      // xterm.on('data', (data) => {
      //   ptyProcess.write(data);
      // });
      xterm.on('data', (data) => {
        ptyProcess.write(data);
      });
    }
    render() {
      return ( 
          <div id='terminal'>
          </div>
      )
      
    }
}
export default XTerm;