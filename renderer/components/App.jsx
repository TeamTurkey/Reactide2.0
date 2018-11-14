import React from 'react';
import FileTree from './FileTree';
import TextEditorPane from './TextEditorPane';
import DeletePrompt from './DeletePrompt';
import MockComponentTree from './MockComponentTree';
import MockComponentInspector from './MockComponentInspector';
import Simulator from './InWindowSimulator';
import  XTerm  from './Terminal.js'
import { ipcMain } from 'electron';
import InWindowSimulator from './InWindowSimulator';
const { ipcRenderer } = require('electron');
const { getTree } = require('../../lib/file-tree');
const fs = require('fs');
const path = require('path');
const { File, Directory } = require('../../lib/item-schema');
// const {grabChildComponents, constructComponentTree, constructSingleLevel, constructComponentProps, importNamePath, grabAttr, digStateInBlockStatement, digStateInClassBody, grabStateProps, getClassEntry} = require('../../importPath');
const importPathFunctions = require('../../importPath');

export default class App extends React.Component {
  constructor() {

    super();
    this.state = {
      openTabs: {},
      previousPaths: [],
      openedProjectPath: '',
      openMenuId: null,
      createMenuInfo: {
        id: null,
        type: null
      },
      fileTree: null,
      watch: null,
      rootDirPath: '',
      selectedItem: {
        id: null,
        path: '',
        type: null,
        focused: false
      },
      renameFlag: false,
      fileChangeType: null,
      deletePromptOpen: false,
      newName: '',
      componentTreeObj: null,
      simulator: false,
      url: '',
    };

    this.fileTreeInit();
    this.clickHandler = this.clickHandler.bind(this);
    this.setFileTree = this.setFileTree.bind(this);
    this.dblClickHandler = this.dblClickHandler.bind(this);
    this.setActiveTab = this.setActiveTab.bind(this);
    this.isFileOpened = this.isFileOpened.bind(this);
    this.saveTab = this.saveTab.bind(this);
    this.closeTab = this.closeTab.bind(this);
    this.openCreateMenu = this.openCreateMenu.bind(this);
    this.closeOpenDialogs = this.closeOpenDialogs.bind(this);
    this.createMenuHandler = this.createMenuHandler.bind(this);
    this.createItem = this.createItem.bind(this);
    this.findParentDir = this.findParentDir.bind(this);
    this.deletePromptHandler = this.deletePromptHandler.bind(this);
    this.renameHandler = this.renameHandler.bind(this);
    this.constructComponentTreeObj = this.constructComponentTreeObj.bind(this);
    this.handleEditorValueChange = this.handleEditorValueChange.bind(this);
    this.openSim = this.openSim.bind(this);
    this.closeSim = this.closeSim.bind(this);
    this.openSimulatorInMain = this.openSimulatorInMain.bind(this);

    //reset tabs, should store state in local storage before doing this though
  }
  componentDidMount() {

    ipcRenderer.on('openDir', (event, projPath) => {
      if (this.state.openedProjectPath !== projPath) {
        this.setState({ openTabs: {}, openedProjectPath: projPath });
      }
    });
    ipcRenderer.on('saveFile', (event, arg) => {
      if (this.state.previousPaths[this.state.previousPaths.length - 1] !== null) {
        this.saveTab();
      }
    });
    ipcRenderer.on('delete', (event, arg) => {
      if (this.state.selectedItem.id) {
        this.setState({
          deletePromptOpen: true,
          fileChangeType: 'delete'
        });
      }
    });
    ipcRenderer.on('enter', (event, arg) => {
      if (this.state.selectedItem.focused) {
        //rename property just true or false i guess
        this.setState({
          renameFlag: true
        });
      }
    });
    ipcRenderer.on('start simulator', (event, arg) => {
      this.setState({url: arg});
    })
  }


  constructComponentTreeObj() {
    const projInfo = JSON.parse(fs.readFileSync(path.join(__dirname, '../lib/projInfo.js')));
    console.log('PROJINFO')
    console.log(projInfo)
    if(projInfo.reactEntry !== ''){
      let rootPath = path.dirname(projInfo.reactEntry);
      let fileName = path.basename(projInfo.reactEntry);
      console.log(fileName, 'FILENAME');
      console.log(rootPath, 'ROOTPATH');
      const componentObj = importPathFunctions.constructComponentTree(fileName, rootPath);
      this.setState({
        componentTreeObj: componentObj
      });
    } else if (projInfo.CRA === true) {
        let rootPath = path.join(projInfo.rootPath, 'src');
        console.log('THIS IS THE ROOT PATH')
        console.log(rootPath);
        const componentObj = importPathFunctions.constructComponentTree('App.js', rootPath);
        this.setState({
          componentTreeObj: componentObj
        });
    } else {
      this.setState({
        componentTreeObj: {}
      });
    }
  }
  
