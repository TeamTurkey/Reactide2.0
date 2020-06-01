const fs = require('fs');
const path = require('path');
const { runExec } = require("../../nodeTerminal");

module.exports = (dest) => {
  //TODOS------------------>
  //1. Somehow, kill node processes when simulator exits
  //2. Update current directory, when folder is loaded in
  //3. Add spinner for build (STRETCH)

  //cwd is the destinations parent folder
  //Command is the terminal script for creating a create-react-app in the dest folder
  //const win = new BrowserWindow({ show: false} );
  const cwd = process.cwd();
  const shell = process.platform === "win32" ? "powershell.exe" : "bash";
  const command = shell + " npx create-react-app " + dest;
  runExec(
    cwd,
    command,
    data => {
      global.mainWindow.webContents.send("craOut", data);
    },
    () => {
      fs.writeFileSync(
        path.resolve(dest, ".env"),
        "SKIP_PREFLIGHT_CHECK=true\nBROWSER=none",
        { encoding: "utf8" },
        err => {
          if (err) console.log(err);
        }
      );
      global.mainWindow.webContents.send('openProject', dest);
    }
  );
};
