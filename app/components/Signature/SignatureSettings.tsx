import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import {
  changeSignatureDetached, changeSignatureEncoding,
  changeSignatureOutfolder, changeSignatureTimestamp, toggleSaveToDocuments,
} from "../../AC";
import { DEFAULT_DOCUMENTS_PATH } from "../../constants";
import { loadingRemoteFilesSelector } from "../../selectors";
import { mapToArr } from "../../utils";
import CheckBoxWithLabel from "../CheckBoxWithLabel";
import EncodingTypeSelector from "../EncodingTypeSelector";
import HeaderWorkspaceBlock from "../HeaderWorkspaceBlock";
import SelectFolder from "../SelectFolder";

const dialog = window.electron.remote.dialog;

interface IFileRedux {
  active: boolean;
  extension: string;
  filename: string;
  fullpath: string;
  id: number;
  lastModifiedDate: Date;
  remoteId: string;
  socket: string;
}

export interface IRemoteFile {
  extra: any;
  id: number;
  loaded: boolean;
  loading: boolean;
  name: string;
  socketId: string;
  totalSize: number;
  url: string;
}

interface ISignatureSettingsProps {
  changeSignatureTimestamp: (timestamp: boolean) => void;
  changeSignatureOutfolder: (path: string) => void;
  changeSignatureEncoding: (encoding: string) => void;
  changeSignatureDetached: (detached: boolean) => void;
  loadingFiles: IRemoteFile[];
  files: IFileRedux[];
  saveToDocuments: boolean;
  settings: {
    detached: boolean,
    encoding: string,
    outfolder: string,
    saveToDocuments: boolean,
    timestamp: boolean,
  };
  toggleSaveToDocuments: (saveToDocuments: boolean) => void;
}

class SignatureSettings extends React.Component<ISignatureSettingsProps, any> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  addDirect() {
    // tslint:disable-next-line:no-shadowed-variable
    const { changeSignatureOutfolder } = this.props;

    if (!window.framework_NW) {
      const directory = dialog.showOpenDialog({ properties: ["openDirectory"] });
      if (directory) {
        changeSignatureOutfolder(directory[0]);
      }
    } else {
      const clickEvent = document.createEvent("MouseEvents");
      clickEvent.initEvent("click", true, true);
      document.querySelector("#choose-folder").dispatchEvent(clickEvent);
    }
  }

  handleDetachedClick = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { changeSignatureDetached, settings } = this.props;
    changeSignatureDetached(!settings.detached);
  }

  handleTimestampClick = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { changeSignatureTimestamp, settings } = this.props;
    changeSignatureTimestamp(!settings.timestamp);
  }

  handleSaveToDocumentsClick = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { toggleSaveToDocuments, saveToDocuments } = this.props;

    toggleSaveToDocuments(!saveToDocuments);
  }

  handleOutfolderChange = (ev: any) => {
    ev.preventDefault();
    // tslint:disable-next-line:no-shadowed-variable
    const { changeSignatureOutfolder } = this.props;
    changeSignatureOutfolder(ev.target.value);
  }

  handleEncodingChange = (encoding: string) => {
    // tslint:disable-next-line:no-shadowed-variable
    const { changeSignatureEncoding } = this.props;
    changeSignatureEncoding(encoding);
  }

  render() {
    const { saveToDocuments, settings } = this.props;
    const { localize, locale } = this.context;

    const disabled = this.getDisabled();

    return (
      <div id="sign-settings-content" className="content-wrapper z-depth-1">
        <HeaderWorkspaceBlock text={localize("Sign.sign_setting", locale)} />
        <div className="settings-content">
          <EncodingTypeSelector EncodingValue={settings.encoding} handleChange={this.handleEncodingChange} />
          <CheckBoxWithLabel
            disabled={disabled}
            onClickCheckBox={this.handleDetachedClick}
            isChecked={settings.detached}
            elementId="detached-sign"
            title={localize("Sign.sign_detached", locale)} />
          <CheckBoxWithLabel onClickCheckBox={this.handleTimestampClick}
            disabled={disabled}
            isChecked={settings.timestamp}
            elementId="sign-time"
            title={localize("Sign.sign_time", locale)} />
          <CheckBoxWithLabel onClickCheckBox={this.handleSaveToDocumentsClick}
            disabled={disabled}
            isChecked={saveToDocuments}
            elementId="saveToDocuments"
            title={localize("Documents.save_to_documents", locale)} />
          <SelectFolder
            disabled={disabled}
            directory={saveToDocuments ? DEFAULT_DOCUMENTS_PATH : settings.outfolder}
            viewDirect={this.handleOutfolderChange}
            openDirect={this.addDirect.bind(this)} />
        </div>
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

export default connect((state) => ({
  files: mapToArr(state.files.entities),
  loadingFiles: loadingRemoteFilesSelector(state, { loading: true }),
  saveToDocuments: state.settings.saveToDocuments,
  settings: state.settings.sign,
}), { changeSignatureDetached, changeSignatureEncoding, changeSignatureOutfolder, changeSignatureTimestamp, toggleSaveToDocuments }, null, { pure: false })(SignatureSettings);