  //registers listeners for opening projects and new projects
  fileTreeInit(){
    ipcRenderer.on('openDir', (event, dirPath) => {
      if (dirPath !== this.state.rootDirPath) {
        console.log('Setting File Tree');
        this.setFileTree(dirPath);
    }
  }),
    ipcRenderer.on('newProject', (event, arg) => {
      if (this.state.watch) this.state.watch.close();
      this.setState({
        fileTree: null,
        watch: null,
        rootDirPath: '',
        selectedItem: {
          id: null,
          path: null,
          type: null
        }
      });
    });
  }
  //sends old path and new name to main process to rename, closes rename form and sets filechangetype and newName for fswatch
  renameHandler(event) {
    if (event.key === 'Enter' && event.target.value) {
      ipcRenderer.send('rename', this.state.selectedItem.path, event.target.value);
      this.setState({
        renameFlag: false,
        fileChangeType: 'rename',
        newName: event.target.value
      });
    } else if (event.key === 'Enter' && !event.target.value) {
      this.setState({
        renameFlag: false
      });
    }
  }
  //handles click event from delete prompt
  deletePromptHandler(answer) {
    if (answer) {
      ipcRenderer.send('delete', this.state.selectedItem.path);
    } else {
      this.setState({
        fileChangeType: null
      });
    }

    this.setState({
      deletePromptOpen: false
    });
  }
  //handles click events for directories and files in file tree render
  clickHandler(id, filePath, type, event) {
    const temp = this.state.fileTree;

    document.body.onkeydown = event => {
      if (event.key === 'Enter') {
        this.setState({
          renameFlag: true
        });
        document.body.onkeydown = () => { };
      }
    };
    if (type === 'directory') {
      function toggleClicked(dir) {
        if (dir.path === filePath) {
          dir.opened = !dir.opened;
          return;
        } else {
          for (var i = 0; i < dir.subdirectories.length; i++) {
            toggleClicked(dir.subdirectories[i]);
          }
        }
      }

      toggleClicked(temp);
    }
    //so opened menu doesn't immediately close
    if (this.state.openMenuId === null) event.stopPropagation();

    this.setState({
      selectedItem: {
        id,
        path: filePath,
        type: type,
        focused: true
      },
      fileTree: temp,
      renameFlag: false,
      createMenuInfo: {
        id: null,
        type: null
      }
    });
  }

  //calls file tree module and sets state with file tree object representation in callback
  setFileTree(dirPath) {
    getTree(dirPath, fileTree => {
      //if watcher instance already exists close it as it's for the previously opened project
      if (this.state.watch) {
        this.state.watch.close();
      }
      console.log('THIS IS THE DIRPATH TO WATCH', dirPath);
      let watch = fs.watch(dirPath, { recursive: true }, (eventType, fileName) => {
        console.log('STATEINWATCH', this.state);
        console.log('Eventtype:', eventType);
        if (eventType === 'rename') {
          const fileTree = this.state.fileTree;
          const absPath = path.join(this.state.rootDirPath, fileName);
          const parentDir = this.findParentDir(path.dirname(absPath), fileTree);
          const name = path.basename(absPath);
          const openTabs = this.state.openTabs;
          //delete handler
          if (this.state.fileChangeType === 'delete') {
            let index;
            if (this.state.selectedItem.type === 'directory') {
              index = this.findItemIndex(parentDir.subdirectories, name);
              parentDir.subdirectories.splice(index, 1);
            } else {
              index = this.findItemIndex(parentDir.files, name);
              parentDir.files.splice(index, 1);
            }
            for (var i = 0; i < this.state.openTabs.length; i++) {
              if (openTabs[i].name === name) {
                openTabs.splice(i, 1);
                break;
              }
            }
          } else if (this.state.fileChangeType === 'new') {
            //new handler
            console.log('WITHIN NEW');
            if (this.state.createMenuInfo.type === 'directory') {
              parentDir.subdirectories.push(new Directory(absPath, name));
            } else {
              parentDir.files.push(new File(absPath, name));
            }
          } else if (this.state.fileChangeType === 'rename' && this.state.newName) {
            //rename handler
            //fileName has new name, selectedItem has old name and path
            let index;
            if (this.state.selectedItem.type === 'directory') {
              index = this.findItemIndex(parentDir.subdirectories, name);
              parentDir.subdirectories[index].name = this.state.newName;
              parentDir.subdirectories[index].path = path.join(path.dirname(absPath), this.state.newName);
            } else {
              index = this.findItemIndex(parentDir.files, name);
              parentDir.files[index].name = this.state.newName;
              parentDir.files[index].path = path.join(path.dirname(absPath), this.state.newName);
            }

            //renames path of selected renamed file so it has the right info
            this.setState({
              selectedItem: {
                id: this.state.selectedItem.id,
                type: this.state.selectedItem.type,
                path: path.join(path.dirname(absPath), this.state.newName)
              }
            });
            //rename the opened tab of the renamed file if it's there
            for (var i = 0; i < this.state.openTabs.length; i++) {
              if (openTabs[i].name === name) {
                openTabs[i].name = this.state.newName;
                break;
              }
            }
          }
          console.log('about to setState', fileTree)
          this.setState({
            fileTree,
            fileChangeType: null,
            newName: '',
            createMenuInfo: {
              id: null,
              type: null
            },
            openTabs
          });
          console.log('AFTER SET STATE TO NULL', this.state);
        }
      });

      this.setState({
        fileTree,
        rootDirPath: dirPath,
        watch
      });
      this.constructComponentTreeObj();
    });
  }
  //returns index of file/dir in files or subdirectories array
  findItemIndex(filesOrDirs, name) {
    for (var i = 0; i < filesOrDirs.length; i++) {
      if (filesOrDirs[i].name === name) {
        return i;
      }
    }
    return -1;
  }

