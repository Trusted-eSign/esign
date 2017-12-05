import { app, Menu, shell, BrowserWindow } from 'electron';

var i18n = require('./menu_i18n/i18n');

export default class MenuBuilder {

  constructor(mainWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu() {
    let local = new i18n();
    
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
      this.setupDevelopmentEnvironment(local);
    }

    let template;

    if (process.platform === 'darwin') {
      template = this.buildDarwinTemplate(local);
    } else {
      template = this.buildDefaultTemplate(local);
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment(local) {
    this.mainWindow.openDevTools();
    this.mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu
        .buildFromTemplate([{
          label: local.__('Inspect element'),
          click: () => {
            this.mainWindow.inspectElement(x, y);
          }
        }])
        .popup(this.mainWindow);
    });
  }

  buildDarwinTemplate(local) {
    const subMenuAbout = {
      label: local.__("Electron"),
      submenu: [
        { label: local.__('Quit'), accelerator: 'Command+Q', click: () => { app.quit(); } }
      ]
    };
    const subMenuWindow = {
      label: local.__('Window'),
      submenu: [
        { label: local.__('Minimize'), accelerator: 'Command+M', selector: 'performMiniaturize:' },
        { label: local.__('Close'), accelerator: 'Command+W', click: () => { app.quit(); }},
        { type: 'separator' },
        { label: local.__('Bring All to Front'), selector: 'arrangeInFront:' }
      ]
    };
    const subMenuHelp = {
      label: local.__('Help'),
      submenu: [
        { label: local.__('Learn More'), click() { shell.openExternal('https://github.com/TrustedPlus'); } },
        { label: local.__('Documentation'), click() { shell.openExternal('https://github.com/TrustedPlus'); } },
        { label: local.__('Community Discussions'), click() { shell.openExternal('https://github.com/TrustedPlus'); } },
        { label: local.__('Search Issues'), click() { shell.openExternal('https://github.com/TrustedPlus'); } }
      ]
    };

    return [
      subMenuAbout,
      subMenuWindow,
      subMenuHelp
    ];
  }

  buildDefaultTemplate(local) {
    const templateDefault = [{
      label: local.__('&File'),
      submenu: [{
        label: local.__('&Open'),
        accelerator: 'Ctrl+O'
      }, {
        label: local.__('&Close'),
        accelerator: 'Ctrl+W',
        click: () => {
          this.mainWindow.close();
          app.quit(); 
        }
      }]
    }, {
      label: local.__('Help'),
      submenu: [{
        label: local.__('Learn More'),
        click() {
          shell.openExternal('https://github.com/TrustedPlus');
        }
      }, {
        label: local.__('Documentation'),
        click() {
          shell.openExternal('https://github.com/TrustedPlus');
        }
      }, {
        label: local.__('Community Discussions'),
        click() {
          shell.openExternal('https://github.com/TrustedPlus');
        }
      }, {
        label: local.__('Search Issues'),
        click() {
          shell.openExternal('https://github.com/TrustedPlus');
        }
      }]
    }];

    return templateDefault;
  }
}
