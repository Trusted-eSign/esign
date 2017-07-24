import * as React from "react";
import { encrypt, EncryptApp } from "../module/encrypt_app";
import { lang, SETTINGS_JSON } from "../module/global_app";
import { sign, SignApp } from "../module/sign_app";
import * as native from "../native";
import SideMenu from "./SideMenu";

interface IMainToolBarProps {
  title: string;
}

class MenuBar extends React.Component<IMainToolBarProps, any> {
  constructor(props: IMainToolBarProps) {
    super(props);
  }
  componentDidMount() {
    $(".lang").dropdown({
      inDuration: 300,
      outDuration: 225,
      constrain_width: false,
      gutter: 30,
      belowOrigin: false,
      alignment: "right",
    },
    );
  }
  minimizeWindow() {
    mainWindow.minimize();
  }
  closeWindow() {
    const sign_to_json = ({ settings_for_sign: sign.get_settings, certificate_for_sign: sign.get_sign_certificate });
    const encrypt_to_json = ({ settings_for_encrypt: encrypt.get_settings, certificates_for_encrypt: encrypt.get_certificates_for_encrypt });
    const main_json = ({ lang: lang.get_lang });
    const system = ({ SIGN: sign_to_json, ENCRYPT: encrypt_to_json, MAIN: main_json });
    const ssystem = JSON.stringify(system, null, 4);
    native.fs.writeFile(SETTINGS_JSON, ssystem, (err: any) => {
      if (err) {
        console.log(lang.get_resource.Settings.write_file_failed);
      }
      console.log(lang.get_resource.Settings.write_file_ok);
      mainWindow.close();
    });
  }
  maximazeWindow() {
    // if (mainWindow.isMaximized)
    //     mainWindow.unmaximize();
    // else
    //     mainWindow.maximize();
  }

  langChange() {
    lang.get_lang === "RU" ? lang.set_lang = "EN" : lang.set_lang = "RU";
  }

  render() {
    return <nav className="app-bar">
      <div className="col s6 m6 l6 app-bar-wrapper">
        <ul className="app-bar-items">
          <li>
            <a data-activates="slide-out" className="menu-btn waves-effect waves-light">
              <i className="material-icons">menu</i>
            </a>
          </li>
          <li className="app-bar-text">{this.props.title}</li>
          <li>
            <ul>
              <li>
                <div className="lang" style={{ visibility: "hidden" }}>
                  <a className={lang.get_lang} onClick={this.langChange.bind(this)} />
                </div>
              </li>
              <li>
                <a className="minimize-window-btn waves-effect waves-light" onClick={this.minimizeWindow.bind(this)}>
                  <i className="material-icons">remove</i>
                </a>
              </li>
              <li>
                <a className="close-window-btn waves-effect waves-light" onClick={this.closeWindow.bind(this)}>
                  <i className="material-icons">close</i>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <ul id="slide-out" className="side-nav">
        <SideMenu />
      </ul>
    </nav>;
  }
}

export default MenuBar;