  //returns parent directory object of file/directory in question
  findParentDir(dirPath, directory = this.state.fileTree) {
    console.log('IN FINDPARENTDIR',dirPath, directory)
    if (directory && directory.path === dirPath) return directory;
    else {
      let dirNode;
      for (var i in directory.subdirectories) {
        dirNode = this.findParentDir(dirPath, directory.subdirectories[i]);
        if (dirNode) return dirNode;
      }
    }
  }

  //click handler for plus button on directories, 'opens' new file/dir menu by setting openMenuID state
  openCreateMenu(id, itemPath, type, event) {
    console.log(id, itemPath, type, event);
    event.stopPropagation();
    this.setState({
      openMenuId: id,
      selectedItem: {
        id: id,
        path: itemPath,
        type
      }
    });
  }

  //handler for create menu
  createMenuHandler(id, type, event) {
    //unhook keypress listeners
    document.body.onkeydown = () => { };

    event.stopPropagation();

    this.setState({
      createMenuInfo: {
        id,
        type
      },
      openMenuId: null
    });
  }

  //sends input name to main, where the file/directory is actually created.
  //creation of new file/directory will trigger watch handler
  createItem(event) {
    if (event.key === 'Enter') {
      //send path and file type to main process to actually create file/dir only if there is value
      if (event.target.value)
        ipcRenderer.send(
          'createItem',
          this.state.selectedItem.path,
          event.target.value,
          this.state.createMenuInfo.type
        );

      //set type of file change so watch handler knows which type
      this.setState({
        fileChangeType: 'new'
      });
    }
  }

  //tab close handler
  closeTab(path, event) {
    const copyOpenTabs = Object.assign({}, this.state.openTabs);
    const history = this.state.previousPaths.slice().filter((elem) => {
      return elem !== path;
    });
    for (let key in copyOpenTabs) {
      if (key === path) {
        delete copyOpenTabs[key];
        break;
      }
    }
    event.stopPropagation();
    this.setState({ openTabs: copyOpenTabs, previousPaths: history });
  }

  //save handler
  saveTab() {
    fs.writeFileSync(this.state.previousPaths[this.state.previousPaths.length - 1], this.state.openTabs[this.state.previousPaths[this.state.previousPaths.length - 1]].editorValue, { encoding: 'utf8' });
  }
  // //sets active tab
  setActiveTab(path) {
    let copyPreviousPaths = this.updateHistory(path);
    this.setState({ previousPaths: copyPreviousPaths })
  }
  updateHistory(path) {
    let copyPreviousPaths = this.state.previousPaths;
    copyPreviousPaths.push(path);
    return copyPreviousPaths;
  }

  //double click handler for files
  dblClickHandler(file) {
    const history = this.updateHistory(file.path);

    if (!(Object.keys(this.state.openTabs).includes(file.path))) {
      const openTabs = Object.assign({}, this.state.openTabs);
      openTabs[file.path] = {
        path: file.path,
        name: file.name,
        modified: false,
        editorValue: ''
      };
      this.setState({ openTabs: openTabs, previousPaths: history });
    } else {
      this.setState({ previousPaths: history })
    }
  }

  //checks if project is already open
  isFileOpened(file) {
    for (var i = 0; i < this.state.openTabs.length; i++) {
      if (this.state.openTabs[i].path === file.path) {
        return this.state.openTabs[i].id;
      }
    }
    return -1;
  }

