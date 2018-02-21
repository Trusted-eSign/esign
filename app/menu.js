import { app, Menu, shell, BrowserWindow } from 'electron';

export default class MenuBuilder {

  constructor(mainWindow) {
    this.Map = {};
    this.mainWindow = mainWindow;
  }


  buildMenu() {
    var RuMap = { 
      Sign: "Подписать", 
      Encrypt: "Зашифровать",
      Certificate: "Сертификаты",
      About: "О программе",
      License: "Лицензия",
      Reference: "Справка",
      Electron: "КриптоАРМ ГОСТ",
      Quit: "Выход",
      View: "Вид",
      Reload: "Перезагрузка",
      ToggleFullScreen: "Полный экран",
      ToggleDeveloperTools: "Инструменты разработчика",
      Window: "Окно",
      Minimize: "Свернуть",
      Close: "Закрыть",
      BringAllToFront: "Bring All to Front",
      Help: "Помощь",
      LearnMore: "Узнать больше",
      Documentation: "Документация",
      CommunityDiscussions: "Сообщество",
      SearchIssues: "Задать вопрос",
      File: "Файл",
      Open: "Открыть"
    };

    var EnMap = { 
      Sign: "Sign", 
      Encrypt: "Encrypt",
      Certificate: "Certificate",
      About: "About",
      License: "License",
      Reference: "Reference",
      Electron: "CryptoARMGOST",
      Quit: "Quit",
      View: "View",
      Reload: "Reload",
      ToggleFullScreen: "Toggle Full Screen",
      ToggleDeveloperTools: "Toggle Developer Tools",
      Window: "Window",
      Minimize: "Minimize",
      Close: "Close",
      BringAllToFront: "Bring All to Front",
      Help: "Help",
      LearnMore: "Learn More",
      Documentation: "Documentation",
      CommunityDiscussions: "Community Discussions",
      SearchIssues: "Search Issues",
      File: "File",
      Open: "Open"
    };

    if (app.getLocale() == "ru"){
      this.Map = RuMap;
    } else{
      this.Map = EnMap;
    }

    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
      this.setupDevelopmentEnvironment();
    }

    let template;

    if (process.platform === 'darwin') {
      template = this.buildDarwinTemplate();
    } else {
      template = this.buildDefaultTemplate();
    }
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment() {
    this.mainWindow.openDevTools();
    this.mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu
        .buildFromTemplate([{
          label: 'Inspect element',
          click: () => {
            this.mainWindow.inspectElement(x, y);
          }
        }])
        .popup(this.mainWindow);
    });
  }

  buildDarwinTemplate() {
    const subMenuAbout = {
      label: this.Map.Electron,
      submenu: [
        /*{ label: this.Map.Sign},
        { label: this.Map.Encrypt},
        { label: this.Map.Certificate},
        { label: this.Map.About},
        { label: this.Map.License},
        { label: this.Map.Reference},*/
        { label: this.Map.Quit, accelerator: 'Command+Q', click: () => { app.quit(); } }
      ]
    };
    const subMenuViewDev = {
      label: this.Map.View,
      submenu: [
        { label: this.Map.Reload, accelerator: 'Command+R', click: () => { this.mainWindow.webContents.reload(); } },
        { label: this.Map.ToggleFullScreen, accelerator: 'Ctrl+Command+F', click: () => { this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen()); } },
        { label: this.Map.ToggleDeveloperTools, accelerator: 'Alt+Command+I', click: () => { this.mainWindow.toggleDevTools(); } }
      ]
    };
    const subMenuViewProd = {
      label: this.Map.View,
      submenu: [
        { label: this.Map.ToggleFullScreen, accelerator: 'Ctrl+Command+F', click: () => { this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen()); } }
      ]
    };
    const subMenuWindow = {
      label: this.Map.Window,
      submenu: [
        { label: this.Map.Minimize, accelerator: 'Command+M', selector: 'performMiniaturize:' },
        { label: this.Map.Close, accelerator: 'Command+W', click: () => { app.quit(); } },
        { type: 'separator' },
        { label: this.Map.BringAllToFront, selector: 'arrangeInFront:' }
      ]
    };
    const subMenuHelp = {
      label: this.Map.Help,
      submenu: [
        { label: this.Map.LearnMore, click() { shell.openExternal('https://github.com/TrustedPlus/esign'); } },
        { label: this.Map.Documentation, click() { shell.openExternal('https://github.com/TrustedPlus/esign'); } },
        { label: this.Map.CommunityDiscussions, click() { shell.openExternal('https://github.com/TrustedPlus/esign'); } },
        { label: this.Map.SearchIssues, click() { shell.openExternal('https://github.com/TrustedPlus/esign'); } }
      ]
    };

    const subMenuView = process.env.NODE_ENV === 'development'
      ? subMenuViewDev
      : subMenuViewProd;

    return [
      subMenuAbout,
      subMenuView,
      subMenuWindow,
      subMenuHelp
    ];
  }

  buildDefaultTemplate() {
    const templateDefault = [{
      label: this.Map.File,
      submenu: [{
        label: this.Map.Open,
        accelerator: 'Ctrl+O'
      }, {
        label: this.Map.Close,
        accelerator: 'Ctrl+W',
        click: () => {
          this.mainWindow.close();
        }
      }]
    }, {
      label: this.Map.View,
      submenu: (process.env.NODE_ENV === 'development') ? [{
        label: this.Map.Reload,
        accelerator: 'Ctrl+R',
        click: () => {
          this.mainWindow.webContents.reload();
        }
      }, {
        label: this.Map.ToggleFullScreen,
        accelerator: 'F11',
        click: () => {
          this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
        }
      }, {
        label: this.Map.ToggleDevelopeTools,
        accelerator: 'Alt+Ctrl+I',
        click: () => {
          this.mainWindow.toggleDevTools();
        }
      }] : [{
        label: this.Map.ToggleFullScreen,
        accelerator: 'F11',
        click: () => {
          this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
        }
      }]
    }, {
      label: this.Map.Help,
      submenu: [{
        label: this.Map.LearnMore,
        click() {
          shell.openExternal('https://github.com/TrustedPlus/esign');
        }
      }, {
        label: this.Map.Documentation,
        click() {
          shell.openExternal('https://github.com/TrustedPlus/esign');
        }
      }, {
        label: this.Map.CommunityDiscussions,
        click() {
          shell.openExternal('https://github.com/TrustedPlus/esign');
        }
      }, {
        label: this.Map.SearchIssues,
        click() {
          shell.openExternal('https://github.com/TrustedPlus/esign');
        }
      }]
    }];

    return templateDefault;
  }
}
