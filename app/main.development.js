import { app, BrowserWindow } from 'electron';
import MenuBuilder from './menu';

let mainWindow = null;
let preloader = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

var options = process.argv;

if (options.indexOf('logcrypto') !== -1) {
  global.sharedObject = {logcrypto: true};
} else {
  global.sharedObject = {logcrypto: false};
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')();
  const path = require('path');
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = [
    'REACT_DEVELOPER_TOOLS',
    'REDUX_DEVTOOLS'
  ];

  return Promise
    .all(extensions.map(name => installer.default(installer[name], forceDownload)))
    .catch(console.log);
};


app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


app.on('ready', async () => {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    width: 800, height: 600,
    resizable: false,
    frame: false,
    toolbar: false,
    show: false
  });

  preloader = new BrowserWindow({
    alwaysOnTop: true,
    width: 496, height: 149,
    resizable: false,
    frame: false,
    toolbar: false,
    show: false
  });

  mainWindow.loadURL(`file://${__dirname}/resources/index.html`);
  preloader.loadURL(`file://${__dirname}/resources/preloader_index.html`);

  if (options.indexOf("devtools") !== -1) {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  }

  preloader.webContents.on("did-finish-load", () => {
    preloader.show();
    preloader.focus();
  });

  preloader.on("close", () => {
    preloader = null;
  });

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    preloader.close();
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
});
