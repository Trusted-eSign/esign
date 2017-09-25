import * as React from "react";
import { connect } from "react-redux";
import {activeFilesSelector} from "../selectors";
import { mapToArr } from "../utils";

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
  }>;
  allFiles: Array<{
    id: string,
    filename: string,
    lastModifiedDate: Date,
    fullpath: string,
    extension: string,
    verified: boolean,
    active: boolean,
  }>;
  signer: string;
  recipients: number[];
}

class BtnsForOperation extends React.Component<IBtnsForOperationProps, any> {
  constructor(props: IBtnsForOperationProps) {
    super(props);
  }

  render() {
    const { allFiles, activeFiles, recipients, signer } = this.props;
    const active = allFiles.length > 0 ? "active" : "";
    const certsOperation: any = this.props.operation === "sign" ? signer : recipients;
    let disabledFirst = "";
    let disabledSecond = "";
    let disabledUnsign = "disabled";
    let j = 0;
    if (activeFiles.length > 0) {
      if (this.props.operation === "encrypt" && certsOperation.length > 0) {
        disabledFirst = "";
      } else if (this.props.operation === "sign" && certsOperation) {
        disabledFirst = "";
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
    activeFiles: activeFilesSelector(state, {active: true}),
    allFiles: mapToArr(state.files.entities),
    recipients: mapToArr(state.recipients.entities),
    signer: state.signers.signer,
  };
})(BtnsForOperation);
