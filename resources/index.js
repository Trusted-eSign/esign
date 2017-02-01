
if (process.versions.nw === undefined) {
    var electron = require('electron');
    // Module to control application life.
    var app = electron.app;
    // Module to create native browser window.
    var BrowserWindow = electron.BrowserWindow;

    // Keep a global reference of the window object, if you don't, the window will
    // be closed automatically when the JavaScript object is garbage collected.
    var mainWindow;
    var preloader;

    function createWindow() {
        // Create the browser window.
        // var arg = process.argv[1];
        // if (arg) {
        //     if (arg.substr(1, arg.length - 1) === "Trusted_eSign") {
                mainWindow = new BrowserWindow({
                    width: 800, height: 600,
                    resizable: false,
                    frame: false,
                    toolbar: false,
                    show: false
                });
                preloader = new BrowserWindow({
                    width: 496, height: 149,
                    resizable: false,
                    frame: false,
                    toolbar: false,
                    show: false
                });
                // and load the index.html of the app.

                mainWindow.loadURL(`file://${__dirname}/Trusted_eSign/index.html`);
                preloader.loadURL(`file://${__dirname}/Trusted_eSign/preloader_index.html`);
                // Open the DevTools.
                preloader.webContents.on('did-finish-load', () => {
                    preloader.show();
                });
                //mainWindow.webContents.openDevTools();
                preloader.on('close', function (event) {
                    preloader = null;
                })
                mainWindow.webContents.on('did-finish-load', () => {
                    preloader.close();
                    mainWindow.show();
                });
                mainWindow.on('close', function (event) {
                    mainWindow = null;
                })
            // }
        // } else {
        //     mainWindow = new BrowserWindow({
        //         width: 800, height: 600,
        //         resizable: false,
        //         frame: false,
        //         toolbar: false,
        //         show: false
        //     });
        //     // and load the index.html of the app.
        //     mainWindow.loadURL(`file://${__dirname}/Trusted_Plus/index.html`);
        //     // Open the DevTools.
        //     mainWindow.webContents.openDevTools();
        //     mainWindow.webContents.on('did-finish-load', () => {
        //         mainWindow.show();
        //     });
        //     // Emitted when the window is closed.
        //     mainWindow.on('close', function (event) {
        //         mainWindow = null;
        //     })
        // }

    };
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', createWindow);

    // Quit when all windows are closed.
    app.on('window-all-closed', function () {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });
    app.on('activate', function () {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow === null) {
            createWindow();
        }
    });
    var shouldQuit = app.makeSingleInstance(function (commandLine, workingDirectory) {
        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            mainWindow.focus();
        }
    });

    if (shouldQuit) {
        app.quit();
    }
} else {
    // window.gui = require("nw.gui");
    // var arg = gui.App.argv[0];
    // if (arg) {
    //     if (arg.substr(1, arg.length - 1) === "Trusted_eSign") {
            gui.Window.open("./Trusted_eSign/index.html", {
                position: 'center',
                width: 800,
                height: 600,
                frame: false,
                resizable: false,
                show: false
            }, function (win) { });
        }
//     } else {
//         gui.Window.open("./Trusted_Plus/index.html", {
//             position: 'center',
//             width: 800,
//             height: 600,
//             frame: false,
//             resizable: false,
//             show: false
//         }, function (win) {
//             win.on('loaded', function() {
//                 win.show();
//             });
//         });
//     };
// }
