const electron = require('electron'); // eslint-disable-line

// Module to control application life.
const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
} = electron;

const isDev = !app.isPackaged;
if (isDev) {
  require('electron-debug')(); // eslint-disable-line
}

// Additional Tooling.
const path = require('path');
const url = require('url');

// Our libraries.
const PrepImage = require('./src/prepImage.js');
const I2P = require('./src/image2pattern.js');

// Get rid of the deprecated default.
app.allowRendererProcessReuse = true;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  const display = electron.screen.getPrimaryDisplay();
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: display.workArea.width,
    height: display.workArea.height,
    webPreferences: {
      devTools: isDev,
      nodeIntegration: false, // Disable nodeIntegration for security.
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      contextIsolation: true, // Protect against prototype pollution.
      enableRemoteModule: false, // Turn off remote to avoid temptation.
      preload: path.join(app.getAppPath(), 'src/preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
  }));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Extra security filters.
// See also: https://github.com/reZach/secure-electron-template
app.on('web-contents-created', (event, contents) => {
  // Block navigation.
  // https://electronjs.org/docs/tutorial/security#12-disable-or-limit-navigation
  contents.on('will-navigate', (navevent) => {
    navevent.preventDefault();
  });
  contents.on('will-redirect', (navevent) => {
    navevent.preventDefault();
  });

  // https://electronjs.org/docs/tutorial/security#11-verify-webview-options-before-creation
  contents.on('will-attach-webview', (webevent, webPreferences) => {
    // Strip away preload scripts.
    delete webPreferences.preload; // eslint-disable-line
    delete webPreferences.preloadURL; // eslint-disable-line

    // Disable Node.js integration.
    webPreferences.nodeIntegration = false; // eslint-disable-line
  });

  // Block new windows from within the App
  // https://electronjs.org/docs/tutorial/security#13-disable-or-limit-creation-of-new-windows
  contents.on('new-window', async (newevent) => {
    newevent.preventDefault();
  });
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * IPC Message Handlers
 */
ipcMain.on('PrepImage', (event, args) => {
  PrepImage.prepImage(args.file, args.settings, (filePath) => {
    mainWindow.webContents.send('PrepImageResponse', {
      message: 'Image prepared for use',
      file: filePath,
    });
    return true;
  });
});

ipcMain.on('I2P', (event, args) => {
  I2P.generatePattern(args.file, args.settings);
  mainWindow.webContents.send('I2PResponse', {
    message: 'Pattern generated.',
  });
  return true;
});

// Dialog handler
ipcMain.on('Dialog', (event, args) => {
  let fileNames;
  if (args.request === 'image') {
    fileNames = dialog.showOpenDialogSync(mainWindow, {
      filters: { name: 'Images', extensions: ['png', 'jpg', 'gif', 'tiff', 'jpeg'] },
    });

    if (fileNames === undefined) {
      mainWindow.webContents.send('DialogResponse', {
        message: 'No file selected',
        type: 'image',
        file: null,
      });
    } else {
      mainWindow.webContents.send('DialogResponse', {
        message: `Loading File ${fileNames[0]}`,
        type: 'image',
        file: fileNames[0],
      });
    }
  }
  if (args.request === 'outputTarget') {
    fileNames = dialog.showOpenDialogSync(mainWindow, {
      properties: ['openDirectory', 'createDirectory', 'promptToCreate'],
    });

    if (fileNames === undefined) {
      mainWindow.webContents.send('DialogResponse', {
        message: 'No directory selected',
        type: 'directory',
        file: null,
      });
    } else {
      mainWindow.webContents.send('DialogResponse', {
        message: `Target Is ${fileNames[0]}`,
        type: 'directory',
        file: fileNames[0],
      });
    }
  }
});
