import * as fs from "fs";
import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { deleteFile, loadAllCertificates, packageSign, selectFile, verifySignature } from "../AC";
import { USER_NAME } from "../constants";
import { activeFilesSelector, connectedSelector } from "../selectors";
import { ERROR, SIGNED, UPLOADED } from "../server/constants";
import * as signs from "../trusted/sign";
import { dirExists, mapToArr } from "../utils";
import logger from "../winstonLogger";
import BtnsForOperation from "./BtnsForOperation";
import CertificateBlockForSignature from "./CertificateBlockForSignature";
import FileSelector from "./FileSelector";
import ProgressBars from "./ProgressBars";
import SignatureInfoBlock from "./SignatureInfoBlock";
import SignatureSettings from "./SignatureSettings";

interface IFile {
  id: string;
  filename: string;
  lastModifiedDate: Date;
  fullpath: string;
  extension: string;
  verified: boolean;
  active: boolean;
  remoteId?: string;
  socket?: string;
}

interface IConnection {
  connected: boolean;
  id: string;
  socket: SocketIO.Socket;
}

interface ISignatureWindowProps {
  certificatesLoaded: boolean;
  certificatesLoading: boolean;
  connections: any;
  connectedList: IConnection[];
  deleteFile: (file: string) => void;
  selectFile: (file: string, name?: string, lastModifiedDate?: Date, size?: number, remoteId?: string, socket?: string) => void;
  loadAllCertificates: () => void;
  files: Array<{
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
  verifySignature: (file: string) => void;
  signatures: any;
  signer: any;
  settings: any;
  signedPackage: boolean;
  signingPackage: boolean;
  verifyingPackage: boolean;
  packageSignResult: boolean;
  packageSign: (files: IFile[], cert: trusted.pki.Certificate, key: trusted.pki.Key, policies: string[], format: trusted.DataFormat, folderOut: string) => void;
  uploader: string;
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
    const { files, signatures } = this.props;

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

    if (!files || !files.length || !nextProps.files || !nextProps.files.length || nextProps.files.length > 1 || files[0].id !== nextProps.files[0].id) {
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
    const { files, settings, signer } = this.props;
    // tslint:disable-next-line:no-shadowed-variable
    const { packageSign } = this.props;
    const { localize, locale } = this.context;

    if (files.length > 0) {
      const key = window.PKISTORE.findKey(signer);
      if (!key) {
        $(".toast-key_not_found").remove();
        Materialize.toast(localize("Sign.key_not_found", locale), 2000, "toast-key_not_found");

        logger.log({
          level: "error",
          message: "Key not found",
          operation: "Подпись",
          operationObject: {
            in: "Key",
            out: "Null",
          },
          userName: USER_NAME,
        });

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
    const { connections, connectedList, files, settings, signer } = this.props;
    // tslint:disable-next-line:no-shadowed-variable
    const { deleteFile } = this.props;
    const { localize, locale } = this.context;

    if (files.length > 0) {
      const key = window.PKISTORE.findKey(signer);
      if (!key) {
        $(".toast-key_not_found").remove();
        Materialize.toast(localize("Sign.key_not_found", locale), 2000, "toast-key_not_found");

        logger.log({
          level: "error",
          message: "Key not found",
          operation: "Подпись",
          operationObject: {
            in: "Key",
            out: "Null",
          },
          userName: USER_NAME,
        });

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
          if (file.socket) {
            const connection = connections.getIn(["entities", file.socket]);

            if (connection && connection.connected && connection.socket) {
              connection.socket.emit(SIGNED, { id: file.remoteId });
            } else if (connectedList.length) {
              const connectedSocket = connectedList[0].socket;

              connectedSocket.emit(SIGNED, { id: file.remoteId });
              connectedSocket.broadcast.emit(SIGNED, { id: file.remoteId });
            }

            if (uploader) {
              let cms = signs.loadSign(newPath);

              if (cms.isDetached()) {
                if (!(cms = signs.setDetachedContent(cms, newPath))) {
                  throw ("err");
                }
              }

              const signatureInfo = signs.getSignPropertys(cms);

              const normalyzeSignatureInfo: INormalizedSignInfo[] = [];

              signatureInfo.forEach((info) => {
                const subjectCert = info.certs[info.certs.length - 1];

                normalyzeSignatureInfo.push({
                  subjectFriendlyName: info.subject,
                  issuerFriendlyName: subjectCert.issuerFriendlyName,
                  notBefore: new Date(subjectCert.notBefore).getTime(),
                  notAfter: new Date(subjectCert.notAfter).getTime(),
                  digestAlgorithm: subjectCert.signatureDigestAlgorithm,
                  signingTime: info.signingTime ? new Date(info.signingTime).getTime() : undefined,
                  subjectName: subjectCert.subjectName,
                  issuerName: subjectCert.issuerName,
                });
              });

              window.request.post({
                formData: {
                  extra: JSON.stringify(file.extra),
                  file: fs.createReadStream(newPath),
                  id: file.remoteId,
                  signers: JSON.stringify(normalyzeSignatureInfo),
                },
                url: uploader,
              }, (err) => {
                if (err) {
                  if (connection && connection.connected && connection.socket) {
                    connection.socket.emit(ERROR, { id: file.remoteId, error: err });
                  } else if (connectedList.length) {
                    const connectedSocket = connectedList[0].socket;

                    connectedSocket.emit(ERROR, { id: file.remoteId, error: err });
                    connectedSocket.broadcast.emit(ERROR, { id: file.remoteId, error: err });
                  }
                } else {
                  if (connection && connection.connected && connection.socket) {
                    connection.socket.emit(UPLOADED, { id: file.remoteId });
                  } else if (connectedList.length) {
                    const connectedSocket = connectedList[0].socket;

                    connectedSocket.emit(UPLOADED, { id: file.remoteId });
                    connectedSocket.broadcast.emit(UPLOADED, { id: file.remoteId });
                  }
                }

                deleteFile(file.id);
              },
              );
            }
          }
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
    connectedList: connectedSelector(state, { connected: true }),
    connections: state.connections,
    files: activeFilesSelector(state, { active: true }),
    packageSignResult: state.signatures.packageSignResult,
    settings: state.settings.sign,
    signatures,
    signedPackage: state.signatures.signedPackage,
    signer: state.certificates.getIn(["entities", state.signers.signer]),
    signingPackage: state.signatures.signingPackage,
    uploader: state.remoteFiles.uploader,
    verifyingPackage: state.signatures.verifyingPackage,
  };
}, { deleteFile, loadAllCertificates, packageSign, selectFile, verifySignature })(SignatureWindow);
