import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { activeFilesSelector, loadingRemoteFilesSelector } from "../../selectors";
import { ENCRYPT, SIGN, VERIFY } from "../../server/constants";
import { mapToArr } from "../../utils";

interface IRemoteFile {
  extra: any;
  id: number;
  loaded: boolean;
  loading: boolean;
  name: string;
  socketId: string;
  totalSize: number;
  url: string;
}

interface IEncryptButtonsProps {
  onEncrypt: () => void;
  onDecrypt: () => void;
  activeFiles: Array<{
    id: string,
    filename: string,
    lastModifiedDate: Date,
    fullpath: string,
    extension: string,
    verified: boolean,
    active: boolean,
    remoteId?: string;
    socket?: string;
  }>;
  loadingFiles: IRemoteFile[];
  allFiles: Array<{
    id: string,
    filename: string,
    lastModifiedDate: Date,
    fullpath: string,
    extension: string,
    verified: boolean,
    active: boolean,
    remoteId?: string;
    socket?: string;
  }>;
  method?: string;
  recipients: number[];
}

class EncryptButtons extends React.Component<IEncryptButtonsProps, any> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  render() {
    const { allFiles, activeFiles, method, recipients } = this.props;
    const { localize, locale } = this.context;
    const active = allFiles.length > 0 ? "active" : "";
    let disabledFirst = "";
    let disabledSecond = "";
    let j = 0;

    if (activeFiles.length > 0) {
      if (recipients.length > 0) {
        if (this.getDisabled()) {
          method === ENCRYPT ? disabledFirst = "" : disabledFirst = "disabled";
        } else {
          disabledFirst = "";
        }
      } else {
        disabledFirst = "disabled";
      }

      for (const file of activeFiles) {
        if (file.fullpath.split(".").pop() === "enc") {
          j++;
          disabledFirst = "disabled";
        }
      }

      if (j === activeFiles.length) {
        disabledSecond = "";
      } else {
        disabledSecond = "disabled";
      }

    } else {
      disabledFirst = "disabled";
      disabledSecond = "disabled";
    }

    return (
      <div className={"btns-for-operation " + active}>
        <a className={"waves-effect waves-light btn-large operation-btn " + disabledFirst} onClick={this.props.onEncrypt}>
          {localize("Encrypt.encrypt", locale)}
        </a>
        <a className={"waves-effect waves-light btn-large operation-btn " + disabledSecond} onClick={this.props.onDecrypt}>
          {localize("Encrypt.decrypt", locale)}
        </a>
      </div>
    );

  }

  getDisabled = () => {
    const { activeFiles, loadingFiles } = this.props;

    if (loadingFiles.length) {
      return true;
    }

    if (activeFiles.length) {
      for (const file of activeFiles) {
        if (file.socket) {
          return true;
        }
      }
    }

    return false;
  }
}

export default connect((state) => {
  return {
    activeFiles: activeFilesSelector(state, { active: true }),
    allFiles: mapToArr(state.files.entities),
    loadingFiles: loadingRemoteFilesSelector(state, { loading: true }),
    method: state.remoteFiles.method,
    recipients: mapToArr(state.recipients.entities),
  };
})(EncryptButtons);
