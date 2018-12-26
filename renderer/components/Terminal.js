import React from 'react';
const { ipcRenderer }  = require('electron');
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
const { runShell } = require('../../nodeTerminal');

let term = null;
let proc = null;

//Declare terminal for use throughout the component lifecycle
class XTerm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {projLoaded: false};
    // this.focusXTerm = this.focusXTerm.bind(this);
  }
  //Compare rootdir being passed to determine whether or not we need to render a new terminal
  //with a different rootpath
  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.rootdir !== this.state.cwd && nextProps.rootdir !== this.props.rootdir) {
  //     //Perform some operation
  //     this.setState({ cwd: nextProps.rootdir, rootDir: nextProps.rootdir }, () => {
  //       term.clear();
  //       term.write(this.state.cwd + '\r\n' + '$');
  //       shell.cd(this.state.cwd);
  //     });
  //   }
  // }

  // runShell(cwd, terminal) {
  //   const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
  //   let p = pty.spawn(shell, [], {
  //     name: 'xterm-color',
  //     col: 131,
  //     rows: 30,
  //     cwd: cwd,
  //     env: process.env
  //   });
  //   p.on('data', function (data) {
  //     terminal.write(data);
  //   });
  //   terminal.on('data', function (data) {
  //     p.write(data);
  //   });
  //   p.write('PS1=\"\\u:\\w\\$\ "\r');
  // }
  componentWillReceiveProps(nextProps) {
    if (nextProps.projLoaded != this.state.projLoaded ) {
      if (nextProps.projLoaded) {
      console.log('pre runShell', this.props.rootPath);
      proc = runShell(this.props.rootPath, term);
      console.log('post runShell', proc);
      }
      else {
        proc.kill();
        term.clear();
      }
      this.setState({projLoaded: nextProps.projLoaded});
    }
  }

  componentDidMount() {
    // apply 'fit' addon
    Terminal.applyAddon(fit);
    term = new Terminal({
      cols: 131,
      theme: { background: 'transparent' }
    });
    
    //Set up some terminal options
    term.setOption('allowTransparency', true);
    term.setOption('cursorStyle', 'block');
    term.setOption('cursorBlink', true);
    term.setOption('fontSize', 14);
    
    //Grab div from the DOM to render terminal
    term.open(document.getElementById('terminal'));
    // let greeting = '';
    term.fit();
    term.focus();
    // ipcRenderer.on("termOut", (event, arg) => {
    //   term.write(arg);
    // });

    /*
    term.on('data', (data) => {
      console.log('sending data via ipc', data);
      ipcRenderer.send('term-stdin', data);
    });
    */
    //this.runShell(this.state.cwd, term);

    //On keypress, execute. Switch case to handle the enter, lft, rght, up, down arrow and normal keys
    // term.on('key', (key, ev) => {
    //   const fileManipulation = new Set(['cp', 'mkdir', 'touch', 'rm', 'rmdir', 'mv']);
    //   switch (ev.keyCode) {
    //     //When a user hits enter, clean up the input for execution of the command within node child_process
    //     case 13:
    //       let output;
    //       let command = this.state.currCommand;
    //       let newPath;
    //       //Check for cd to be handled on the front-end without communication with spawn
    //       if (command.split(' ')[0] === 'cd' && command.split(' ').length === 2) {
    //         newPath = path.join(this.state.cwd, command.split(' ')[1]);
    //         this.setState({ cwd: newPath });
    //         greeting = newPath;
    //         term.write('\r\n' + greeting + '\r\n');
    //         term.write('$');
    //         //Check for cd with other options, strip the cd command away and run the rest of the command in spawn
    //       } else {
    //         if (command.split(' ')[0] === 'cd' && command.split(' ').length > 2) {
    //           newPath = path.join(this.state.cwd, command.split(' ')[1]);
    //           this.setState({ cwd: newPath });
    //           greeting = newPath;
    //           command = command.split(' ').slice(2).join(' ');
    //         }
    //         output = runTerminal(this.state.cwd, command, term);
    //         if (Promise.resolve(output) === output) {
    //           output.then(() => {
    //             if (fileManipulation.has(command.split(' ')[0])) {
    //               this.props.cb_setFileTree(this.state.rootDir);
    //             }
    //           })
    //             .catch(err => {
    //               console.log(err);
    //             })
    //         }
    //       }
    //       //Clear state for the next command
    //       this.setState({ currCommand: '' });
    //       break;
    //     //When a backspace is hit, write it, then delete the latest char from the curr Command
    //     case 8:
    //       term.write('\b \b');
    //       this.setState({ currCommand: this.state.currCommand.slice(0, -1) });
    //       break;
    //     default:
    //       //Disable left and right keys from changing state, only allow them to change how the terminal looks
    //       if (ev.keyCode === 37) {
    //         term.write(key);
    //         this.setState({ cursorIndex: this.state.cursorIndex - 1 })
    //       } else if (ev.keyCode === 39) {
    //         term.write(key);
    //         this.setState({ cursorIndex: this.state.cursorIndex + 1 });
    //       }
    //       else {
    //         term.write(key);
    //         this.setState({ currCommand: this.state.currCommand + key, cursorIndex: this.state.cursorIndex + 1 });
    //       }
    //   }
    // })
  }

  componentWillUnmount() {
    //ipcRenderer.send('unbind-runShell');
    term.destroy();
  }
  render() {
    const divStyle = {
      height: '200px'
    }
    return (
      <div id='terminal' style={divStyle} />
    )
  }
}
export default XTerm;