import React from 'react';
import { Terminal } from 'xterm';
import shell from 'shelljs';
import * as fit from 'xterm/lib/addons/fit/fit';
import path from 'path';
Terminal.applyAddon(fit);

const term = new Terminal();

class XTerm extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        currCommand: '',
        cwd: this.props.rootdir,
      }
    }
    componentWillReceiveProps(nextProps) {
      console.log('IN COMPONENET WILL RECEVIE PROPS');
      console.log(nextProps.rootdir, this.state.cwd);
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
      //Declaring actual terminal
      term.setOption('cursorStyle', 'block');
      term.setOption('cursorBlink', true);
      //term.setOption('convertEol', true);
      term.open(document.getElementById('terminal'));
      console.log('STATE CWD', this.state.cwd);
      //term.write(greeting);
      let greeting = '';
      term.fit();
      term.on('key', (key, ev) => {
        console.log(ev);
        if(ev.keyCode === 13) {
          let commandArr= this.state.currCommand.split(' ');
          let currCommand = commandArr[0].replace(/[\n\r]/g, '');
          let currCommand2 = commandArr.slice(1);
          console.log('CURRCOMMAND AFTER ENTER PRESSED', JSON.stringify(currCommand));
          console.log(currCommand2);
          switch(currCommand) {
            case 'ls':
              console.log(currCommand2);
              let output = ''
              shell.ls(currCommand2[0], this.state.cwd).forEach((file) => {
                output += file;
                output += '   ';
              });
              term.write('\n' + output + '\n');
              break;
            case 'pwd':
              term.write('\n' + shell.pwd() + '\n');
              break;
            case 'clear':
              term.clear();
              break;
            case 'cd':
              let newPath = path.join(this.state.cwd, currCommand2[0]);
              shell.cd(newPath);
              this.setState({cwd: newPath});
              greeting = newPath;
              break;
            case 'cat':
            let catFile;
            if(currCommand2[0] === '-n') {
              catFile = shell.cat('-n', currCommand2.slice(1))
            } else{
              catFile = shell.cat(currCommand2);
            }
            term.write(catFile);
            break;
            case 'cp':
              //TAKES IN OPTIONS, ARR OF SOURCE OR SOURCE, DEST
              
            default:
              term.write('\r\n' + this.state.currCommand + ": command not found" + '\r\n')
              break;
          }
          if(greeting !== '') {
            term.write('\r\n' + greeting + '\r\n');
            term.write('$');
          } else{
            term.write('\r\n' + this.state.cwd + '\r\n');
            term.write('$');
          }
          
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
      })
      
      // xterm.on('data', (data) => {
      //   ptyProcess.write(data);
      // });
    }
    render() {
      return ( 
          <div id='terminal'>
          </div>
      )
      
    }
}
export default XTerm;