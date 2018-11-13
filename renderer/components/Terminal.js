import React from 'react';
import { Terminal } from 'xterm';
import shell from 'shelljs';
import * as fit from 'xterm/lib/addons/fit/fit';
import path from 'path';
const { runTerminal } = require('../../nodeTerminal.js');
console.log('THIS IS RUN TERMINAL', runTerminal);
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
      let greeting = '';
      term.fit();
      term.on('key', (key, ev) => {
        if(ev.keyCode === 13) {
          let output;
          let command = this.state.currCommand;
          let newPath;
          if(command.split(' ')[0] === 'cd' && command.split(' ').length === 2) {
            console.log('CD PATH CASE');
            newPath = path.join(this.state.cwd, command.split(' ')[1]);
            this.setState({cwd: newPath});
            greeting = newPath;
            term.write('\r\n' + greeting + '\r\n');
            term.write('$');
          } else{
            if(command.split(' ')[0] === 'cd' && command.split(' ').length > 2) {
              newPath = path.join(this.state.cwd, command.split(' ')[1]);
              this.setState({cwd: newPath});
              greeting = newPath;
              command = command.split(' ').slice(2).join(' ');
            }
            output = runTerminal(this.state.cwd, command);
            output.then((data) => {
                console.log('DATA WITHIN TERMINAL.js', data);
                data = data.split('\n');
                data.forEach((file) => {
                  term.write('\r\n' + file + ' ')
                });
            })
            .then(() => {
              if(greeting !== '') {
                term.write('\r\n' + greeting + '\r\n');
                term.write('$');
              } else{
                term.write('\r\n' + this.state.cwd + '\r\n');
                term.write('$');
              }
            })
            .catch((err) => {
              console.log(err);
              term.write('\r\n' + err);
              term.write('\r\n' + this.state.cwd + '\r\n');
              term.write('$');
            })
          }
          
        
          
          // switch(currCommand) {
          //   case 'ls':
          //     console.log(currCommand2);
          //     output = ''
          //     shell.ls(currCommand2[0], this.state.cwd).forEach((file) => {
          //       output += file;
          //       output += ' ';
          //     });
          //     term.write('\n' + output + '\n');
          //     break;
          //   case 'pwd':
          //     term.write('\n' + shell.pwd() + '\n');
          //     break;
          //   case 'clear':
          //     term.clear();
          //     break;
          //   case 'cd':
          //     let newPath = path.join(this.state.cwd, currCommand2[0]);
          //     shell.cd(newPath);
          //     this.setState({cwd: newPath});
          //     greeting = newPath;
          //     break;
          //   case 'cat':
          //   let catFile;
          //   if(currCommand2[0] === '-n') {
          //     catFile = shell.cat('-n', currCommand2.slice(1))
          //   } else{
          //     catFile = shell.cat(currCommand2);
          //   }
          //   term.write(catFile);
          //   break;
          //   case 'cp':
          //     //TAKES IN OPTIONS, ARR OF SOURCE OR SOURCE, DEST
          //     let dest = currCommand2[currCommand2.length-1];
          //     let src = currCommand2.slice(1, currCommand2.length-1);
          //     let options = currCommand2[0];
          //     output = shell.cp(options, src, dest);
          //     if(output.stderr) {
          //       term.write('\r\n' + output.stderr);
          //       break;
          //     }
          //     break;
          //   case 'echo':
          //     if (currCommand2.length > 1) {
          //       let stringToEcho = currCommand2.slice(1).join('')
          //       output = shell.echo(currCommand2[0], stringToEcho);
          //       term.write('\r\n' + output.stdout);
          //     } else{
          //       output = shell.echo(currCommand2[0]);
          //       term.write('\r\n' + output.stdout);
          //     }
          //     break;
          //   case 'find':
          //       output = shell.find(currCommand2);
          //       if(output.stderr) {
          //         term.write('\r\n' + output.stderr);
          //         break;
          //       }
          //       console.log('OUTPUT FROM FIND',output);
          //       output.forEach((file) => term.write('\r\n' + file + '\r\n'));
          //       break;
          //   case 'head':
          //       currCommand2 = currCommand2.filter((e) => {return e !== ''});
          //       console.log('THIS IS currCOmmand2',currCommand2);
          //       if(currCommand2[0].includes('-')) {
          //         let numLines = currCommand2[1];
          //         output = shell.head({'-n': numLines}, currCommand2.slice(2));
          //         term.write('\r\n' + output.stdout);
          //         break;
          //       } else{
          //         let numLines = currCommand2[0];
          //         numLines = numLines.replace('-n', '');
          //         console.log(numLines);
          //         console.log(currCommand2.slice(1));
          //         output = shell.head({'-n': numLines}, currCommand2.slice(1));
          //         console.log(output);
          //         term.write('\r\n' + output.stdout);
          //         break;
          //       }
                
          //   default:
          //     term.write('\r\n' + this.state.currCommand + ": command not found" + '\r\n')
          //     break;
          
          
          //run something in the terminal
          //output the response and then reset currCommand
          this.setState({currCommand: ''});
        } 
        else if(ev.keyCode === 8) {
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