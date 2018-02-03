const electron = require('electron');
const {app, BrowserWindow, ipcMain} = electron

let willQuitApp = false;

app.on('ready', () => {
    let win = new BrowserWindow({width: 800, height: 600});
    win.loadURL(`file://${__dirname}/index.html`);
    win.webContents.openDevTools();

    var prefsWindow = new BrowserWindow({
        width: 400,
        height:400,
        show: false
    })
    prefsWindow.loadURL(`file://` + __dirname + `/prefs.html`)
    prefsWindow.webContents.openDevTools();

    ipcMain.on('toggle-prefs', function() {
      if (prefsWindow.isVisible()) {
        prefsWindow.hide()
      } else {
        prefsWindow.show()
      }
    })
    
})

app.on('window-all-closed', () => {
    app.quit()
  })

app.on('before-quit', () => {
    mainWindow.removeAllListeners('close');
    mainWindow.close();
});

exports.openWindow = () => {
    let win = new BrowserWindow({width:400, height:200})
    win.loadURL(`file://${__dirname}/bear.html`)
}