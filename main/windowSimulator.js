'use strict';

const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');


const windowSimulator = () => {

  const projInfo = JSON.parse(fs.readFileSync(path.join(__dirname, '../lib/projInfo.js')));
  console.log(projInfo);
  console.log('MESSAGE RECEIVED')
  //Simulation for CRA
  if (projInfo.devServerScript === 'start') {
    console.log('RUNNING NPM START');
    let child = exec(
      'npm start',
      {
        cwd: projInfo.rootPath,
      },
      (err, stdout, stderr) => {
        if(err) console.log(err);
        console.log('ABOUT TO SEND PAYLOAD')
        global.mainWindow.webContents.send('start simulator','http://localhost:3000');
      }
    );
  //Simulation for react-dev-server
  } else if (projInfo.devServerScript === 'run dev-server') {
    let child = exec(
      'npm run dev-server',
      {
        cwd: projInfo.rootPath,
        shell: '/bin/bash'
      },
      (err, stdout, stderr) => {
        console.log('ABOUT TO SEND PAYLOAD');
        global.mainWindow.webContents.send('start simulator','http://localhost:8085');
      }
    );
  } else if (projInfo.htmlPath) {
    global.mainWindow.webContents.send('file://' + projInfo.htmlPath);
  } else {
    console.log('No Index.html found');
  }
};

module.exports = windowSimulator;
