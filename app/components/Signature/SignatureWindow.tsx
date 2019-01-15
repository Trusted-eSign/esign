import * as fs from "fs";
import { Map } from "immutable";
import * as path from "path";
import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { deleteFile, filePackageDelete, loadAllCertificates, packageSign, removeAllRemoteFiles, selectFile, verifySignature } from "../../AC";
import { deleteAllTemporyLicenses, verifyLicense } from "../../AC/licenseActions";
import { multiplySign } from "../../AC/megafonActions";
import { DEFAULT_DOCUMENTS_PATH, USER_NAME } from "../../constants";
import { activeFilesSelector, connectedSelector } from "../../selectors";
import { CANCELLED, ERROR, SIGN, SIGNED, UPLOADED } from "../../server/constants";
import { MEGAFON, SIGN_DOCUMENT } from "../../service/megafon/constants";
import { statusCodes } from "../../service/megafon/statusCodes";
import { checkLicense } from "../../trusted/jwt";
import * as jwt from "../../trusted/jwt";
import * as signs from "../../trusted/sign";
import { dirExists, fileExists, mapToArr, uuid } from "../../utils";
import logger from "../../winstonLogger";
import CertificateBlockForSignature from "../Certificate/CertificateBlockForSignature";
import FileSelector from "../Files/FileSelector";
import Modal from "../Modal";
import ProgressBars from "../ProgressBars";
import TextForShowOnMobilePhone from "../Services/TextForShowOnMobilePhone";
import SignatureButtons from "./SignatureButtons";
import SignatureInfoBlock from "./SignatureInfoBlock";
import SignatureSettings from "./SignatureSettings";

const remote = window.electron.remote;

interface IMegafonState {
  cms: string;
  error: string;
  isDone: boolean;
  isStarted: boolean;
  status: string;
  transactionId: string;
}

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

interface IFileDescForSignService {
  document: string;
  name: string;
  uri: string;
}

interface ISignatureWindowProps {
  certificatesLoaded: boolean;
  certificatesLoading: boolean;
  connections: any;
  connectedList: IConnection[];
  deleteAllTemporyLicenses: () => void;
  deleteFile: (file: string) => void;
  selectFile: (file: string, name?: string, lastModifiedDate?: Date, size?: number, remoteId?: string, socket?: string) => void;
  licenseLoaded: boolean;
  licenseStatus: boolean;
  licenseToken: string;
  lic_error: number;
  loadAllCertificates: () => void;
  megafon: IMegafonState;
  method: string;
  multiplySign: (msisdn: string, text: string, documents: string[], signType?: "Attached" | "Detached" | undefined) => any;
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
  removeAllRemoteFiles: () => void;
  services: Map<any, any>;
  signatures: any;
  signer: any;
  settings: any;
  signedPackage: boolean;
  signingPackage: boolean;
  verifyLicense: (license?: string) => void;
  verifyingPackage: boolean;
  packageSignResult: boolean;
  packageSign: (files: IFile[], cert: trusted.pki.Certificate, key: trusted.pki.Key, policies: string[], format: trusted.DataFormat, folderOut: string) => void;
  uploader: string;
}

interface ISignatureWindowState {
  fileSignatures: any;
  filename: any;
  showModalTextForShowOnMobilePhone: boolean;
  showSignatureInfo: boolean;
  signerCertificate: any;
}

