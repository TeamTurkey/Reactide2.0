const fs = require('fs');
const path = require('path');
const {exec} = require('child_process');
module.exports = (dest) => {
  //cwd is the destinations parent folder
  let cwd = path.dirname(dest);
  //Command is the terminal script for creating a create-react-app in the dest folder
  let command = 'npx create-react-app ' + path.basename(dest);
  //Execute terminal command, then send the 'openDir' event listener
  let child = exec(
    command,
    {
      cwd: cwd
    },
    (err, stdout, stderr) => {
      if(err) console.log(err);
      global.mainWindow.webContents.send('openDir', dest);
    }
  );
}