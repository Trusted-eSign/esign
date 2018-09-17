import * as fs from "fs";
import * as path from "path";
import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { deleteFile, loadAllCertificates, selectFile } from "../../AC";
import { HOME_DIR, USER_NAME } from "../../constants";
import { activeFilesSelector, connectedSelector } from "../../selectors";
import { DECRYPTED, ENCRYPTED } from "../../server/constants";
import * as encrypts from "../../trusted/encrypt";
import { dirExists, mapToArr } from "../../utils";
import logger from "../../winstonLogger";
import CertificateBlockForEncrypt from "../Certificate/CertificateBlockForEncrypt";
import FileSelector from "../Files/FileSelector";
import ProgressBars from "../ProgressBars";
import EncryptButtons from "./EncryptButtons";
import EncryptSettings from "./EncryptSettings";

class EncryptWindow extends React.Component<any, any> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

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

      files.forEach((file) => {
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

    if (certificatesLoading) {
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
        </div>
      </div>
    );
  }
}

export default connect((state) => {
  return {
    certificatesLoaded: state.certificates.loaded,
    certificatesLoading: state.certificates.loading,
    connectedList: connectedSelector(state, { connected: true }),
    connections: state.connections,
    files: activeFilesSelector(state, { active: true }),
    recipients: mapToArr(state.recipients.entities).map((recipient) => state.certificates.getIn(["entities", recipient.certId])),
    settings: state.settings.encrypt,
  };
}, { deleteFile, loadAllCertificates, selectFile })(EncryptWindow);
