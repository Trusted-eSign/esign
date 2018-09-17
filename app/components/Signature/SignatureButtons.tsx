import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { documentsReviewed } from "../../AC/documentsActions";
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

interface ISignatureButtonsProps {
  onCancelSign?: () => void;
  onSign: () => void;
  onVerifySignature: () => void;
  onUnsign: () => void;
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
  documentsReviewed: (reviwed: boolean) => void;
  isDocumentsReviewed: boolean;
  method?: string;
  signer: string;
}

class SignatureButtons extends React.Component<ISignatureButtonsProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  render() {
    const { allFiles, activeFiles, isDocumentsReviewed, method, signer } = this.props;
    const { localize, locale } = this.context;

    const active = allFiles.length > 0 ? "active" : "";
    const haveFilesFromSocket: boolean = this.isFilesLoading() || this.isFilesFromSocket();

    let disabledSign = "";
    let disabledVerify = "";
    let disabledUnsign = "disabled";

    let j = 0;

    if (activeFiles.length > 0) {
      if (signer) {
        if (haveFilesFromSocket) {
          disabledSign = (method === SIGN) ? "" : "disabled";
        } else {
          disabledSign = "";
        }
      } else {
        disabledSign = "disabled";
      }

      for (const file of activeFiles) {
        if (file.fullpath.split(".").pop() === "sig") {
          j++;
        }
      }

      if (j === activeFiles.length) {
        if (haveFilesFromSocket) {
          if (method === SIGN) {
            disabledVerify = "";
            disabledUnsign = "disabled";
          }

          if (method === VERIFY) {
            disabledSign = "disabled";
            disabledVerify = "";
            disabledUnsign = "disabled";
          }
        } else {
          disabledVerify = "";
          disabledUnsign = "";
        }
      } else {
        if (haveFilesFromSocket) {
          if (method === VERIFY) {
            disabledSign = "disabled";
          }
        }

        disabledVerify = "disabled";
      }
    } else {
      disabledSign = "disabled";
      disabledVerify = "disabled";
    }

    if (!isDocumentsReviewed) {
      disabledSign = "disabled";
    }

    if (!disabledUnsign || (haveFilesFromSocket && method === SIGN)) {
      return (
        <React.Fragment>
          <div className="row">
            <div className="row" />
            <div className="col s12">
              <div className="input-checkbox">
                <input
                  name={"filesview"}
                  type="checkbox"
                  id={"filesview"}
                  className="filled-in"
                  checked={isDocumentsReviewed}
                  onClick={this.toggleDocumentsReviewed}
                />
                <label htmlFor={"filesview"} className="truncate">
                  {localize("Sign.documents_reviewed", locale)}
                </label>
              </div>
            </div>
          </div>
          <div className={"btns-for-operation " + active}>
            <a className={"waves-effect waves-light btn-large operation-btn " + disabledSign} onClick={this.props.onSign}>
              {localize("Sign.sign", locale)}
            </a>
            {this.isFilesFromSocket() ?
              <a className={"waves-effect waves-light btn-large operation-btn "} onClick={this.props.onCancelSign}>
                {localize("Common.cancel", locale)}
              </a>
              :
              <React.Fragment>
                <a className={"waves-effect waves-light btn-large operation-btn " + disabledVerify} onClick={this.props.onVerifySignature}>
                  {localize("Sign.verify", locale)}
                </a>
                <a className={"waves-effect waves-light btn-large operation-btn " + disabledUnsign} onClick={this.props.onUnsign}>
                  {localize("Sign.unsign", locale)}
                </a>
              </React.Fragment>
            }
          </div>
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <div className="row">
            <div className="row" />
            <div className="col s12">
              <div className="input-checkbox">
                <input
                  name={"filesview"}
                  type="checkbox"
                  id={"filesview"}
                  className="filled-in"
                  checked={isDocumentsReviewed}
                  onClick={this.toggleDocumentsReviewed}
                />
                <label htmlFor={"filesview"} className="truncate">
                  {localize("Sign.documents_reviewed", locale)}
                </label>
              </div>
            </div>
          </div>
          <div className={"btns-for-operation " + active}>
            {this.isFilesFromSocket() && method === VERIFY ?
              <React.Fragment>
                <a className={"waves-effect waves-light btn-large operation-btn " + disabledVerify} onClick={this.props.onVerifySignature}>
                  {localize("Sign.verify", locale)}
                </a>
                <a className={"waves-effect waves-light btn-large operation-btn "} onClick={this.props.onCancelSign}>
                  {localize("Common.cancel", locale)}
                </a>
              </React.Fragment> :
              <React.Fragment>
                <a className={"waves-effect waves-light btn-large operation-btn " + disabledSign} onClick={this.props.onSign}>
                  {localize("Sign.sign", locale)}
                </a>
                <a className={"waves-effect waves-light btn-large operation-btn " + disabledVerify} onClick={this.props.onVerifySignature}>
                  {localize("Sign.verify", locale)}
                </a>
              </React.Fragment>
            }
          </div>
        </React.Fragment>
      );
    }
  }

  isFilesLoading = () => {
    const { loadingFiles } = this.props;

    if (loadingFiles.length) {
      return true;
    }

    return false;
  }

  isFilesFromSocket = () => {
    const { activeFiles } = this.props;

    if (activeFiles.length) {
      for (const file of activeFiles) {
        if (file.socket) {
          return true;
        }
      }
    }

    return false;
  }

  toggleDocumentsReviewed = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { documentsReviewed, isDocumentsReviewed } = this.props;

    documentsReviewed(!isDocumentsReviewed);
  }
}

export default connect((state) => {
  return {
    activeFiles: activeFilesSelector(state, { active: true }),
    allFiles: mapToArr(state.files.entities),
    isDocumentsReviewed: state.files.documentsReviewed,
    loadingFiles: loadingRemoteFilesSelector(state, { loading: true }),
    method: state.remoteFiles.method,
    signer: state.certificates.getIn(["entities", state.signers.signer]),
  };
}, { documentsReviewed })(SignatureButtons);
