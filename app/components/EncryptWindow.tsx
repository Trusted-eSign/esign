import * as archiver from "archiver";
import * as fs from "fs";
import * as path from "path";
import * as React from "react";
import { connect } from "react-redux";
import { deleteFile, loadAllCertificates, selectFile } from "../AC";
import { HOME_DIR } from "../constants";
import { activeFilesSelector } from "../selectors";
import * as encrypts from "../trusted/encrypt";
import { dirExists, mapToArr } from "../utils";
import BtnsForOperation from "./BtnsForOperation";
import CertificateBlockForEncrypt from "./CertificateBlockForEncrypt";
import Dialog from "./Dialog";
import EncryptSettings from "./EncryptSettings";
import FileSelector from "./FileSelector";
import ProgressBars from "./ProgressBars";

class EncryptWindow extends React.Component<any, any> {
  static contextTypes = {
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

  constructor(props: any) {
    super(props);
  }

  componentDidMount() {
    const { certificatesLoaded, certificatesLoading, loadAllCertificates } = this.props;

    if (!certificatesLoading && !certificatesLoaded) {
      loadAllCertificates();
    }
  }

  encrypt = () => {
    const { files, settings, deleteFile, selectFile, recipients } = this.props;
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
        const archive = archiver("zip");

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
    const { files, settings, deleteFile, selectFile } = this.props;
    const { localize, locale } = this.context;

    if (files.length > 0) {
      const folderOut = settings.outfolder;
      let res = true;

      files.forEach((file) => {
        const newPath = encrypts.decryptFile(file.fullpath, folderOut);
        if (newPath) {
          deleteFile(file.id);
          selectFile(newPath);
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
        <Dialog />
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
            <BtnsForOperation
              btn_name_first={localize("Encrypt.encrypt", locale)}
              btn_name_second={localize("Encrypt.decrypt", locale)}
              operation_first={this.encrypt}
              operation_second={this.decrypt}
              operation="encrypt" />
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
    files: activeFilesSelector(state, { active: true }),
    recipients: mapToArr(state.recipients.entities).map((recipient) => state.certificates.getIn(["entities", recipient.certId])),
    settings: state.settings.encrypt,
  };
}, { deleteFile, loadAllCertificates, selectFile })(EncryptWindow);
