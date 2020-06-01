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
const { File, Directory } = require('../../lib/item-schema');
const projInfoPath = path.join(__dirname, '../../lib/projInfo.js');
const { getFileExt } = require('../../lib/common');

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

let fsWatcher = null;

function insertSorted(fileOrDir, filesOrDirs) {
  // for (var i = 0; i < filesOrDirs.length; i++) {
  //   for (var j = 0; j < fileOrDir.name.length; j++) {
  //     if (fileOrDir.name[j] > filesOrDirs[i].name[j]) break;
  //     else if (fileOrDir.name[j] < filesOrDirs[i].name[j]) filesOrDirs.splice(i, 0, fileOrDir);
  //   }
  // }
  filesOrDirs.push(fileOrDir);
}

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

const getTree = (rootDirPath) => {
  init();
  projInfo.rootPath = rootDirPath;
  let fileTree = new Directory(rootDirPath, path.basename(rootDirPath), true);

  function recurseThroughFileTree(directory) {
    return new Promise((resolve, reject) => {
      //Loop through files and fill files property array
      fs.readdir(directory.path, (err, files) => {
        global.mainWindow.webContents.send("craOut", path.relative(rootDirPath, directory.path) + '\r\n');
        if (err)
          return reject(err);
        // if directory is empty  
        if (files.length === 0)
          return resolve();

        let pending = files.length;
        files.forEach((file) => {
          const filePath = path.join(directory.path, file);
          fs.stat(filePath, (err, stats) => {
            if (err)
              return reject(err);
            if (stats && stats.isFile()) {
              insertSorted(new File(filePath, file, getFileExt), directory.files);
              // look for index.html not in node_modules, get path
              if (!projInfo.htmlPath && filePath.search(/.*node\_modules.*/) === -1 && file.search(/.*index\.html/) !== -1) {
                projInfo.htmlPath = filePath;
              }
              if (!--pending)
                return resolve();
            }
            else if (stats) {
              const subdirectory = new Directory(filePath, file);
              //put directories in front
              insertSorted(subdirectory, directory.subdirectories);
              recurseThroughFileTree(subdirectory).then(() => {
                if (!--pending)
                  return resolve();
              });
            }
          })
        });
      })
    });
  }
  recurseThroughFileTree(fileTree)
    .then(() => {
      const WEBPACK_CONFIG_JS_PATH = path.join(projInfo.rootPath, 'webpack.config.js');
      const PACKAGE_JSON_PATH = path.join(projInfo.rootPath, 'package.json');
      // look for webpack.config.js => find 'entry'
      if (fs.existsSync(WEBPACK_CONFIG_JS_PATH)) {
        const data = fs.readFileSync(WEBPACK_CONFIG_JS_PATH, { encoding: 'utf-8' });
        if (data) {
          const regExp = new RegExp('entry(.*?),', 'g');
          let entry = JSON.stringify(data).match(regExp);
          let reactEntry = String(entry[0].split('\'')[1]);
          projInfo.reactEntry = path.join(projInfo.rootPath, reactEntry);
        }
      }
      // look for package.json and see if webpack is installed and react-dev-server is installed
      if (fs.existsSync(PACKAGE_JSON_PATH)) {
        const data = fs.readFileSync(PACKAGE_JSON_PATH, { encoding: 'utf-8' });
        if (data) {
          const packageJson = JSON.parse(data);
          // if (data.search(/webpack/) !== -1) projInfo.webpack = true;
          // if (data.search(/react-hot-loader/) !== -1) projInfo.hotLoad = true;
          if (packageJson.dependencies['react-scripts']) {
            projInfo.devServerScript = 'start',
              projInfo.CRA = true;
          } else if (packageJson.devDependencies['webpack-dev-server']) {
            projInfo.devServerScript = 'run dev-server';
          }
          if (packageJson.main) {
            projInfo.mainEntry = path.join(PACKAGE_JSON_PATH, packageJson.main);
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
        }
      }
      // else if (!projInfo.hotLoad && filePath.search(/.*node\_modules.*/) === -1 && file.search(/index.js/)) {
      //   fs.readFile(filePath, { encoding: 'utf-8' }, (err, data) => {
      //     if (data.search(/react-hot-loader/) !== -1) {
      //       projInfo.hotLoad = true;
      //     }
      //   })
      // }
      // write back projInfo
      fs.writeFileSync(projInfoPath, JSON.stringify(projInfo));
      // do fileTree callback
      global.mainWindow.webContents.send('fileTree', fileTree);
      // setup fs watcher
      // if (fsWatcher)
      //   fsWatcher.close();
      // // Setting up fs.watch to watch for changes that occur anywhere in the filesystem
      // fsWatcher = fs.watch(rootDirPath, { recursive: true }, (event, filename) => {
      //   if (event === 'rename') {
      //     fsWatcherEventHandler(filename);
      //   }
      // });
    })
    .catch((err) => {
      console.log(err);
    });
}

module.exports = { getTree };