import React from "react";
import { connect } from "react-redux";
import { activeFilesSelector, loadingRemoteFilesSelector } from "../selectors";
import { ENCRYPT, SIGN, VERIFY } from "../server/constants";
import { mapToArr } from "../utils";

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

interface IBtnsForOperationProps {
  operation: string;
  btn_name_first: string;
  operation_first: () => void;
  btn_name_second: string;
  operation_second: () => void;
  btn_resign?: string;
  operation_resign: () => void;
  btn_unsign?: string;
  operation_unsign: () => void;
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
  signer: string;
  recipients: number[];
}

class BtnsForOperation extends React.Component<IBtnsForOperationProps, any> {
  render() {
    const { allFiles, activeFiles, method, recipients, signer } = this.props;
    const active = allFiles.length > 0 ? "active" : "";
    const certsOperation: any = this.props.operation === "sign" ? signer : recipients;
    let disabledFirst = "";
    let disabledSecond = "";
    let disabledUnsign = "disabled";
    let j = 0;

    if (activeFiles.length > 0) {
      if (this.props.operation === "encrypt" && certsOperation.length > 0) {
        if (this.getDisabled()) {
          method === ENCRYPT ? disabledFirst = "" : disabledFirst = "disabled";
        } else {
          disabledFirst = "";
        }
      } else if (this.props.operation === "sign" && certsOperation) {
        if (this.getDisabled()) {
          method === SIGN ? disabledFirst = "" : disabledFirst = "disabled";
        } else {
          disabledFirst = "";
        }
      } else {
        disabledFirst = "disabled";
      }

      for (const file of activeFiles) {
        if (this.props.operation === "sign" && file.fullpath.split(".").pop() === "sig") {
          j++;
        } else if (this.props.operation === "encrypt" && file.fullpath.split(".").pop() === "enc") {
          j++;
          disabledFirst = "disabled";
        }
      }
      if (this.props.operation === "encrypt" && j === activeFiles.length) {
        disabledSecond = "";
      } else if (this.props.operation === "sign" && j === activeFiles.length) {
        if (this.getDisabled()) {
          if (method === SIGN) {
            disabledSecond = "";
            disabledUnsign = "disabled";
          }

          if (method === VERIFY) {
            disabledFirst = "disabled";
            disabledSecond = "";
            disabledUnsign = "disabled";
          }
        } else {
          disabledSecond = "";
          disabledUnsign = "";
       }
      } else {
        if (this.props.operation === "sign" && certsOperation) {
          j > 0 ? disabledFirst = "disabled" : disabledFirst = "";

          if (this.getDisabled()) {
            if (method === VERIFY) {
              disabledFirst = "disabled";
            }
          }
        }

        disabledSecond = "disabled";
      }
    } else {
      disabledFirst = "disabled";
      disabledSecond = "disabled";
    }
    if (!disabledUnsign || (this.getDisabled() && method === SIGN && j === activeFiles.length)) {
      return (
        <div className={"btns-for-operation " + active}>
          <a className={"waves-effect waves-light btn-large operation-btn " + disabledFirst} onClick={this.props.operation_resign.bind(this)}>{this.props.btn_resign}</a>
          <a className={"waves-effect waves-light btn-large operation-btn " + disabledSecond} onClick={this.props.operation_second.bind(this)}>{this.props.btn_name_second}</a>
          <a className={"waves-effect waves-light btn-large operation-btn " + disabledUnsign} onClick={this.props.operation_unsign.bind(this)}>{this.props.btn_unsign}</a>
        </div>
      );
    } else {
      return (
        <div className={"btns-for-operation " + active}>
          <a className={"waves-effect waves-light btn-large operation-btn " + disabledFirst} onClick={this.props.operation_first.bind(this)}>{this.props.btn_name_first}</a>
          <a className={"waves-effect waves-light btn-large operation-btn " + disabledSecond} onClick={this.props.operation_second.bind(this)}>{this.props.btn_name_second}</a>
        </div>
      );
    }
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
    signer: state.certificates.getIn(["entities", state.signers.signer]),
  };
})(BtnsForOperation);
