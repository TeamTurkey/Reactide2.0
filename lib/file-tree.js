'use strict'
//Pass in path to root directory
//returns object representation with all directories and files
//directory properties have property structure
//path: STRING, files: ARRAY, opened: BOOL (default false), type:STRING
//file properties have property structure
//path:STRING, type:STRING

//separate out the proj info stuff into another module? and then put info in local storage instead of a local file?

const fs = require('fs');
const path = require('path');
const { File, Directory } = require('./item-schema');

function insertSorted(fileOrDir, filesOrDirs) {
  // for (var i = 0; i < filesOrDirs.length; i++) {
  //   for (var j = 0; j < fileOrDir.name.length; j++) {
  //     if (fileOrDir.name[j] > filesOrDirs[i].name[j]) break;
  //     else if (fileOrDir.name[j] < filesOrDirs[i].name[j]) filesOrDirs.splice(i, 0, fileOrDir);
  //   }
  // }
  filesOrDirs.push(fileOrDir);
}

const projInfo = {
  htmlPath: '',
  hotLoad: false,
  webpack: false,
  rootPath: '',
  devServer: false,
  devServerScript: '',
  mainEntry: '',
  reactEntry: '',
  CRA: false,
};

function init() {
  projInfo.htmlPath = '';
  projInfo.hotLoad = false;
  projInfo.webpack = false;
  projInfo.rootPath = '';
  projInfo.devServer = false;
  projInfo.devServerScript = '';
  projInfo.mainEntry = '';
  projInfo.reactEntry = '';
  projInfo.CRA = false;
}

var projInfoPath = path.join(__dirname, '../lib/projInfo.js');

const getTree = (rootDirPath, callback) => {
  init();
  projInfo.rootPath = rootDirPath;

  let fileTree = new Directory(rootDirPath, path.basename(rootDirPath));
  let pending = 1;
  function recurseThroughFileTree(directory) {
    //Loop through files and fill files property array
    fs.readdir(directory.path, (err, files) => {
      pending += files.length;
      if (!--pending) {
        fs.writeFileSync(projInfoPath, JSON.stringify(projInfo));
        callback(fileTree);
      }
      files.forEach((file) => {
        const filePath = path.join(directory.path, file);

        fs.stat(filePath, (err, stats) => {
          if (err) {
            if (!--pending) {
              fs.writeFileSync(projInfoPath, JSON.stringify(projInfo));
              callback(fileTree);
            }
          }

          if (stats && stats.isFile()) {
            insertSorted(new File(filePath, file), directory.files);
            if(file.search(/webpack.config.js/) !== -1 && filePath === path.join(projInfo.rootPath, file)) {
              fs.readFile(filePath, {encoding: 'utf-8' }, (err, data) => {
                const regExp = new RegExp('entry(.*?),', 'g');

                let entry = JSON.stringify(data).match(regExp);
                let reactEntry = String(entry[0].split('\'')[1]);
                projInfo.reactEntry = path.join(projInfo.rootPath, reactEntry);
              })
            }
            //look for index.html not in node_modules, get path
            if (!projInfo.htmlPath && filePath.search(/.*node\_modules.*/) === -1 && file.search(/.*index\.html/) !== -1) {
              projInfo.htmlPath = filePath;
            }
            //look for package.json and see if webpack is installed and react-dev-server is installed
            else if (!projInfo.webpack && file.search(/package.json/) !== -1 && filePath === path.join(projInfo.rootPath, file)) {
              fs.readFile(filePath, { encoding: 'utf-8' }, (err, data) => {
                data = JSON.parse(data);
                // if (data.search(/webpack/) !== -1) projInfo.webpack = true;
                // if (data.search(/react-hot-loader/) !== -1) projInfo.hotLoad = true;
                if(data.dependencies['react-scripts']) {
                  projInfo.devServerScript = 'start',
                  projInfo.CRA = true;
                } else if(data.devDependencies['webpack-dev-server']){
                  projInfo.devServerScript = 'run dev-server';
                }
                if(data.main) {
                  projInfo.mainEntry = path.join(filePath,data.main);
                }
                // else if (data.dependencies.webpack-dev-server) {
                //   projInfo.devServer = true;
                //   data.scripts.forEach(script => {
                //     if(data.scripts[script].includes('webpack-dev-server')){
                //       projInfo.devServerScript = script;
                //     }
                //   })
                // } else{

                // }
              })
            }


            // else if (!projInfo.hotLoad && filePath.search(/.*node\_modules.*/) === -1 && file.search(/index.js/)) {
            //   fs.readFile(filePath, { encoding: 'utf-8' }, (err, data) => {
            //     if (data.search(/react-hot-loader/) !== -1) {
            //       projInfo.hotLoad = true;
            //     }
            //   })
            // }

            if (!--pending) {
              fs.writeFileSync(projInfoPath, JSON.stringify(projInfo));
              callback(fileTree);
            }
          }

          else if (stats) {
            const subdirectory = new Directory(filePath, file);
            //put directories in front
            insertSorted(subdirectory, directory.subdirectories);
            recurseThroughFileTree(subdirectory);
          }
        })
      })
    })
  }
  recurseThroughFileTree(fileTree);
  return fileTree;
}

module.exports = { getTree };