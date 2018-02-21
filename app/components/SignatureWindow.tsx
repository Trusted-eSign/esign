import PropTypes from "prop-types";
import * as React from "react";
import { connect } from "react-redux";
import { deleteFile, loadAllCertificates, packageSign, selectFile, verifySignature } from "../AC";
import { activeFilesSelector } from "../selectors";
import * as jwt from "../trusted/jwt";
import * as signs from "../trusted/sign";
import { dirExists, mapToArr } from "../utils";
import BlockNotElements from "./BlockNotElements";
import BtnsForOperation from "./BtnsForOperation";
import CertificateBlockForSignature from "./CertificateBlockForSignature";
import Dialog from "./Dialog";
import FileSelector from "./FileSelector";
import ProgressBars from "./ProgressBars";
import SignatureInfoBlock from "./SignatureInfoBlock";
import SignatureSettings from "./SignatureSettings";

const dialog = window.electron.remote.dialog;

interface IFile {
  id: string;
  filename: string;
  lastModifiedDate: Date;
  fullpath: string;
  extension: string;
  verified: boolean;
  active: boolean;
}

interface ISignatureWindowProps {
  certificatesLoaded: boolean;
  certificatesLoading: boolean;
  deleteFile: (file: string) => void;
  selectFile: (file: string) => void;
  licenseLoaded: boolean;
  licenseVerified: boolean;
  licenseStatus: number;
  licenseToken: string;
  loadAllCertificates: () => void;
  files: Array<{
    id: string,
    filename: string,
    lastModifiedDate: Date,
    fullpath: string,
    extension: string,
    verified: boolean,
    active: boolean,
  }>;
  verifySignature: (file: string) => void;
  signatures: any;
  signer: any;
  settings: any;
  signedPackage: boolean;
  signingPackage: boolean;
  verifyingPackage: boolean;
  packageSignResult: boolean;
  packageSign: (files: IFile[], cert: trusted.pki.Certificate, key: trusted.pki.Key, policies: string[], format: trusted.DataFormat, folderOut: string) => void;
}

