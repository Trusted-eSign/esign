import * as fs from "fs";
import PropTypes from "prop-types";
import * as React from "react";
import { connect } from "react-redux";
import { loadLicense, verifyLicense } from "../AC";
import { SETTINGS_JSON, TRUSTED_CRYPTO_LOG } from "../constants";
import * as jwt from "../trusted/jwt";
import LocaleSelect from "./LocaleSelect";
import Modal from "./Modal";
import SideMenu from "./SideMenu";

const remote = window.electron.remote;
if (remote.getGlobal("sharedObject").logcrypto) {
  window.logger = trusted.utils.Logger.start(TRUSTED_CRYPTO_LOG);
}

class MenuBar extends React.Component<any, any> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: any) {
    super(props);
    this.state = ({
      error: null,
      jwtError: false,
    });
  }

  minimizeWindow() {
    mainWindow.minimize();
  }

  closeWindow() {
    const { localize, locale } = this.context;
    const { encSettings, signSettings } = this.props;

    const state = ({
      settings: {
        encrypt: encSettings,
        locale,
        sign: signSettings,
      },
    });

    const sstate = JSON.stringify(state, null, 4);
    fs.writeFile(SETTINGS_JSON, sstate, (err: any) => {
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

  checkCPCSP = () => {
    const { localize, locale } = this.context;

    try {
      if (!trusted.utils.Csp.isGost2001CSPAvailable()) {
        $(".toast-noProvider2001").remove();
        Materialize.toast(localize("Csp.noProvider2001", locale), 5000, "toast-noProvider2001");

        this.setState({ error: localize("Csp.noProvider2001", locale) });

        return;
      }

      if (!trusted.utils.Csp.checkCPCSPLicense()) {
        $(".toast-noCPLicense").remove();
        Materialize.toast(localize("Csp.noCPLicense", locale), 5000, "toast-noCPLicense");

        this.setState({ error: localize("Csp.noCPLicense", locale) });

        return;
      }
    } catch (e) {
      $(".toast-cspErr").remove();
      Materialize.toast(localize("Csp.cspErr", locale), 2000, "toast-cspErr");

      this.setState({ error: localize("Csp.cspErr", locale) });
    }
  }

  checkTrustedCryptoLoadedErr = () => {
    const { localize, locale } = this.context;

    if (window.tcerr && window.tcerr.message) {
      if (~window.tcerr.message.indexOf("libcapi")) {
        this.setState({ error: localize("Csp.libcapi", locale) });
      } else {
        this.setState({ error: window.tcerr.message });
      }
    }
  }

  componentDidMount() {
    const { localize, locale } = this.context;
    const { jwtLicense, loadLicense, loadedLicense, loadingLicense, verifyLicense, status, verifed } = this.props;

    this.checkCPCSP();
    this.checkTrustedCryptoLoadedErr();

    if (!loadedLicense && !loadingLicense) {
      loadLicense();
    }

    $(".menu-btn").sideNav({
      closeOnClick: true,
    });
  }

  componentWillReceiveProps(nextProps) {
    const { localize, locale } = this.context;
    const { loadedLicense, loadingLicense, verifyLicense, status, verified } = this.props;

    if (loadedLicense !== nextProps.loadedLicense && !nextProps.jwtLicense) {
      $(".toast-jwtErrorLoad").remove();
      Materialize.toast(localize("License.jwtErrorLoad", locale), 5000, "toast-jwtErrorLoad");

      this.setState({ error: localize("License.jwtErrorLoad", locale) });
      this.setState({ jwtError: true });
    }

    if (!verified && !nextProps.verified && nextProps.loadedLicense && nextProps.jwtLicense) {
      verifyLicense(nextProps.jwtLicense);
    }

    if (verified !== nextProps.verified && nextProps.status > 0) {
      $(".toast-jwtErrorLicense").remove();
      Materialize.toast(localize(jwt.getErrorMessage(nextProps.status), locale), 5000, "toast-jwtErrorLicense");

      this.setState({ error: localize(jwt.getErrorMessage(nextProps.status), locale) });
      this.setState({ jwtError: true });
    }
  }

  gotoLink = (address: string) => {
    window.electron.shell.openExternal(address);
  }

  getJwtLicense = () => {
    const { localize, locale } = this.context;
    const { jwtError } = this.state;

    return jwtError ? (
      <div>
        <p>
          {localize("License.jwtGetLicense", locale)}
          <a className="card-infos" onClick={(event) => this.gotoLink("https://cryptoarm.ru/")}> cryptoarm.ru</a>
        </p>
      </div>
    ) : null;
  }

  showModalWithError = () => {
    const { localize, locale } = this.context;
    const { error, jwtError } = this.state;

    if (!error) {
      return null;
    }

    return (
      <Modal
        isOpen={true}
        header={localize("Common.error", locale)}
      >
        <div className="main">
          <div className="row">
            <div className="col s12">
              <span className="card-infos">
                <p>{error}</p>
                {this.getJwtLicense()}
              </span>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  render() {
    return (
      <div className="main">
        <nav className="app-bar">
          {this.showModalWithError()}
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

export default connect((state) => {
  return {
    jwtLicense: state.license.data,
    encSettings: state.settings.encrypt,
    loadedLicense: state.license.loaded,
    loadingLicense: state.license.loading,
    signSettings: state.settings.sign,
    verified: state.license.verified,
    status: state.license.status,
  };
}, { loadLicense, verifyLicense })(MenuBar);
