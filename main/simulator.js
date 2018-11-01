'use strict';

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { BrowserWindow } = require('electron');

const simulator = () => {
  const WIDTH = 800;
  const HEIGHT = 600;
  //Deserialize project info from projInfo file, contains path to index.html and presence of webpack among other things
  const projInfo = JSON.parse(fs.readFileSync(path.join(__dirname, '../lib/projInfo.js')));
  console.log(projInfo);

  //Dynamic simulation
  if (projInfo.devServerScript === 'start') {
    console.log('RUNNING NPM START');
    let child = exec(
      'npm start',
      {
        cwd: projInfo.rootPath
      },
      (err, stdout, stderr) => {
        console.log('This is stdout:',stdout)
        if(err) console.log(err);
        console.log('This is stderr', stderr);
        let child = new BrowserWindow({
          width: WIDTH,
          height: HEIGHT
        });
        child.loadURL('http://localhost:3000');
        child.toggleDevTools();
      }
    );
  } else if (projInfo.devServerScript === 'run dev-server') {
    console.log('Webpacking');
    let child = exec(
      'npm run dev-server',
      {
        cwd: projInfo.rootPath,
        shell: '/bin/bash'
      },
      (err, stdout, stderr) => {
        console.log(stdout);
        let child = new BrowserWindow({
          width: WIDTH,
          height: HEIGHT
        });
        child.loadURL('http://localhost:8085');
        child.toggleDevTools();
      }
    );
  } else if (projInfo.htmlPath) {
    console.log('hello world im in htmlpath');
    let child = new BrowserWindow({
      width: WIDTH,
      height: HEIGHT
    });
    child.loadURL('file://' + projInfo.htmlPath);
    child.toggleDevTools();
  } else {
    console.log('No Index.html found');
  }
};

module.exports = simulator;