class SignatureWindow extends React.Component<ISignatureWindowProps, ISignatureWindowState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: ISignatureWindowProps) {
    super(props);
    this.state = ({
      fileSignatures: null,
      filename: null,
      showModalTextForShowOnMobilePhone: false,
      showSignatureInfo: false,
      signerCertificate: null,
    });
  }

  componentDidMount() {
    const { certificatesLoaded, certificatesLoading } = this.props;
    // tslint:disable-next-line:no-shadowed-variable
    const { loadAllCertificates, verifyLicense } = this.props;

    verifyLicense();

    if (!certificatesLoading && !certificatesLoaded) {
      loadAllCertificates();
    }
  }

  componentDidUpdate(prevProps: ISignatureWindowProps) {
    if (this.props.method === SIGN && prevProps.files && prevProps.files.length && (!this.props.files || !this.props.files.length)) {
      this.props.removeAllRemoteFiles();
      remote.getCurrentWindow().close();

      this.props.deleteAllTemporyLicenses();
    }

    if (this.props.megafon.isDone !== prevProps.megafon.isDone &&
      this.props.megafon.cms !== prevProps.megafon.cms &&
      this.props.megafon.status === "100") {

      const cms = this.props.megafon.cms;
      const digest = this.props.megafon.digest;

      let fileDesc: IFileDescForSignService = this.props.mapMegafon.getIn(["fileNames", digest]);

      if (!digest) {
        const fileNames = mapToArr(this.props.mapMegafon.get("fileNames"));

        if (fileNames && fileNames.length === 1) {
          fileDesc = fileNames[0];
        }
      }

      if (cms) {
        this.saveSignedFile(cms, fileDesc);
      }
    }

    if (this.props.megafon.isDone !== prevProps.megafon.isDone &&
      this.props.megafon.signStatusList &&
      this.props.megafon.signStatusList["ns2:signStatus"] &&
      this.props.megafon.status === "100") {

      const signStatusList = this.props.megafon.signStatusList;

      if (signStatusList) {
        const signStatus = signStatusList["ns2:signStatus"];

        for (const status of signStatus) {
          const cms = status["ns2:cms"];
          const digest = status["ns2:digest"];

          const fileDesc: IFileDescForSignService = this.props.mapMegafon.getIn(["fileNames", digest]);

          if (cms) {
            this.saveSignedFile(cms, fileDesc);
          }
        }
      }
    }

    if (this.props.megafon.isDone !== prevProps.megafon.isDone &&
      this.props.megafon.status !== prevProps.megafon.status) {
      const status = this.props.megafon.status;
      if (status && status !== "100") {
        const toast = statusCodes[SIGN_DOCUMENT][status] ? statusCodes[SIGN_DOCUMENT][status] : `Ошибка МЭП ${status}`;

        $(".toast-mep_status").remove();
        Materialize.toast(toast, 2000, "toast-mep_status");
      }
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
    const { certificatesLoading, megafon, signingPackage, verifyingPackage } = this.props;

    if (certificatesLoading || signingPackage || verifyingPackage || megafon.isStarted) {
      return <ProgressBars />;
    }

    return (
      <div className="main">
        <div className="content">
          {this.getSignatureInfo()}
          <div className="col s6 m6 l6 content-item-height">
            <FileSelector operation="SIGN" />
            <SignatureButtons
              onSign={this.handleSign}
              onVerifySignature={this.verifySign}
              onUnsign={this.unSign}
              onCancelSign={this.onCancelSign} />
          </div>
          {this.showModalTextForShowOnMobilePhone()}
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

  handleSign = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { files, signer, lic_error, verifyLicense } = this.props;
    const { localize, locale } = this.context;

    const licenseStatus = checkLicense();

    if (licenseStatus !== true) {
      $(".toast-jwtErrorLicense").remove();
      Materialize.toast(localize(jwt.getErrorMessage(lic_error), locale), 5000, "toast-jwtErrorLicense");

      logger.log({
        level: "error",
        message: "No correct license",
        operation: "Подпись",
        operationObject: {
          in: "License",
          out: "Null",
        },
        userName: USER_NAME,
      });

      return;
    }

    if (files.length > 0) {
      if (signer.service) {
        this.handleShowModalTextForShowOnMobilePhone();
      } else {
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

        const filesForSign = [];
        const filesForResign = [];

        for (const file of files) {
          if (file.fullpath.split(".").pop() === "sig") {
            filesForResign.push(file);
          } else {
            filesForSign.push(file);
          }
        }

        if (filesForSign && filesForSign.length) {
          this.sign(filesForSign, cert, key);
        }

        if (filesForResign && filesForResign.length) {
          this.resign(filesForResign, cert, key);
        }
      }

    }
  }

  onCancelSign = () => {
    this.removeAllFiles();
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

  signInService = (text: string) => {
    // tslint:disable-next-line:no-shadowed-variable
    const { multiplySign, filePackageDelete, files, services, settings, signer } = this.props;

    const signType = settings.detached ? "Detached" : "Attached";
    const service = services.getIn(["entities", signer.serviceId]);

    if (files.length > 0 && service && service.type === MEGAFON && service.settings && service.settings.mobileNumber) {
      const documents: any[] = [];

      for (const file of files) {
        const document = fs.readFileSync(file.fullpath, "base64");
        documents.push({ document, name: file.filename, uri: file.fullpath });
      }

      multiplySign(service.settings.mobileNumber, text, documents, signType)
        .then(
          (result) => {
            Materialize.toast("Запрос на подпись успешно отправлен", 2000, "toast-mep_sign_true");

            if (files) {
              const signedFileIdPackage: number[] = [];

              files.forEach((file) => {
                signedFileIdPackage.push(file.id);
              });

              filePackageDelete(signedFileIdPackage);
            }

            return;
          },
          (error) => Materialize.toast(statusCodes[SIGN_DOCUMENT][error], 2000, "toast-mep_status"),
        );
    }
  }

  sign = (files: IFile[], cert: any, key: any) => {
    const { settings, signer } = this.props;
    // tslint:disable-next-line:no-shadowed-variable
    const { packageSign } = this.props;
    const { localize, locale } = this.context;

    if (files.length > 0) {
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

  resign = (files: IFile[], cert: any, key: any) => {
    const { connections, connectedList, settings, uploader } = this.props;
    // tslint:disable-next-line:no-shadowed-variable
    const { deleteFile, selectFile } = this.props;
    const { localize, locale } = this.context;

    if (files.length > 0) {
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
          } else {
            deleteFile(file.id);
            selectFile(newPath);
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

  saveSignedFile = (cms: string, fileDesc: IFileDescForSignService) => {
    // tslint:disable-next-line:no-shadowed-variable
    const { selectFile, settings } = this.props;
    const folderOut = settings.outfolder;
    let outURI: string;

    if (!cms) {
      return;
    }

    if (fileDesc && fileDesc.name && fileDesc.uri) {
      if (folderOut.length > 0) {
        outURI = path.join(folderOut, fileDesc.name + ".sig");
      } else {
        outURI = fileDesc.uri + ".sig";
      }
    } else {
      outURI = path.join(DEFAULT_DOCUMENTS_PATH, uuid() + ".sig");
    }

    let indexFile: number = 1;
    let newOutUri: string = outURI;
    const fileUri = outURI.substring(0, outURI.lastIndexOf("."));

    while (fileExists(newOutUri)) {
      const parsed = path.parse(fileUri);
      newOutUri = path.join(parsed.dir, parsed.name + "_(" + indexFile + ")" + parsed.ext + ".sig");
      indexFile++;
    }

    outURI = newOutUri;

    try {
      const tcms: trusted.cms.SignedData = new trusted.cms.SignedData();
      tcms.import(Buffer.from("-----BEGIN CMS-----" + "\n" + cms + "\n" + "-----END CMS-----"), trusted.DataFormat.PEM);
      tcms.save(outURI, trusted.DataFormat.PEM);

      selectFile(outURI);
    } catch (e) {
      //
    }
  }

  showModalTextForShowOnMobilePhone = () => {
    const { localize, locale } = this.context;
    const { showModalTextForShowOnMobilePhone } = this.state;
    const { files } = this.props;

    if (!showModalTextForShowOnMobilePhone) {
      return;
    }

    let text = "";

    if (files && files.length) {
      text = files.length > 1 ? "Подтвердите подпись файлов: " : "Подтвердите подпись файла: ";

      for (const file of files) {
        text += file.filename + ", ";
      }
    }

    return (
      <Modal
        isOpen={showModalTextForShowOnMobilePhone}
        header={localize("Services.displayed_text", locale)}
        onClose={this.handleCloseModalTextForShowOnMobilePhone} style={{
          width: "70%",
        }}>

        <TextForShowOnMobilePhone done={this.signInService} onCancel={this.handleCloseModalTextForShowOnMobilePhone} text={text} />
      </Modal>
    );
  }

  handleShowModalTextForShowOnMobilePhone = () => {
    this.setState({ showModalTextForShowOnMobilePhone: true });
  }

  handleCloseModalTextForShowOnMobilePhone = () => {
    this.setState({ showModalTextForShowOnMobilePhone: false });
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
    lic_error: state.license.lic_error,
    licenseLoaded: state.license.loaded,
    licenseStatus: state.license.status,
    licenseToken: state.license.data,
    mapMegafon: state.megafon,
    megafon: state.megafon.toJS(),
    method: state.remoteFiles.method,
    packageSignResult: state.signatures.packageSignResult,
    services: state.services,
    settings: state.settings.sign,
    signatures,
    signedPackage: state.signatures.signedPackage,
    signer: state.certificates.getIn(["entities", state.signers.signer]),
    signingPackage: state.signatures.signingPackage,
    uploader: state.remoteFiles.uploader,
    verifyingPackage: state.signatures.verifyingPackage,
  };
}, { deleteAllTemporyLicenses, deleteFile, multiplySign, filePackageDelete, loadAllCertificates, packageSign, removeAllRemoteFiles, selectFile, verifyLicense, verifySignature })(SignatureWindow);
