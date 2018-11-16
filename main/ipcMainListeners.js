'use strict';

const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const deleteItem = require('../lib/delete-directory');
const simulator = require('./simulator');
const windowSimulator = require('./windowSimulator')

module.exports = () => {
  //ipcMain listeners
  ipcMain.on('openSimulator', (event) => {
    simulator();
  });

  ipcMain.on('openInWindow', () => {
    InWindowSimulator();
  })
  ipcMain.on('createItem', (event, dirPath, name, type) => {
    if (type === 'file') {
      fs.writeFile(path.join(dirPath, name), '', err => {
        if (err) console.log(err);
      });
    } else {
      fs.mkdir(path.join(dirPath, name), err => {
        if (err) console.log(err);
      });
    }
  });

  ipcMain.on('delete', (event, itemPath) => {
    console.log('deleting');
    deleteItem(itemPath);
  });

  ipcMain.on('rename', (event, itemPath, newName) => {
    fs.rename(itemPath, path.join(path.dirname(itemPath), newName), (err) => {
      if(err) console.log(err);
      console.log('Rename done.');
    });
  });
  ipcMain.on('start simulator', ()=> {
    console.log('IN IPCMAIN')
    windowSimulator();
  })
};
