import * as React from "react";
import { connect } from "react-redux";
import { encrypt, EncryptApp } from "../module/encrypt_app";
import { sign, SignApp } from "../module/sign_app";
import {activeFilesSelector} from "../selectors";
import { filteredCertificatesSelector } from "../selectors";
import { mapToArr } from "../utils";

interface IBtnsForOperationProps {
  operation: string;
  btn_name_first: string;
  operation_first: () => void;
  btn_name_second: string;
  operation_second: () => void;
  btn_resign?: string;
  operation_resign?: () => void;
  btn_unsign?: string;
  operation_unsign?: () => void;
  files: Array<{
    id: string,
    filename: string,
    lastModifiedDate: Date,
    fullpath: string,
    extension: string,
    verified: boolean,
    active: boolean,
  }>;
  signer: string;
}

class BtnsForOperation extends React.Component<IBtnsForOperationProps, any> {
  constructor(props: IBtnsForOperationProps) {
    super(props);
    this.change = this.change.bind(this);
  }

  componentDidMount() {
    encrypt.on(EncryptApp.FILES_CHANGE, this.change);
    encrypt.on(EncryptApp.SETTINGS, this.change);
    sign.on(SignApp.FILES_CHANGE, this.change);
    sign.on(SignApp.SETTINGS, this.change);
  }

  componentWillUnmount() {
    encrypt.removeListener(EncryptApp.FILES_CHANGE, this.change);
    encrypt.removeListener(EncryptApp.SETTINGS, this.change);
    sign.removeListener(SignApp.FILES_CHANGE, this.change);
    sign.removeListener(SignApp.SETTINGS, this.change);
  }

  change() {
    this.setState({});
  }

  render() {
    const { files, signer } = this.props;
    const active = files.length > 0 ? "active" : "";
    const certsOperation: any = this.props.operation === "sign" ? signer : encrypt.get_certificates_for_encrypt;
    let disabledFirst = "";
    let disabledSecond = "";
    let disabledUnsign = "disabled";
    let j = 0;
    if (files.length > 0) {
      if (this.props.operation === "encrypt" && certsOperation.length > 0) {
        disabledFirst = "";
      } else if (this.props.operation === "sign" && certsOperation) {
        disabledFirst = "";
      } else {
        disabledFirst = "disabled";
      }
      for (const file of files) {
        if (this.props.operation === "sign" && file.fullpath.split(".").pop() === "sig") {
          j++;
        } else if (this.props.operation === "encrypt" && file.fullpath.split(".").pop() === "enc") {
          j++;
          disabledFirst = "disabled";
        }
      }
      if (this.props.operation === "encrypt" && j === files.length) {
        disabledSecond = "";
      } else if (this.props.operation === "sign" && j === files.length) {
        disabledSecond = "";
        disabledUnsign = "";
      } else {
        if (this.props.operation === "sign" && certsOperation) {
          j > 0 ? disabledFirst = "disabled" : disabledFirst = "";
        }

        disabledSecond = "disabled";
      }
    } else {
      disabledFirst = "disabled";
      disabledSecond = "disabled";
    }
    if (!disabledUnsign) {
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
}

export default connect((state) => {
  return {
    files: activeFilesSelector(state, {active: true}),
    signer: state.certificates.getIn(["entities", state.signers.signer]),
  };
})(BtnsForOperation);