  //simulator click handler
  openSim() {
    //this.setState({simulator: true});
    ipcRenderer.send('openSimulator', 'helloworld');
  }

  openSimulatorInMain() {
    console.log('SENDING ACTION TO RENDERER')
    ipcRenderer.send('start simulator', 'helloworld');
    this.setState({simulator: true})
  }

  //closes any open dialogs, handles clicks on anywhere besides the active open menu/form
  closeOpenDialogs() {
    const selectedItem = this.state.selectedItem;
    selectedItem.focused = false;

    document.body.onkeydown = () => { };
    this.setState({
      openMenuId: null,
      createMenuInfo: {
        id: null,
        type: null
      },
      selectedItem,
      renameFlag: false
    });
  }

  // for streatch feature
  // handleOpenFile(path) {
  //   this.setState({ currentFile: path });
  // }
  //Change state whenever something is typed,
  handleEditorValueChange(value) {
    const copyOpenTabs = Object.assign({}, this.state.openTabs)
    const copyTabObject = Object.assign({}, this.state.openTabs[this.state.previousPaths[this.state.previousPaths.length - 1]]);
    copyTabObject.editorValue = value;
    copyOpenTabs[this.state.previousPaths[this.state.previousPaths.length - 1]] = copyTabObject;
    this.setState({ openTabs: copyOpenTabs }, () => this.saveTab());
  }
  closeSim() {
    console.log('Closing sim');
    this.setState({simulator: false});
  }
  render() {
    let mainScreen;
    this.state.simulator ? mainScreen =  <InWindowSimulator url={this.state.url} />: 
      mainScreen = <TextEditorPane
                    appState={this.state}
                    setActiveTab={this.setActiveTab}
                    addEditorInstance={this.addEditorInstance}
                    closeTab={this.closeTab}
                    openMenuId={this.state.openMenuId}
                    onOpenFile={this.handleOpenFile}
                    onEditorValueChange={this.handleEditorValueChange}
                    />
    return (
      <ride-workspace className="scrollbars-visible-always" onClick={this.closeOpenDialogs}>
        <ride-panel-container className="header" />
        <ride-pane-container>
          <ride-pane-axis className="horizontal">
            <ride-pane style={{ flexGrow: 0, flexBasis: '300px' }}>
              <FileTree
                dblClickHandler={this.dblClickHandler}
                openCreateMenu={this.openCreateMenu}
                openMenuId={this.state.openMenuId}
                createMenuInfo={this.state.createMenuInfo}
                createMenuHandler={this.createMenuHandler}
                createItem={this.createItem}
                fileTree={this.state.fileTree}
                selectedItem={this.state.selectedItem}
                clickHandler={this.clickHandler}
                renameFlag={this.state.renameFlag}
                renameHandler={this.renameHandler}
              />
              {this.state.deletePromptOpen
                ? <DeletePrompt
                  deletePromptHandler={this.deletePromptHandler}
                  name={path.basename(this.state.selectedItem.path)}
                />
                : <span />}
              <MockComponentTree componentTreeObj = {this.state.componentTreeObj} />
            </ride-pane>
            {/* <ride-pane-resize-handle class="horizontal" /> */}
            
            <ride-pane-resize-handle className="horizontal" />
            <ride-pane style={{ flexGrow: 0, flexBasis: '900px' }}>
              {this.state.simulator
                  ? <InWindowSimulator url = {this.state.url} closeSim = {this.closeSim}/>
                  : <TextEditorPane
                  appState={this.state}
                  setActiveTab={this.setActiveTab}
                  addEditorInstance={this.addEditorInstance}
                  closeTab={this.closeTab}
                  openMenuId={this.state.openMenuId}
                  onOpenFile={this.handleOpenFile}
                  onEditorValueChange={this.handleEditorValueChange}
                />}
              {this.state.simulator ?
            <button className="btn" onClick={this.closeSim}>
                  Close Simulator
              </button>: <button className="btn" onClick={this.openSimulatorInMain}>
                  Simulator
              </button>}
              <button className="btn" onClick={this.openSim}>
                  Simulator in new window
              </button>
              {this.state.simulator
              ? <TextEditorPane
              appState={this.state}
              setActiveTab={this.setActiveTab}
              addEditorInstance={this.addEditorInstance}
              closeTab={this.closeTab}
              openMenuId={this.state.openMenuId}
              onOpenFile={this.handleOpenFile}
              onEditorValueChange={this.handleEditorValueChange}
            />: <XTerm rootdir = {this.state.rootDirPath}></XTerm>}
            <ride-pane-resize-handle class="horizontal" />
            </ride-pane>
          </ride-pane-axis>
        </ride-pane-container>

      </ride-workspace>
    );
  }
}
