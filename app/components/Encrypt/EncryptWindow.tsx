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
import * as jwt from "../../trusted/jwt";
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
      dssSigning: false,
      dssToken: "",
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
    const { connectedList, connections, files, settings, deleteFile, selectFile, licenseStatus, lic_error } = this.props;
    const { localize, locale } = this.context;

    if (licenseStatus !== true) {
      $(".toast-jwtErrorLicense").remove();
      Materialize.toast(localize(jwt.getErrorMessage(lic_error), locale), 5000, "toast-jwtErrorLicense");

      logger.log({
        level: "error",
        message: "No correct license",
        operation: "Расшифрование",
        operationObject: {
          in: "License",
          out: "Null",
        },
        userName: USER_NAME,
      });

      return;
    }

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

      files.forEach((file) => {
        let certWithKey: trusted.pki.Certificate;

        try {
          const uri = file.fullpath;
          const format = fileCoding(uri);
          const cipher = new trusted.pki.Cipher();
          const ris = cipher.getRecipientInfos(uri, format);

          let ri: trusted.cms.CmsRecipientInfo;

          for (let i = 0; i < ris.length; i++) {
            ri = ris.items(i);

            certWithKey = this.props.mapCertificates
              .get("entities")
              .find((item) => item.service === CRYPTOPRO_DSS && item.serial === ri.serialNumber);

            if (certWithKey) {
              break;
            }
          }
        } catch (e) {
          //
        }

        if (certWithKey) {
          this.setState({ serviceId: certWithKey.serviceId, decryptedFile: file, recipientId: certWithKey.id });
          this.handleShowModalServiceSignParams();

          return;
        }

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
  }

  render() {
    const { localize, locale } = this.context;
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
    const { serviceId, showModalServiceSignParams } = this.state;
    const { services } = this.props;

    if (!showModalServiceSignParams || !serviceId) {
      return;
    }

    const service = services.getIn(["entities", serviceId]);

    if (service && service.type === CRYPTOPRO_DSS) {
      return (
        <Modal
          isOpen={showModalServiceSignParams}
          header={localize("Services.cryptopro_dss", locale)}
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
    const { showModalDssPin } = this.state;

    if (!showModalDssPin) {
      return;
    }

    return (
      <Modal
        isOpen={showModalDssPin}
        header={localize("Services.pin_code_for_container", locale)}
        onClose={this.handleCloseModalDssPin} style={{
          width: "70%",
        }}>

        <PinCodeForDssContainer done={this.decryptInService} onCancel={this.handleCloseModalDssPin} text={""} />
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
    const { decryptedFile, dssToken, recipientId, serviceId } = this.state;

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

            throw new Error("CloudCSP.request_error");
          }
          const statusCode = response.statusCode;

          if (statusCode !== 200) {
            this.setState({ dssSigning: false });

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
    licenseLoaded: state.license.loaded,
    licenseStatus: state.license.status,
    lic_error: state.license.lic_error,
    licenseToken: state.license.data,
    mapCertificates: state.certificates,
    recipients: mapToArr(state.recipients.entities).map((recipient) => state.certificates.getIn(["entities", recipient.certId])),
    settings: state.settings.encrypt,
    services: state.services,
  };
}, { deleteFile, loadAllCertificates, selectFile })(EncryptWindow);
