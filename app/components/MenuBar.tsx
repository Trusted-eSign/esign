import * as fs from "fs";
import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { filePackageDelete } from "../AC";
import {
  LOCATION_ABOUT, LOCATION_CERTIFICATES, LOCATION_CONTAINERS, LOCATION_DOCUMENTS,
  LOCATION_ENCRYPT, LOCATION_EVENTS, LOCATION_HELP, LOCATION_LICENSE, LOCATION_SIGN,
  SETTINGS_JSON, TRUSTED_CRYPTO_LOG,
} from "../constants";
import { connectedSelector, loadingRemoteFilesSelector } from "../selectors";
import { CANCELLED } from "../server/constants";
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
    const { cloudCSPSettings, encSettings, recipients, saveToDocuments, signSettings, signer } = this.props;

    if (this.isFilesFromSocket()) {
      this.removeAllFiles();
    }

    const state = ({
      recipients,
      settings: {
        cloudCSP: cloudCSPSettings,
        encrypt: encSettings,
        locale,
        saveToDocuments,
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
    const { isArchiveLog, eventsDateFrom, eventsDateTo } = this.props;
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

      case LOCATION_DOCUMENTS:
        return localize("Documents.documents", locale);

      case LOCATION_EVENTS:
        let title = localize("Events.operations_log", locale);

        if (isArchiveLog && eventsDateFrom && eventsDateTo) {
          title += " [" +
            (new Date(eventsDateFrom)).toLocaleDateString(locale, {
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              month: "numeric",
              year: "numeric",
            }) + " - " +
            (new Date(eventsDateTo)).toLocaleDateString(locale, {
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              month: "numeric",
              year: "numeric",
            }) + "]";
        }
        return title;

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
    const disabledNavigate = this.isFilesFromSocket();
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

  isFilesFromSocket = () => {
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

  removeAllFiles = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { connections, connectedList, filePackageDelete, files } = this.props;

    const filePackage: number[] = [];

    for (const file of files) {
      filePackage.push(file.id);

      if (file.socket) {
        const connection = connections.getIn(["entities", file.socket]);

        if (connection && connection.connected && connection.socket) {
          connection.socket.emit(CANCELLED, { id: file.remoteId });
        } else if (connectedList.length) {
          const connectedSocket = connectedList[0].socket;

          connectedSocket.emit(CANCELLED, { id: file.remoteId });
          connectedSocket.broadcast.emit(CANCELLED, { id: file.remoteId });
        }
      }
    }

    filePackageDelete(filePackage);
  }
}

export default connect((state, ownProps) => {
  return {
    cloudCSPSettings: state.settings.cloudCSP,
    connectedList: connectedSelector(state, { connected: true }),
    connections: state.connections,
    encSettings: state.settings.encrypt,
    eventsDateFrom: state.events.dateFrom,
    eventsDateTo: state.events.dateTo,
    files: mapToArr(state.files.entities),
    isArchiveLog: state.events.isArchive,
    loadingFiles: loadingRemoteFilesSelector(state, { loading: true }),
    location: ownProps.location,
    recipients: mapToArr(state.recipients.entities),
    saveToDocuments: state.settings.saveToDocuments,
    signSettings: state.settings.sign,
    signer: state.signers.signer,
  };
}, {filePackageDelete})(MenuBar);
