import * as fs from "fs";
import * as path from "path";
import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { deleteFile, loadAllCertificates, selectFile } from "../../AC";
import { CRYPTOPRO_DSS, HOME_DIR, USER_NAME } from "../../constants";
import { activeFilesSelector, connectedSelector } from "../../selectors";
import { DECRYPTED, ENCRYPTED } from "../../server/constants";
import * as encrypts from "../../trusted/encrypt";
import { dirExists, fileCoding, fileExists, mapToArr } from "../../utils";
import logger from "../../winstonLogger";
import CertificateBlockForEncrypt from "../Certificate/CertificateBlockForEncrypt";
import AuthWebView from "../CloudCSP/AuthWebView";
import FileSelector from "../Files/FileSelector";
import Modal from "../Modal";
import ProgressBars from "../ProgressBars";
import PinCodeForDssContainer from "../Services/PinCodeForDssContainer";
import EncryptButtons from "./EncryptButtons";
import EncryptSettings from "./EncryptSettings";

class EncryptWindow extends React.Component<any, any> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: any) {
    super(props);
    this.state = ({
      decryptedFile: null,
      decryptedInDSS: null,
      decryptedInDSSIndex: 0,
      dssSigning: false,
      dssToken: "",
      forDecryptInDSS: null,
      recipientId: "",
      serviceId: "",
      showModalDssPin: false,
      showModalServiceSignParams: false,
    });
  }

  componentDidMount() {
    const { certificatesLoaded, certificatesLoading, loadAllCertificates } = this.props;

    if (!certificatesLoading && !certificatesLoaded) {
      loadAllCertificates();
    }
  }

  encrypt = () => {
    const { connectedList, connections, files, settings, deleteFile, selectFile, recipients } = this.props;
    const { localize, locale } = this.context;

    if (files.length > 0) {
      const certs = recipients;
      const folderOut = settings.outfolder;
      const policies = { deleteFiles: false, archiveFiles: false };

      let format = trusted.DataFormat.PEM;
      let res = true;

      if (folderOut.length > 0) {
        if (!dirExists(folderOut)) {
          $(".toast-failed_find_directory").remove();
          Materialize.toast(localize("Settings.failed_find_directory", locale), 2000, "toast-failed_find_directory");
          return;
        }
      }

      policies.deleteFiles = settings.delete;
      policies.archiveFiles = settings.archive;

      if (settings.encoding !== localize("Settings.BASE", locale)) {
        format = trusted.DataFormat.DER;
      }

      if (policies.archiveFiles) {
        let outURI: string;
        if (folderOut.length > 0) {
          outURI = path.join(folderOut, localize("Encrypt.archive_name", locale));
        } else {
          outURI = path.join(HOME_DIR, localize("Encrypt.archive_name", locale));
        }

        const output = fs.createWriteStream(outURI);
        const archive = window.archiver("zip");

        output.on("close", () => {
          $(".toast-files_archived").remove();
          Materialize.toast(localize("Encrypt.files_archived", locale), 2000, "toast-files_archived");

          if (policies.deleteFiles) {
            files.forEach((file) => {
              fs.unlinkSync(file.fullpath);
            });
          }

          const newPath = encrypts.encryptFile(outURI, certs, policies, format, folderOut);
          if (newPath) {
            files.forEach((file) => {
              deleteFile(file.id);
              if (file.socket) {
                const connection = connections.getIn(["entities", file.socket]);
                if (connection && connection.connected && connection.socket) {
                  connection.socket.emit(ENCRYPTED, { id: file.remoteId });
                } else if (connectedList.length) {
                  const connectedSocket = connectedList[0].socket;

                  connectedSocket.emit(ENCRYPTED, { id: file.remoteId });
                  connectedSocket.broadcast.emit(ENCRYPTED, { id: file.remoteId });
                }
              }
            });
            selectFile(newPath);
          } else {
            res = false;
          }

          if (res) {
            $(".toast-files_encrypt").remove();
            Materialize.toast(localize("Encrypt.files_encrypt", locale), 2000, "toast-files_encrypt");
          } else {
            $(".toast-files_encrypt_failed").remove();
            Materialize.toast(localize("Encrypt.files_encrypt_failed", locale), 2000, "toast-files_encrypt_failed");
          }
        });

        archive.on("error", () => {
          $(".toast-files_archived_failed").remove();
          Materialize.toast(localize("Encrypt.files_archived_failed", locale), 2000, "toast-files_archived_failed");
        });

        archive.pipe(output);

        files.forEach((file) => {
          archive.append(fs.createReadStream(file.fullpath), { name: file.filename });
        });

        archive.finalize();
      } else {
        files.forEach((file) => {
          const newPath = encrypts.encryptFile(file.fullpath, certs, policies, format, folderOut);
          if (newPath) {
            deleteFile(file.id);
            selectFile(newPath);

            if (file.socket) {
              const connection = connections.getIn(["entities", file.socket]);
              if (connection && connection.connected && connection.socket) {
                connection.socket.emit(ENCRYPTED, { id: file.remoteId });
              } else if (connectedList.length) {
                const connectedSocket = connectedList[0].socket;

                connectedSocket.emit(ENCRYPTED, { id: file.remoteId });
                connectedSocket.broadcast.emit(ENCRYPTED, { id: file.remoteId });
              }
            }
          } else {
            res = false;
          }
        });

        if (res) {
          $(".toast-files_encrypt").remove();
          Materialize.toast(localize("Encrypt.files_encrypt", locale), 2000, "toast-files_encrypt");
        } else {
          $(".toast-files_encrypt_failed").remove();
          Materialize.toast(localize("Encrypt.files_encrypt_failed", locale), 2000, "toast-files_encrypt_failed");
        }
      }
    }
  }

  decrypt = () => {
    const { connectedList, connections, files, settings, deleteFile, selectFile } = this.props;
    const { localize, locale } = this.context;

    if (files.length > 0) {
      const folderOut = settings.outfolder;
      let res = true;

      if (folderOut.length > 0) {
        if (!dirExists(folderOut)) {
          $(".toast-failed_find_directory").remove();
          Materialize.toast(localize("Settings.failed_find_directory", locale), 2000, "toast-failed_find_directory");
          return;
        }
      }

      const forDecryptInDSS = [];
      const filesForDecryptInLocalCSP = [];

      for (const file of files) {
        let certWithKey: trusted.pki.Certificate;

        try {
          const uri = file.fullpath;
          const format = fileCoding(uri);
          const cipher = new trusted.pki.Cipher();
          const ris = cipher.getRecipientInfos(uri, format);

          let ri: trusted.cms.CmsRecipientInfo;
          let haveLocalRecipient = false;
          let haveDSSRecipient = false;
          let dssRecipient;

          for (let i = 0; i < ris.length; i++) {
            ri = ris.items(i);

            certWithKey = this.props.mapCertificates
              .get("entities")
              .find((item) => item.issuerName === ri.issuerName && item.serial === ri.serialNumber && item.key);

            if (certWithKey) {
              if (!certWithKey.service) {
                haveLocalRecipient = true;
                break;
              } else {
                haveDSSRecipient = true;
                dssRecipient = certWithKey;
              }
            } else {
              res = false;
            }
          }

          if (haveLocalRecipient) {
            filesForDecryptInLocalCSP.push(file);
          } else if (haveDSSRecipient) {
            forDecryptInDSS.push({ file, dssRecipient });
          }
        } catch (e) {
          //
        }
      }

      if (filesForDecryptInLocalCSP && filesForDecryptInLocalCSP.length) {
        filesForDecryptInLocalCSP.forEach((file) => {
          const newPath = encrypts.decryptFile(file.fullpath, folderOut);

          if (newPath) {
            deleteFile(file.id);
            selectFile(newPath);

            if (file.socket) {
              const connection = connections.getIn(["entities", file.socket]);
              if (connection && connection.connected && connection.socket) {
                connection.socket.emit(DECRYPTED, { id: file.remoteId });
              } else if (connectedList.length) {
                const connectedSocket = connectedList[0].socket;

                connectedSocket.emit(DECRYPTED, { id: file.remoteId });
                connectedSocket.broadcast.emit(DECRYPTED, { id: file.remoteId });
              }
            }
          } else {
            res = false;
          }
        });

        if (res) {
          $(".toast-files_decrypt").remove();
          Materialize.toast(localize("Encrypt.files_decrypt", locale), 2000, "toast-files_decrypt");
        } else {
          $(".toast-files_decrypt_failed").remove();
          Materialize.toast(localize("Encrypt.files_decrypt_failed", locale), 2000, "toast-files_decrypt_failed");
        }
      }

      if (forDecryptInDSS && forDecryptInDSS.length) {
        this.setState({ forDecryptInDSS });
        this.setState({ decryptedInDSS: forDecryptInDSS[0] });
        this.handleShowModalServiceSignParams();
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { forDecryptInDSS } = this.state;

    if (forDecryptInDSS && forDecryptInDSS.length && this.state.decryptedInDSSIndex !== prevState.decryptedInDSSIndex && this.state.decryptedInDSSIndex) {
      if (this.state.decryptedInDSSIndex < forDecryptInDSS.length) {
        this.setState({ decryptedInDSS: forDecryptInDSS[this.state.decryptedInDSSIndex] });
      }
    }

    if (prevState.decryptedInDSS && this.state.decryptedInDSS && prevState.decryptedInDSS.file.fullpath !== this.state.decryptedInDSS.file.fullpath) {
      this.handleShowModalServiceSignParams();
    }
  }

  render() {
    const { certificatesLoading } = this.props;
    const { dssSigning } = this.state;

    if (certificatesLoading || dssSigning) {
      return <ProgressBars />;
    }

    return (
      <div className="main">
        <div className="content">
          <div className="content-tem">
            <div className="col s6 m6 l6 content-item">
              <CertificateBlockForEncrypt />
            </div>
            <div className="col s6 m6 l6 content-item">
              <EncryptSettings />
            </div>
          </div>
          <div className="col s6 m6 l6 content-item-height">
            <EncryptButtons
              onEncrypt={this.encrypt}
              onDecrypt={this.decrypt} />
            <FileSelector operation="encrypt" />
          </div>
          {this.showModalServiceSignParams()}
          {this.showModalDssPin()}
        </div>
      </div>
    );
  }

  showModalServiceSignParams = () => {
    const { localize, locale } = this.context;
    const { decryptedInDSS, showModalServiceSignParams } = this.state;
    const { services } = this.props;

    if (!showModalServiceSignParams || !decryptedInDSS) {
      return;
    }

    const serviceId = decryptedInDSS.dssRecipient.serviceId;
    const service = services.getIn(["entities", serviceId]);

    if (service && service.type === CRYPTOPRO_DSS) {
      return (
        <Modal
          isOpen={showModalServiceSignParams}
          header={`${localize("Services.cryptopro_dss", locale)} (${service.settings.authURL})`}
          onClose={this.handleCloseModalServiceSignParams} style={{
            width: "70%",
          }}>

          <div className="cloudCSP_modal">
            <div className="row halftop">
              <div className="col s12">
                <div className="content-wrapper tbody border_group_cloud">
                  <AuthWebView onCancel={this.handleCloseModalServiceSignParams} onTokenGet={this.onTokenGet} auth={service.settings.authURL} />
                </div>
              </div>
            </div>
            <div className="row halfbottom" />
            <div className="row">
              <div className="col s3 offset-s9">
                <a className={"waves-effect waves-light btn modal-close btn_modal"} onClick={this.handleCloseModalServiceSignParams}>{localize("Common.close", locale)}</a>
              </div>
            </div>
          </div>
        </Modal>
      );
    }
  }

  handleShowModalServiceSignParams = () => {
    this.setState({ showModalServiceSignParams: true });
  }

  handleCloseModalServiceSignParams = () => {
    this.setState({ showModalServiceSignParams: false });
  }

  onTokenGet = (token: string) => {
    if (!token || !token.length) {
      return;
    }

    this.setState({ dssToken: token });

    this.handleCloseModalServiceSignParams();

    this.handleShowModalDssPin();
  }

  showModalDssPin = () => {
    const { localize, locale } = this.context;
    const { decryptedInDSS, showModalDssPin } = this.state;
    const { services } = this.props;

    if (!showModalDssPin) {
      return;
    }

    const serviceId = decryptedInDSS.dssRecipient.serviceId;
    const service = services.getIn(["entities", serviceId]);

    return (
      <Modal
        isOpen={showModalDssPin}
        header={localize("Services.pin_code_for_container", locale)}
        onClose={this.handleCloseModalDssPin} style={{
          width: "70%",
        }}>

        <React.Fragment>
          <div style={{ height: "160px" }}>
            <div className="row halftop">
              <div className="col s12">
                <div className="content-wrapper tbody border_group" style={{
                  boxshadow: "0 0 0 1px rgb(227, 227, 228)",
                  height: "150px",
                  overflow: "auto",
                }}>
                  <div className="add-cert-collection collection cert-info-list">
                    <div className="collection-item certs-collection certificate-info">
                      <div className={"collection-info cert-info-blue"}>{localize("Certificate.subject", locale)}</div>
                      <div className={"collection-title selectable-text"}>{decryptedInDSS.dssRecipient.subjectFriendlyName}</div>
                    </div>
                    <div className="collection-item certs-collection certificate-info">
                      <div className={"collection-info cert-info-blue"}>{localize("Certificate.serialNumber", locale)}</div>
                      <div className={"collection-title selectable-text"}>{decryptedInDSS.dssRecipient.serial ? decryptedInDSS.dssRecipient.serial : decryptedInDSS.dssRecipient.serialNumber}</div>
                    </div>
                    <div className="collection-item certs-collection certificate-info">
                      <div className={"collection-info cert-info-blue"}>{localize("CloudCSP.rest", locale)}</div>
                      <div className={"collection-title selectable-text"}>{service.settings.restURL}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <PinCodeForDssContainer done={this.decryptInService} onCancel={this.handleCloseModalDssPin} text={""} />
        </React.Fragment>
      </Modal>
    );
  }

  handleShowModalDssPin = () => {
    this.setState({ showModalDssPin: true });
  }

  handleCloseModalDssPin = () => {
    this.setState({ showModalDssPin: false });
  }

  decryptInService = (text: string) => {
    // tslint:disable-next-line:no-shadowed-variable
    const { deleteFile, selectFile, services, settings } = this.props;
    const { decryptedInDSS, dssToken } = this.state;

    const decryptedFile = decryptedInDSS.file;
    const recipientId = decryptedInDSS.dssRecipient.id;
    const serviceId = decryptedInDSS.dssRecipient.serviceId;

    const service = services.getIn(["entities", serviceId]);
    const folderOut = settings.outfolder;
    const uri = decryptedFile.fullpath;

    if (service) {
      if (service.type === CRYPTOPRO_DSS && service.settings && service.settings.restURL) {
        this.setState({ dssSigning: true });

        let cmsContext = null;
        if (fileCoding(uri) === trusted.DataFormat.PEM) {
          cmsContext = fs.readFileSync(uri, "utf8");
          cmsContext = cmsContext.replace("-----BEGIN CMS-----\n", "");
          cmsContext = cmsContext.replace("\n-----END CMS-----", "");
          cmsContext = cmsContext.replace(/\n/g, "");
        } else {
          cmsContext = fs.readFileSync(uri, "base64");
        }

        const body = JSON.stringify({
          Content: cmsContext,
          Decryption: {
            CertificateId: recipientId,
            PinCode: text,
            Type: "CMS",
          },
          Name: decryptedFile.filename,
        });

        window.request.post(`${service.settings.restURL}/api/documents/decrypt`, {
          auth: {
            bearer: dssToken,
          },
          body,
          headers: {
            "content-type": "application/json",
          },
        }, (error: any, response: any, body: any) => {
          if (error) {
            this.setState({ dssSigning: false });
            this.setState({ decryptedInDSSIndex: this.state.decryptedInDSSIndex + 1 });

            throw new Error("CloudCSP.request_error");
          }
          const statusCode = response.statusCode;

          if (statusCode !== 200) {
            this.setState({ dssSigning: false });
            this.setState({ decryptedInDSSIndex: this.state.decryptedInDSSIndex + 1 });

            Materialize.toast(JSON.parse(response.body).Message, 2000, "toast-dss_status");
          } else {
            if (body && body.length) {
              const dssResponse = body;

              if (response) {
                let outURI: string;

                if (folderOut.length > 0) {
                  outURI = path.join(folderOut, path.basename(uri));
                  outURI = outURI.substring(0, outURI.lastIndexOf("."));
                } else {
                  outURI = uri.substring(0, uri.lastIndexOf("."));
                }

                let indexFile: number = 1;
                let newOutUri: string = outURI;
                while (fileExists(newOutUri)) {
                  const parsed = path.parse(outURI);

                  newOutUri = path.join(parsed.dir, parsed.name + "_(" + indexFile + ")" + parsed.ext);
                  indexFile++;
                }

                outURI = newOutUri;

                fs.writeFileSync(outURI, Buffer.from(dssResponse, "base64"));

                deleteFile(decryptedFile.id);
                selectFile(outURI);
              }
            }

            this.setState({ dssSigning: false });
            this.setState({ decryptedInDSSIndex: this.state.decryptedInDSSIndex + 1 });
          }
        });
      }
    }
  }
}

export default connect((state) => {
  return {
    certificatesLoaded: state.certificates.loaded,
    certificatesLoading: state.certificates.loading,
    connectedList: connectedSelector(state, { connected: true }),
    connections: state.connections,
    files: activeFilesSelector(state, { active: true }),
<<<<<<< HEAD
=======
    licenseLoaded: state.license.loaded,
    licenseStatus: state.license.status,
    lic_error: state.license.lic_error,
    licenseToken: state.license.data,
    mapCertificates: state.certificates,
>>>>>>> c7bf3a847e140e6a5f81d626121ff3cc3b7eb3f7
    recipients: mapToArr(state.recipients.entities).map((recipient) => state.certificates.getIn(["entities", recipient.certId])),
    settings: state.settings.encrypt,
    services: state.services,
  };
}, { deleteFile, loadAllCertificates, selectFile })(EncryptWindow);
