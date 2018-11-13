const path = require('path');
const {exec} = require('child_process');
//const exec = require('executive');

const runTerminal = (cwd, command) => {
  console.log('EXECUTING RUN TERMINAL', cwd, JSON.stringify(command));
  if(command[0] === '\\'){
    command = command.slice(2);
  }
  console.log(JSON.stringify(command));
  return new Promise((resolve, reject) => {
    let result = '';
    let child = exec(command, 
      {
        cwd: cwd
      })
    child.stdout.on('data', (data) => {
      result = result + data.toString() + ' ';
      resolve(result);
    });
    child.on('close', (code) => {
    });
    child.stderr.on('data', (data) => {
      console.log('err within runTerminal', data);
      reject(data);
    })
  });
}
module.exports = {runTerminal}