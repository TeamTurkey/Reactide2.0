import React from 'react';
import { Terminal } from 'xterm';
import shell from 'shelljs';
import * as fit from 'xterm/lib/addons/fit/fit';
import path from 'path';
const { runTerminal } = require('../../nodeTerminal.js');
console.log('THIS IS RUN TERMINAL', runTerminal);
Terminal.applyAddon(fit);
//Declare terminal for use throughout the component lifecycle
const term = new Terminal();

class XTerm extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        currCommand: '',
        cwd: this.props.rootdir,
        pastCommands: [],
        commandIndex: 0,
        cursorIndex: -1
      }
    }
    //Compare rootdir being passed to determine whether or not we need to render a new terminal
    //with a different rootpath
    componentWillReceiveProps(nextProps) {
      if(nextProps.rootdir !==this.state.cwd && nextProps.rootdir !== this.props.rootdir){
        //Perform some operation
        this.setState({cwd: nextProps.rootdir }, () => {
          term.clear();
          term.write(this.state.cwd + '\r\n' + '$');
          shell.cd(this.state.cwd);
        });
      }
  }
    componentDidMount(){
      //Set up some terminal options
      term.setOption('cursorStyle', 'block');
      term.setOption('cursorBlink', true);
      //Grab div from the DOM to render terminal
      term.open(document.getElementById('terminal'));
      let greeting = '';
      term.fit();
      //On keypress, execute. Switch case to handle the enter, lft, rght, up, down arrow and normal keys
      term.on('key', (key, ev) => {
        switch(ev.keyCode){
          //When a user hits enter, clean up the input for execution of the command within node child_process
          case 13:
            let output;
            let command = this.state.currCommand;
            console.log(command);
            let newPath;
            //Check for cd to be handled on the front-end without communication with spawn
            if(command.split(' ')[0] === 'cd' && command.split(' ').length === 2) {
              console.log('CD PATH CASE');
              newPath = path.join(this.state.cwd, command.split(' ')[1]);
              this.setState({cwd: newPath});
              greeting = newPath;
              term.write('\r\n' + greeting + '\r\n');
              term.write('$');
              //Check for cd with other options, strip the cd command away and run the rest of the command in spawn
            } else{
              if(command.split(' ')[0] === 'cd' && command.split(' ').length > 2) {
                newPath = path.join(this.state.cwd, command.split(' ')[1]);
                this.setState({cwd: newPath});
                greeting = newPath;
                command = command.split(' ').slice(2).join(' ');
              }
              output = runTerminal(this.state.cwd, command, term);
            }
            //set past Commands
            const arrCopy = this.state.pastCommands.slice();
            arrCopy.push(command)
            //Clear state for the next command
            this.setState({currCommand: '', pastCommands: arrCopy});
            break;
            //When a backspace is hit, write it, then delete the latest char from the curr Command
          case 8:
            term.write('\b \b');
            this.setState({currCommand: this.state.currCommand.slice(0, -1)});
            break;
          case 38:
            // let commandUp = this.state.pastCommands[this.state.commandIndex];
            // term.clear();
            // term.write(commandUp)
            // if(this.state.commandIndex < this.state.pastCommands.length) {
            //   this.setState({currCommand: commandUp, commandIndex: this.state.commandIndex + 1})
            // } 
            break;
          case 40:
            // let commandDown = this.state.pastCommands[this.state.commandIndex];
            // term.clear();
            // term.write(commandDown);
            // if(this.state.commandIndex > 0) {
            //   this.setState({currCommand: commandUp, commandIndex: this.state.commandIndex - 1})
            // } 
            break;            
          default:
            //Disable left and right keys from changing state, only allow them to change how the terminal looks
            if(ev.keyCode === 37){
              term.write(key);
              this.setState({cursorIndex: this.state.cursorIndex - 1})
            } else if(ev.keyCode === 39){
              term.write(key);
              this.setState({cursorIndex: this.state.cursorIndex + 1});
            }
            else{
              term.write(key);
              this.setState({currCommand: this.state.currCommand + key, cursorIndex: this.state.cursorIndex + 1});
            }
      }
    })
  }
    render() {
      const divStyle = {
        height: '30%'
      }
      return ( 
          <div id='terminal' style = {divStyle}>
          </div>
      )
    }
}
export default XTerm;