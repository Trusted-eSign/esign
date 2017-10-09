import * as React from "react";
import { SETTINGS_JSON } from "../module/global_app";
import { sign } from "../module/sign_app";
import * as native from "../native";
import LocaleSelect from "./LocaleSelect";
import SideMenu from "./SideMenu";

const remote = window.electron.remote;
if (remote.getGlobal("sharedObject").logcrypto) {
  window.logger = trusted.utils.Logger.start(native.path.join(native.os.homedir(), ".Trusted", "trusted-crypto.log"));
}

class MenuBar extends React.Component<any, any> {
  static contextTypes = {
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

  constructor(props: any) {
    super(props);
  }

  minimizeWindow() {
    mainWindow.minimize();
  }

  closeWindow() {
    const { localize, locale } = this.context;

    const sign_to_json = ({});
    const encrypt_to_json = ({ settings_for_encrypt: [], certificates_for_encrypt: [] });
    const main_json = ({ lang: locale });
    const system = ({ SIGN: sign_to_json, ENCRYPT: encrypt_to_json, MAIN: main_json });
    const ssystem = JSON.stringify(system, null, 4);
    native.fs.writeFile(SETTINGS_JSON, ssystem, (err: any) => {
      if (err) {
        console.log(localize("Settings.write_file_failed", locale));
      }
      console.log(localize("Settings.write_file_ok", locale));
      mainWindow.close();
    });
  }

  getTitle() {
    const { localize, locale } = this.context;
    const pathname = this.props.location.pathname;
    let title: string;
    if (pathname === "/sign")
      title = localize("Sign.sign_and_verify", locale);
    else if (pathname === "/encrypt")
      title = localize("Encrypt.encrypt_and_decrypt", locale);
    else if (pathname === "/certificate")
      title = localize("Certificate.certs", locale);
    else if (pathname === "/about")
      title = localize("About.about", locale);
    else if (pathname === "/license")
      title = localize("License.license", locale);
    else if (pathname === "/help")
      title = localize("Help.help", locale);
    else
      title = localize("About.product_NAME", locale);

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
                    <LocaleSelect />
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
