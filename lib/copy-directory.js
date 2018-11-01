'use strict'

const fs = require('fs');
const path = require('path');
//MAKE A DIRECTORY --OSCAR AND PABLO
module.exports = (source, destination) => {
  //create recursive function
    //check whether if source is file or directory
    console.log('This is destination: ', destination);
    const dest = path.join(destination, path.basename(source));
    console.log('This is dest', dest);
    const stats = fs.statSync(source);
    console.log('This is stats: ', stats);
    // if (stats.isFile()) {
    //   console.log('STATS IS A FILE');
    //   //if file read then write to destination
    //   let data = fs.readFileSync(source);
    //   console.log('ABLE TO READ');
    //   fs.writeFileSync(destination, data);
    //   console.log('ABLE TO WRITE');
    // }
    //if directory exists don't overwrite, otherwise mkdir
    //should ask user if he wants to overwrite everything and overwrite everything if yes
      try {
        console.log('dest in else statement:', dest);
        fs.accessSync(dest);
        console.log('can access!');
        console.log('directory found, won\'t overwrite');
      } catch (e) {
        console.log('catch statement', dest);
        fs.mkdirSync(destination);
        console.log('AFTER MKDIR');
        // const files = fs.readdirSync(source);
        // files.forEach((file) => {
        //   recurseThroughSource(path.join(source, path.basename(file)), dest);
        // });
      }
    }
    //then recurses with path to that directory
//   recurseThroughSource(source, destination);
// }