import { app, BrowserWindow, Tray, Menu } from 'electron';
import MenuBuilder from './menu';

let mainWindow = null;
let preloader = null;
global.globalObj = {
  id: 123,
  launch: null,
  closeFunc: function () {
    if (this.launch == true) {
      if (mainWindow) mainWindow.hide();
    } else {
      mainWindow = null;
      if (process.platform === 'darwin') {
        app.quit();
      }
    }
  }
};


if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

var options = process.argv;

if (options.indexOf('logcrypto') !== -1) {
  global.sharedObject = { logcrypto: true };
} else {
  global.sharedObject = { logcrypto: false };
}

global.sharedObject.isQuiting = false;


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

  app.commandLine.appendSwitch('ignore-certificate-errors');

  mainWindow = new BrowserWindow({
    alwaysOnTop: false,
    width: 800, height: 600,
    resizable: false,
    frame: false,
    toolbar: false,
    show: false,
    // This handles disabling web security
    webPreferences: {
      webSecurity: false
    }
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

  var platform = require('os').platform();
  var trayIcon;
  if (platform == 'win32') {
    trayIcon = new Tray(__dirname + '/resources/image/tray.ico');
  } else if (platform == 'darwin'){
    trayIcon = new Tray(__dirname + '/resources/image/tray_mac.png');
  }else{
    trayIcon = new Tray(__dirname + '/resources/image/tray.png');
  }

  const trayMenuTemplate = [
    {
      label: 'Open Application',
      click: function () { mainWindow.show(); }
    },
    {
      label: 'Close',
      click: function () {
        global.sharedObject.isQuiting = true;
        app.quit();
      }
    }
  ];
  var trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
  trayIcon.setContextMenu(trayMenu);


  var startMinimized = (process.argv || []).indexOf('--service') !== -1;

  startMinimized = false; //Временно

  if (startMinimized == true) {
    //console.log('App is started by AutoLaunch');
    globalObj.launch = true;
    if (mainWindow) mainWindow.hide();
  } else {
    globalObj.launch = false;
    //console.log('App is started by User');
  }

  preloader.webContents.on("did-finish-load", () => {
    preloader.show();
    preloader.focus();
  });

  preloader.on("close", function () {
    preloader = null;
  });

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    preloader.close();
    if (!startMinimized) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('close', function (event) {
    if (!global.sharedObject.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }

    return false;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
});