class SignatureWindow extends React.Component<ISignatureWindowProps, any> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: ISignatureWindowProps) {
    super(props);
    this.state = ({
      fileSignatures: null,
      filename: null,
      showSignatureInfo: false,
      signerCertificate: null,
    });
  }

  componentDidMount() {
    const { certificatesLoaded, certificatesLoading } = this.props;
    // tslint:disable-next-line:no-shadowed-variable
    const { loadAllCertificates } = this.props;

    if (!certificatesLoading && !certificatesLoaded) {
      loadAllCertificates();
    }
  }

  componentWillReceiveProps(nextProps: ISignatureWindowProps) {
    const { localize, locale } = this.context;
    const { certificatesLoaded, certificatesLoading, files, signatures } = this.props;

    if (files.length !== nextProps.files.length || signatures.length !== nextProps.signatures.length) {
      if (nextProps.files && nextProps.files.length === 1) {
        if (nextProps.signatures && nextProps.signatures.length) {
          const file = nextProps.files[0];

          const fileSignatures = nextProps.signatures.filter((signature: any) => {
            return signature.fileId === file.id;
          });

          const showSignatureInfo = fileSignatures && fileSignatures.length > 0 ? true : false;

          this.setState({ fileSignatures, filename: file.filename, showSignatureInfo });

          return;
        }
      }
    }

    if (!files || !files.length || !nextProps.files || !nextProps.files.length || nextProps.files.length > 1 || files[0].id !== nextProps.files[0].id ) {
      this.setState({ showSignatureInfo: false, signerCertificate: null });
    }

    if (!this.props.signedPackage && nextProps.signedPackage) {
      if (nextProps.packageSignResult) {
        $(".toast-files_signed").remove();
        Materialize.toast(localize("Sign.files_signed", locale), 2000, "toast-files_signed");
      } else {
        $(".toast-files_signed_failed").remove();
        Materialize.toast(localize("Sign.files_signed_failed", locale), 2000, "toast-files_signed_failed");
      }
    }
  }

  render() {
    const { localize, locale } = this.context;
    const { certificatesLoading, signingPackage, verifyingPackage } = this.props;

    if (certificatesLoading || signingPackage || verifyingPackage) {
      return <ProgressBars />;
    }

    return (
      <div className="main">
        <Dialog />
        <div className="content">
          {this.getSignatureInfo()}
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

  handleActiveCert = (certificate: any) => {
    this.setState({ signerCertificate: certificate });
  }

  handleNoShowSignatureInfo = () => {
    this.setState({ showSignatureInfo: false, signerCertificate: null });
  }

  handleNoShowSignerCertificateInfo = () => {
    this.setState({ signerCertificate: null });
  }

  signed = () => {
    const { files, settings, signer, licenseVerified, licenseStatus, licenseToken, licenseLoaded } = this.props;
    // tslint:disable-next-line:no-shadowed-variable
    const { deleteFile, selectFile, packageSign } = this.props;
    const { localize, locale } = this.context;

    if (licenseLoaded && !licenseToken) {
      $(".toast-jwtErrorLoad").remove();
      Materialize.toast(localize("License.jwtErrorLoad", locale), 5000, "toast-jwtErrorLoad");
      return;
    }

    if (licenseVerified && licenseStatus !== 0) {
      $(".toast-jwtErrorLicense").remove();
      Materialize.toast(localize(jwt.getErrorMessage(licenseStatus), locale), 5000, "toast-jwtErrorLicense");
      return;
    }

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

      if (folderOut.length > 0) {
        if (!dirExists(folderOut)) {
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

      packageSign(files, cert, key, policies, format, folderOut);
    }
  }

  resign = () => {
    const { files, settings, signer, licenseVerified, licenseStatus, licenseToken, licenseLoaded } = this.props;
    // tslint:disable-next-line:no-shadowed-variable
    const { deleteFile, selectFile, packageSign } = this.props;
    const { localize, locale } = this.context;

    if (licenseLoaded && !licenseToken) {
      $(".toast-jwtErrorLoad").remove();
      Materialize.toast(localize("License.jwtErrorLoad", locale), 5000, "toast-jwtErrorLoad");
      return;
    }

    if (licenseVerified && licenseStatus !== 0) {
      $(".toast-jwtErrorLicense").remove();
      Materialize.toast(localize(jwt.getErrorMessage(licenseStatus), locale), 5000, "toast-jwtErrorLicense");
      return;
    }

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
        if (!dirExists(folderOut)) {
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
    const { files, settings } = this.props;
    // tslint:disable-next-line:no-shadowed-variable
    const { deleteFile, selectFile } = this.props;
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
    const { files, signatures } = this.props;
    // tslint:disable-next-line:no-shadowed-variable
    const { verifySignature } = this.props;
    const { localize, locale } = this.context;

    let res = true;

    files.forEach((file) => {
      verifySignature(file.id);
    });

    signatures.forEach((signature: any) => {
      for (const file of files) {
        if (file.id === signature.fileId && !signature.status_verify) {
          res = false;
          break;
        }
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

  getSignatureInfo() {
    const { fileSignatures, filename, showSignatureInfo, signerCertificate } = this.state;

    if (showSignatureInfo && fileSignatures) {
      return (
        <div className="content-tem">
          <SignatureInfoBlock
            signerCertificate={signerCertificate}
            handleActiveCert={this.handleActiveCert}
            handleNoShowSignerCertificateInfo={this.handleNoShowSignerCertificateInfo}
            handleNoShowSignatureInfo={this.handleNoShowSignatureInfo}
            signatures={fileSignatures}
            filename={filename}
          />
        </div>
      );
    } else {
      return (
        <div className="content-tem">
          <div className="col s6 m6 l6 content-item">
            <CertificateBlockForSignature />
          </div>
          <div className="col s6 m6 l6 content-item">
            <SignatureSettings />
          </div>
        </div>
      );
    }
  }
}

export default connect((state) => {
  let signatures: object[] = [];

  mapToArr(state.signatures.entities).forEach((element: any) => {
    signatures = signatures.concat(mapToArr(element));
  });

  return {
    certificatesLoaded: state.certificates.loaded,
    certificatesLoading: state.certificates.loading,
    files: activeFilesSelector(state, { active: true }),
    licenseLoaded: state.license.loaded,
    licenseStatus: state.license.status,
    licenseToken: state.license.data,
    licenseVerified: state.license.verified,
    packageSignResult: state.signatures.packageSignResult,
    settings: state.settings.sign,
    signatures,
    signedPackage: state.signatures.signedPackage,
    signer: state.certificates.getIn(["entities", state.signers.signer]),
    signingPackage: state.signatures.signingPackage,
    verifyingPackage: state.signatures.verifyingPackage,
  };
}, { deleteFile, loadAllCertificates, packageSign, selectFile, verifySignature })(SignatureWindow);
