"use strict";

const { ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");
const deleteItem = require("../lib/delete-directory");
const simulator = require("./simulator");
const windowSimulator = require("./windowSimulator");
const closeSim = require("./closeSim");

module.exports = () => {
  //ipcMain listeners
  ipcMain.on("openSimulator", event => {
    simulator();
  });

  // ipcMain.on('openInWindow', () => {
  //   InWindowSimulator();
  // })
  ipcMain.on("createItem", (event, dirPath, name, type) => {
    if (type === "file") {
      fs.writeFile(path.join(dirPath, name), "", err => {
        if (err) console.log(err);
      });
    } else {
      fs.mkdir(path.join(dirPath, name), err => {
        if (err) console.log(err);
      });
    }
  });

  ipcMain.on("delete", (event, itemPath) => {
    deleteItem(itemPath);
  });

  ipcMain.on("rename", (event, itemPath, newName) => {
    fs.rename(itemPath, path.join(path.dirname(itemPath), newName), err => {
      if (err) console.log(err);
    });
  });
  ipcMain.on("start simulator", () => {
    windowSimulator();
  });
  ipcMain.on("closeSim", (event, pid) => {
    closeSim(pid);
  });
  // ipcMain.on("fileTree", (event, root) => {
  //   console.log('fileTree begins');
  //   getTree(
  //     root,
  //     fileTree => {
  //       event.sender.send("fileTree-complete", fileTree);
  //     },
  //     fileOnChange => {
  //       event.sender.send("fsWatcher-event", fileOnChange);
  //     }
  //   );
  //   const proc = runShell(root, data => {
  //     event.sender.send("termOut", data);
  //   });
  //   ipcMain.on("term-stdin", data => {
  //     proc.write(data);
  //   });
  // });
  // ipcMain.on("start-cra", async (event, dest) => {
  //   cra(
  //     dest,
  //     data => {
  //       event.sender.send("craOut", data);
  //     },
  //     () => {
  //       console.log("EXIT - this shouldnt run", s);
  //       fs.writeFileSync(
  //         path.resolve(dest, ".env"),
  //         "SKIP_PREFLIGHT_CHECK=true\nBROWSER=none",
  //         { encoding: "utf8" },
  //         err => {
  //           if (err) console.log(err);
  //         }
  //       );
  //       console.log('sending newproj');
  //       event.sender.send("newProject", dest);
  //     }
  //   );
  // });
  // ipcMain.on("runShell", (event, cwd) => {
  //   const proc = runShell(cwd, data => {
  //     console.log(data);
  //     event.sender.send("termOut", data);
  //   });
  //   ipcMain.on("term-stdin", data => {
  //     proc.write(data);
  //   });
  //   //const proc = runShell(cwd, term);
  //   // ipcMain.once('unbind-runShell', (event) => {
  //   //   proc.kill();
  //   // });
  // });
};
