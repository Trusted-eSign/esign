import * as React from "react";
import { connect } from "react-redux";
import { deleteFile, selectFile, verifySignature } from "../AC";
import * as native from "../native";
import { activeFilesSelector } from "../selectors";
import * as signs from "../trusted/sign";
import { utils } from "../utils";
import { mapToArr } from "../utils";
import BlockNotElements from "./BlockNotElements";
import BtnsForOperation from "./BtnsForOperation";
import CertificateBlockForSignature from "./CertificateBlockForSignature";
import { Dialog } from "./components";
import FileSelector from "./FileSelector";
import SignatureInfoBlock from "./SignatureInfoBlock";
import SignatureSettings from "./SignatureSettings";
import SignerCertificateInfo from "./SignerCertificateInfo";

const dialog = window.electron.remote.dialog;

interface ISignatureWindowProps {
  files: Array<{
    id: string,
    filename: string,
    lastModifiedDate: Date,
    fullpath: string,
    extension: string,
    verified: boolean,
    active: boolean,
  }>;
}

class SignatureWindow extends React.Component<ISignatureWindowProps, any> {
  static contextTypes = {
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

  constructor(props: ISignatureWindowProps) {
    super(props);
  }

  signed = () => {
    const { files, settings, signer, deleteFile, selectFile } = this.props;
    const { localize, locale } = this.context;

    if (files.length > 0) {
      const key = window.PKISTORE.findKey(signer);
      if (!key) {
        $(".toast-key_not_found").remove();
        Materialize.toast(localize("Sign.key_not_found", locale), 2000, "toast-key_not_found");
        return;
      }

      const cert = window.PKISTORE.getPkiObject(signer);
      const policies = ["noAttributes"];
      const folderOut = settings.outfolder;
      let res = true;
      let format = trusted.DataFormat.PEM;

      if (folderOut.length > 0) {
        if (!utils.dirExists(folderOut)) {
          $(".toast-failed_find_directory").remove();
          Materialize.toast(localize("Settings.failed_find_directory", locale), 2000, "toast-failed_find_directory");
          return;
        }
      }

      if (settings.detached) {
        policies.push("detached");
      }

      if (settings.timestamp) {
        policies.splice(0, 1);
      }

      if (settings.encoding !== localize("Settings.BASE", locale)) {
        format = trusted.DataFormat.DER;
      }

      files.forEach((file) => {
        const newPath = signs.signFile(file.fullpath, cert, key, policies, format, folderOut);
        if (newPath) {
          deleteFile(file.id);
          selectFile(newPath);
        } else {
          res = false;
        }
      });

      if (res) {
        $(".toast-files_signed").remove();
        Materialize.toast(localize("Sign.files_signed", locale), 2000, "toast-files_signed");
      } else {
        $(".toast-files_signed_failed").remove();
        Materialize.toast(localize("Sign.files_signed_failed", locale), 2000, "toast-files_signed_failed");
      }
    }
  }

  resign = () => {
    const { files, settings, signer, deleteFile, selectFile } = this.props;
    const { localize, locale } = this.context;

    if (files.length > 0) {
      const key = window.PKISTORE.findKey(signer);
      if (!key) {
        $(".toast-key_not_found").remove();
        Materialize.toast(localize("Sign.key_not_found", locale), 2000, "toast-key_not_found");
        return;
      }

      const cert = window.PKISTORE.getPkiObject(signer);
      const policies = ["noAttributes"];
      const folderOut = settings.outfolder;
      let format = trusted.DataFormat.PEM;
      let res = true;

      if (folderOut.length > 0) {
        if (!utils.dirExists(folderOut)) {
          $(".toast-failed_find_directory").remove();
          Materialize.toast(localize("Settings.failed_find_directory", locale), 2000, "toast-failed_find_directory");
          return;
        }
      }

      if (settings.timestamp) {
        policies.splice(0, 1);
      }

      if (settings.encoding !== localize("Settings.BASE", locale)) {
        format = trusted.DataFormat.DER;
      }

      files.forEach((file) => {
        const newPath = signs.resignFile(file.fullpath, cert, key, policies, format, folderOut);
        if (newPath) {
          deleteFile(file.id);
          selectFile(newPath);
        } else {
          res = false;
        }
      });

      if (res) {
        $(".toast-files_resigned").remove();
        Materialize.toast(localize("Sign.files_resigned", locale), 2000, "toast-files_resigned");
      } else {
        $(".toast-files_resigned_failed").remove();
        Materialize.toast(localize("Sign.files_resigned_failed", locale), 2000, "toast-files_resigned_failed");
      }
    }
  }

  unSign = () => {
    const { files, settings, deleteFile, selectFile } = this.props;
    const { localize, locale } = this.context;

    if (files.length > 0) {
      const folderOut = settings.outfolder;
      let res = true;

      files.forEach((file) => {
        const newPath = signs.unSign(file.fullpath, folderOut);
        if (newPath) {
          deleteFile(file.id);
          selectFile(newPath);
        } else {
          res = false;
        }
      });

      if (res) {
        $(".toast-files_unsigned_ok").remove();
        Materialize.toast(localize("Sign.files_unsigned_ok", locale), 2000, "toast-files_unsigned_ok");
      } else {
        $(".toast-files_unsigned_failed").remove();
        Materialize.toast(localize("Sign.files_unsigned_failed", locale), 2000, "toast-files_unsigned_failed");
      }
    }
  }

  verifySign = () => {
    const { files, verifySignature, signatures } = this.props;
    const { localize, locale } = this.context;

    let res = true;

    files.forEach((file) => {
      verifySignature(file.id);
    });

    signatures.forEach((signature) => {
      if (!signature.status_verify) {
        res = false;
      }
    });

    if (res) {
      $(".toast-verify_sign_ok").remove();
      Materialize.toast(localize("Sign.verify_sign_ok", locale), 2000, "toast-verify_sign_ok");
    } else {
      $(".toast-verify_sign_founds_errors").remove();
      Materialize.toast(localize("Sign.verify_sign_founds_errors", locale), 2000, "toast-verify_sign_founds_errors");
    }
  }

  render() {
    const { localize, locale } = this.context;

    return (
      <div className="main">
        <Dialog />
        <div className="content">
          <div className="content-tem">
            <div className="col s6 m6 l6 content-item">
              <CertificateBlockForSignature />
            </div>
            <div className="col s6 m6 l6 content-item">
              <SignatureSettings />
            </div>
          </div>
          <SignatureInfoBlock />
          <SignerCertificateInfo />
          <div className="col s6 m6 l6 content-item-height">
            <BtnsForOperation
              btn_name_first={localize("Sign.sign", locale)}
              btn_name_second={localize("Sign.verify", locale)}
              btn_resign={localize("Sign.resign", locale)}
              btn_unsign={localize("Sign.unsign", locale)}
              operation_first={this.signed}
              operation_second={this.verifySign}
              operation_unsign={this.unSign}
              operation_resign={this.resign}
              operation="sign" />
            <FileSelector operation="sign" />
          </div>
        </div>
      </div>
    );
  }
}

export default connect((state) => {
  return {
    files: activeFilesSelector(state, { active: true }),
    settings: state.settings.sign,
    signatures: mapToArr(state.signatures.entities),
    signer: state.certificates.getIn(["entities", state.signers.signer]),
  };
}, { deleteFile, selectFile, verifySignature })(SignatureWindow);
