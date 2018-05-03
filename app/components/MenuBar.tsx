import * as fs from "fs";
import PropTypes from "prop-types";
import * as React from "react";
import { connect } from "react-redux";
import {
  LOCATION_ABOUT, LOCATION_CERTIFICATES, LOCATION_CONTAINERS, LOCATION_ENCRYPT,
  LOCATION_HELP, LOCATION_LICENSE, LOCATION_SIGN, SETTINGS_JSON, TRUSTED_CRYPTO_LOG,
} from "../constants";
import { loadingRemoteFilesSelector } from "../selectors";
import { mapToArr } from "../utils";
import Diagnostic from "./Diagnostic/Diagnostic";
import LocaleSelect from "./LocaleSelect";
import SideMenu from "./SideMenu";

// tslint:disable-next-line:no-var-requires
require("../server/socketManager");

const remote = window.electron.remote;
if (remote.getGlobal("sharedObject").logcrypto) {
  window.logger = trusted.utils.Logger.start(TRUSTED_CRYPTO_LOG);
}

class MenuBar extends React.Component<any, any> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  minimizeWindow() {
    remote.getCurrentWindow().minimize();
  }

  closeWindow() {
    const { localize, locale } = this.context;
    const { encSettings, recipients, signSettings, signer } = this.props;

    const state = ({
      recipients,
      settings: {
        encrypt: encSettings,
        locale,
        sign: signSettings,
      },
      signers: {
        signer,
      },
    });

    const sstate = JSON.stringify(state, null, 4);
    fs.writeFile(SETTINGS_JSON, sstate, (err: any) => {
      if (err) {
        console.log(localize("Settings.write_file_failed", locale));
      }
      console.log(localize("Settings.write_file_ok", locale));
      remote.getCurrentWindow().close();
    });
  }

  getTitle() {
    const { localize, locale } = this.context;
    const pathname = this.props.location.pathname;

    switch (pathname) {
      case LOCATION_ABOUT:
        return localize("About.about", locale);

      case LOCATION_CERTIFICATES:
        return localize("Certificate.certs", locale);

      case LOCATION_CONTAINERS:
        return localize("Containers.containers", locale);

      case LOCATION_ENCRYPT:
        return localize("Encrypt.encrypt_and_decrypt", locale);

      case LOCATION_HELP:
        return localize("Help.help", locale);

      case LOCATION_LICENSE:
        return localize("License.license", locale);

      case LOCATION_SIGN:
        return localize("Sign.sign_and_verify", locale);

      default:
        return localize("About.product_NAME", locale);
    }
  }

  componentDidMount() {
    $(".menu-btn").sideNav({
      closeOnClick: true,
    });
  }

  render() {
    const disabledNavigate = this.getDisabled();
    const dataActivates = disabledNavigate ? "" : "slide-out";
    const classDisabled = disabledNavigate ? "disabled" : "";

    return (
      <div>
        <nav className="app-bar">
          <div className="col s6 m6 l6 app-bar-wrapper">
            <ul className="app-bar-items">
              <li>
                <a data-activates={dataActivates} className={"menu-btn waves-effect waves-light " + classDisabled}>
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
        <Diagnostic />
      </div>
    );
  }

  getDisabled = () => {
    const { files, loadingFiles } = this.props;

    if (loadingFiles.length) {
      return true;
    }

    if (files.length) {
      for (const file of files) {
        if (file.socket) {
          return true;
        }
      }
    }

    return false;
  }
}

export default connect((state, ownProps) => {
  return {
    encSettings: state.settings.encrypt,
    files: mapToArr(state.files.entities),
    loadingFiles: loadingRemoteFilesSelector(state, { loading: true }),
    location: ownProps.location,
    recipients: mapToArr(state.recipients.entities),
    signSettings: state.settings.sign,
    signer: state.signers.signer,
  };
})(MenuBar);
