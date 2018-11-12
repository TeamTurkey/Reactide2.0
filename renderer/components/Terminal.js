import React from 'react';
import { Terminal } from 'xterm'
import * as fit from 'xterm/lib/addons/fit/fit';
Terminal.applyAddon(fit);

class XTerm extends React.Component {
    constructor() {
      super();
      this.state = {
        currCommand: '',
        cwd: 'something',
        user: 'oscarchan',
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
      term.write('$')
      term.fit();
      term.on('key', (key,ev) => {
        console.log('This is the ev object', ev);
        if(ev.keyCode === 13) {
          term.write('\r\n' + greeting);
          term.write('$');
          term.write('\x1b[C');
          console.log('hello');
          //run something in the terminal
          //output the response and then reset currCommand
          this.setState({currCommand: ''});
        } 
        if(ev.keyCode === 8) {
          term.write('\b \b');
          this.setState({currCommand: this.state.currCommand.slice(0, -1)});
          // term.selectAll();
          // console.log('CURRENT SELECTION', typeof term.getSelection());
          // console.log('Clearing contents');
          // term.clear();
        } else{
          term.write(key);
          this.setState({currCommand: this.state.currCommand + key});
        }
        console.log(this.state.currCommand);
      })
      // xterm.on('data', (data) => {
      //   ptyProcess.write(data);
      // });
    }
    render() {
      return (
        <div>
          <div id='terminal'>
          </div>
        </div>
      )
      
    }
}
export default XTerm;