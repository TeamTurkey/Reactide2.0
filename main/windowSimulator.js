'use strict';

const fs = require('fs');
const path = require('path');
require('fix-path')();
const {spawn} = require('child_process');


const windowSimulator = () => {

  const projInfo = JSON.parse(fs.readFileSync(path.join(__dirname, '../lib/projInfo.js')));
  console.log(projInfo);
  console.log('MESSAGE RECEIVED')
  //Simulation for CRA
  if (projInfo.devServerScript === 'start') {
    console.log('RUNNING NPM START');
    const child = spawn('npm', ['start'], {cwd: projInfo.rootPath});
      child.stdout.on('data', (data) => {
        global.mainWindow.webContents.send('start simulator',['http://localhost:3000',child.pid]);
      });
      child.on('close', (data) => {
        console.log('ONCLOSE PID', child.pid);
      })
      // (err, stdout, stderr) => {
      //   if(err) console.log(err);
      //   console.log('ABOUT TO SEND PAYLOAD')
      // }
  //Simulation for react-dev-server
  } else if (projInfo.devServerScript === 'run dev-server') {
    let child = spawn('npm',  ['run', 'dev-server'], {cwd: projInfo.rootPath, shell: true});
      child.stdout.on('data', (data) => {
      global.mainWindow.webContents.send('start simulator',['http://localhost:8085/index.html', child.pid]);
    })
  } else if (projInfo.htmlPath) {
    global.mainWindow.webContents.send('file://' + projInfo.htmlPath);
  } else {
    console.log('No Index.html found');
  }
};

module.exports = windowSimulator;
