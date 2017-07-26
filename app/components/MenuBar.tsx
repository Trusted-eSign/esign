import * as React from "react";
import { encrypt, EncryptApp } from "../module/encrypt_app";
import { lang, SETTINGS_JSON } from "../module/global_app";
import { sign, SignApp } from "../module/sign_app";
import * as native from "../native";
import SideMenu from "./SideMenu";

class MenuBar extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
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

  langChange() {
    lang.get_lang === "RU" ? lang.set_lang = "EN" : lang.set_lang = "RU";
  }

  getTitle() {
    const pathname = this.props.location.pathname;
    let title: string;
    if (pathname === "/sign")
      title = lang.get_resource.Sign.sign_and_verify;
    else if (pathname === "/encrypt")
      title = lang.get_resource.Encrypt.encrypt_and_decrypt;
    else if (pathname === "/certificate")
      title = lang.get_resource.Certificate.certs;
    else if (pathname === "/about")
      title = lang.get_resource.About.about;
    else if (pathname === "/license")
      title = lang.get_resource.License.license;
    else if (pathname === "/help")
      title = lang.get_resource.Help.help;
    else
      title = lang.get_resource.About.product_NAME;

    return title;
  }

  componentDidMount() {
    $(".menu-btn").sideNav({
      closeOnClick: true,
    });
  }

  render() {
    return (
      <div className="main">
        <nav className="app-bar">
          <div className="col s6 m6 l6 app-bar-wrapper">
            <ul className="app-bar-items">
              <li>
                <a data-activates="slide-out" className="menu-btn waves-effect waves-light">
                  <i className="material-icons">menu</i>
                </a>
              </li>
              <li className="app-bar-text">{this.getTitle()}</li>
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
        </nav>
        {this.props.children}
      </div>
    );
  }
}

export default MenuBar;
