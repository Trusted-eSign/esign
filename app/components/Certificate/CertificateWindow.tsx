import * as os from "os";
import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { loadAllCertificates, loadAllContainers, removeAllCertificates, removeAllContainers } from "../../AC";
import { resetCloudCSP } from "../../AC/cloudCspActions";
import {
  ADDRESS_BOOK, CA, DEFAULT_CSR_PATH, PROVIDER_CRYPTOPRO,
  PROVIDER_MICROSOFT, REQUEST, ROOT, USER_NAME,
} from "../../constants";
import { filteredCertificatesSelector } from "../../selectors";
import { fileCoding } from "../../utils";
import logger from "../../winstonLogger";
import BlockNotElements from "../BlockNotElements";
import CloudCSP from "../CloudCSP/CloudCSP";
import Dialog from "../Dialog";
import Modal from "../Modal";
import PasswordDialog from "../PasswordDialog";
import ProgressBars from "../ProgressBars";
import CertificateRequest from "../Request/CertificateRequest";
import RequestButtons from "../Request/RequestButtons";
import { ToolBarWithSearch } from "../ToolBarWithSearch";
import CertificateChainInfo from "./CertificateChainInfo";
import CertificateDelete from "./CertificateDelete";
import CertificateExport from "./CertificateExport";
import CertificateInfo from "./CertificateInfo";
import CertificateInfoTabs from "./CertificateInfoTabs";
import CertificateList from "./CertificateList";

const OS_TYPE = os.type();

class CertWindow extends React.Component<any, any> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: any) {
    super(props);

    this.state = ({
      activeCertInfoTab: true,
      certificate: null,
      importingCertificate: null,
      importingCertificatePath: null,
      password: "",
      showDialogInstallRootCertificate: false,
      showModalCertificateRequest: false,
      showModalCloudCSP: false,
      showModalDeleteCertifiacte: false,
      showModalExportCertifiacte: false,
    });
  }

  handleCloseDialogInstallRootCertificate = () => {
    this.setState({ showDialogInstallRootCertificate: false });
  }

  handleShowDialogInstallRootCertificate = (path: string, certificate: trusted.pki.Certificate) => {
    this.setState({
      importingCertificate: certificate,
      importingCertificatePath: path,
      showDialogInstallRootCertificate: true,
    });
  }

  handleCloseModalDeleteCertificate = () => {
    this.setState({ showModalDeleteCertifiacte: false });
  }

  handleShowModalDeleteCertifiacte = () => {
    this.setState({ showModalDeleteCertifiacte: true });
  }

  handleCloseModalExportCertificate = () => {
    this.setState({ showModalExportCertifiacte: false });
  }

  handleShowModalExportCertifiacte = () => {
    this.setState({ showModalExportCertifiacte: true });
  }

  handleCloseModalCertificateRequest = () => {
    this.setState({ showModalCertificateRequest: false });
  }

  handleShowModalCertificateRequest = () => {
    this.setState({ showModalCertificateRequest: true });
  }

  handleCloseModalCloudCSP = () => {
    this.setState({ showModalCloudCSP: false });
  }

  handleShowModalCloudCSP = () => {
    this.setState({ showModalCloudCSP: true });
  }

  handlePasswordChange = (password: string) => {
    this.setState({ password });
  }

  handleChangeActiveTab = (certInfoTab: boolean) => {
    this.setState({
      activeCertInfoTab: certInfoTab,
    });
  }

  handleActiveCert = (certificate: any) => {
    this.setState({ certificate });
  }

  handleReloadCertificates = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { isLoading, loadAllCertificates, removeAllCertificates } = this.props;

    this.setState({ certificate: null });

    removeAllCertificates();

    if (!isLoading) {
      loadAllCertificates();
    }

    this.handleCloseModalDeleteCertificate();
  }

  handleReloadContainers = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { isLoading, loadAllContainers, removeAllContainers } = this.props;

    this.setState({
      container: null,
      deleteContainer: false,
    });

    removeAllContainers();

    if (!isLoading) {
      loadAllContainers();
    }

    this.handleCloseModalDeleteCertificate();
  }

  handleCertificateImport = (event: any) => {
    const { localize, locale } = this.context;
    // tslint:disable-next-line:no-shadowed-variable
    const { isLoading, loadAllCertificates, removeAllCertificates } = this.props;
    const path = event[0].path;
    const format: trusted.DataFormat = fileCoding(path);
    let container = "";

    let certificate: trusted.pki.Certificate;
    let providerType: string;

    try {
      certificate = trusted.pki.Certificate.load(path, format);
    } catch (e) {
      this.p12Import(event);

      return;
    }

    const bCA = certificate.isCA;
    const selfSigned = certificate.isSelfSigned;

    if (OS_TYPE === "Windows_NT") {
      providerType = PROVIDER_MICROSOFT;
    } else {
      providerType = PROVIDER_CRYPTOPRO;
    }

    try {
      container = trusted.utils.Csp.getContainerNameByCertificate(certificate);
    } catch (e) {
      //
    }

    if (container) {
      try {
        trusted.utils.Csp.installCertificateToContainer(certificate, container, 75);
        trusted.utils.Csp.installCertificateFromContainer(container, 75, "Crypto-Pro GOST R 34.10-2001 Cryptographic Service Provider");

        Materialize.toast(localize("Certificate.cert_import_ok", locale), 2000, "toast-cert_imported");

        logger.log({
          certificate: certificate.subjectName,
          level: "info",
          message: "",
          operation: "Импорт сертификата",
          operationObject: {
            in: "CN=" + certificate.subjectFriendlyName,
            out: "Null",
          },
          userName: USER_NAME,
        });
      } catch (err) {
        Materialize.toast(localize("Certificate.cert_import_failed", locale), 2000, "toast-cert_import_error");

        logger.log({
          certificate: certificate.subjectName,
          level: "error",
          message: err.message ? err.message : err,
          operation: "Импорт сертификата",
          operationObject: {
            in: "CN=" + certificate.subjectFriendlyName,
            out: "Null",
          },
          userName: USER_NAME,
        });

        return;
      }
    } else if (!bCA) {
      window.PKISTORE.importCertificate(certificate, providerType, (err: Error) => {
        if (err) {
          Materialize.toast(localize("Certificate.cert_import_failed", locale), 2000, "toast-cert_import_error");
        }
      }, ADDRESS_BOOK);

      Materialize.toast(localize("Certificate.cert_import_ok", locale), 2000, "toast-cert_imported");

      logger.log({
        certificate: certificate.subjectName,
        level: "info",
        message: "",
        operation: "Импорт сертификата",
        operationObject: {
          in: "CN=" + certificate.subjectFriendlyName,
          out: "Null",
        },
        userName: USER_NAME,
      });
    }

    if (selfSigned || bCA) {
      this.handleShowDialogInstallRootCertificate(path, certificate);
    } else {
      removeAllCertificates();

      if (!isLoading) {
        loadAllCertificates();
      }
    }
  }

  handleInstallTrustedCertificate = () => {
    const { localize, locale } = this.context;
    // tslint:disable-next-line:no-shadowed-variable
    const { isLoading, loadAllCertificates, removeAllCertificates } = this.props;
    const { importingCertificate, importingCertificatePath } = this.state;

    this.handleCloseDialogInstallRootCertificate();

    const isSelfSigned = importingCertificate.isSelfSigned;

    if (OS_TYPE === "Windows_NT") {
      const storeName = isSelfSigned ? ROOT : CA;

      window.PKISTORE.importCertificate(importingCertificate, PROVIDER_MICROSOFT, (err: Error) => {
        if (err) {

          logger.log({
            certificate: importingCertificate.subjectName,
            level: "error",
            message: err.message ? err.message : "",
            operation: "Импорт сертификата",
            operationObject: {
              in: "CN=" + importingCertificate.subjectFriendlyName,
              out: "Null",
            },
            userName: USER_NAME,
          });

          Materialize.toast(localize("Certificate.cert_import_failed", locale), 2000, "toast-cert_import_error");
        } else {
          removeAllCertificates();

          if (!isLoading) {
            loadAllCertificates();
          }

          logger.log({
            certificate: importingCertificate.subjectName,
            level: "info",
            message: "",
            operation: "Импорт сертификата",
            operationObject: {
              in: "CN=" + importingCertificate.subjectFriendlyName,
              out: "Null",
            },
            userName: USER_NAME,
          });

          Materialize.toast(localize("Certificate.cert_trusted_import_ok", locale), 2000, "toast-cert_trusted_import_ok");
        }
      }, storeName);
    } else if (importingCertificatePath) {
      let certmgrPath = "";

      if (OS_TYPE === "Darwin") {
        certmgrPath = "/opt/cprocsp/bin/certmgr";
      } else {
        certmgrPath = os.arch() === "ia32" ? "/opt/cprocsp/bin/ia32/certmgr" : "/opt/cprocsp/bin/amd64/certmgr";
      }

      const storeName = isSelfSigned ? "uROOT" : "uCA";

      // tslint:disable-next-line:quotemark
      const cmd = "sh -c " + "\"" + certmgrPath + ' -install -store ' + "'" + storeName + "'" + ' -file ' + "'" + importingCertificatePath + "'" + "\"";

      const options = {
        name: "CryptoARM GOST",
      };

      window.sudo.exec(cmd, options, function (err: Error) {
        if (err) {

          logger.log({
            certificate: importingCertificate.subjectName,
            level: "error",
            message: err.message ? err.message : "",
            operation: "Импорт сертификата",
            operationObject: {
              in: "CN=" + importingCertificate.subjectFriendlyName,
              out: "Null",
            },
            userName: USER_NAME,
          });

          Materialize.toast(localize("Certificate.cert_trusted_import_failed", locale), 2000, "toast-cert_trusted_import_failed");
        } else {
          removeAllCertificates();

          if (!isLoading) {
            loadAllCertificates();
          }

          logger.log({
            certificate: importingCertificate.subjectName,
            level: "info",
            message: "",
            operation: "Импорт сертификата",
            operationObject: {
              in: "CN=" + importingCertificate.subjectFriendlyName,
              out: "Null",
            },
            userName: USER_NAME,
          });

          Materialize.toast(localize("Certificate.cert_trusted_import_ok", locale), 2000, "toast-cert_trusted_import_ok");
        }
      });
    }
  }

  p12Import = (event: any) => {
    const { localize, locale } = this.context;
    const self = this;

    const P12_PATH = event[0].path;
    let p12: trusted.pki.Pkcs12 | undefined;

    try {
      p12 = trusted.pki.Pkcs12.load(P12_PATH);
    } catch (e) {
      p12 = undefined;
    }

    if (!p12) {
      $(".toast-cert_load_failed").remove();
      Materialize.toast(localize("Certificate.cert_load_failed", locale), 2000, "toast-cert_load_failed");

      return;
    }

    $("#get-password").openModal({
      complete() {
        try {
          if (p12) {
            trusted.utils.Csp.importPkcs12(p12, self.state.password);
          }

          self.handlePasswordChange("");

          self.props.removeAllCertificates();

          if (!self.props.isLoading) {
            self.props.loadAllCertificates();
          }

          $(".toast-cert_import_ok").remove();
          Materialize.toast(localize("Certificate.cert_import_ok", locale), 2000, ".toast-cert_import_ok");

          logger.log({
            certificate: "",
            level: "info",
            message: "",
            operation: "Импорт PKCS12",
            operationObject: {
              in: path.basename(P12_PATH),
              out: "Null",
            },
            userName: USER_NAME,
          });
        } catch (err) {
          self.handlePasswordChange("");

          $(".toast-cert_import_failed").remove();
          Materialize.toast(localize("Certificate.cert_import_failed", locale), 2000, "toast-cert_import_failed");

          logger.log({
            certificate: "",
            level: "error",
            message: err.message ? err.message : err,
            operation: "Импорт PKCS12",
            operationObject: {
              in: path.basename(P12_PATH),
              out: "Null",
            },
            userName: USER_NAME,
          });
        }
      },
      dismissible: false,
    });
  }

  importCertKey = (event: any) => {
    if (isEncryptedKey(event[0].path)) {
      $("#get-password").openModal({
        complete() {
          this.importCertKeyHelper(event[0].path, this.state.password);
        },
        dismissible: false,
      });
    } else {
      this.importCertKeyHelper(event[0].path, "");
    }
  }

  importCertKeyHelper(path: string, pass: string) {
    $("#cert-key-import").val("");

    const { certificates } = this.props;
    const { localize, locale } = this.context;

    const KEY_PATH = path;
    const CERTIFICATES = certificates;
    const RES = window.PKISTORE.importKey(KEY_PATH, pass);
    let key = 0;

    if (RES) {
      for (let i: number = 0; i < CERTIFICATES.length; i++) {
        if (CERTIFICATES[i].active) {
          CERTIFICATES[i].privateKey = true;
          key = i;
        }
      }

      $(".toast-key_import_ok").remove();
      Materialize.toast(localize("Certificate.key_import_ok", locale), 2000, "toast-key_import_ok");
    } else {
      $(".toast-key_import_failed").remove();
      Materialize.toast(localize("Certificate.key_import_failed", locale), 2000, "toast-key_import_failed");
    }
  }

  getCertificateInfoBody() {
    const { activeCertInfoTab, certificate } = this.state;
    const { localize, locale } = this.context;

    if (!certificate) {
      return (
        <BlockNotElements name={"active"} title={localize("Certificate.cert_not_select", locale)} />
      );
    }

    let cert: any = null;

    if (certificate && activeCertInfoTab) {
      cert = <CertificateInfo certificate={certificate} />;
    } else if (certificate) {
      cert = (
        <React.Fragment>
          <a className="collection-info chain-info-blue">{localize("Certificate.cert_chain_status", locale)}</a>
          <div className="collection-info chain-status">{certificate.status ? localize("Certificate.cert_chain_status_true", locale) : localize("Certificate.cert_chain_status_false", locale)}</div>
          <a className="collection-info cert-info-blue">{localize("Certificate.cert_chain_info", locale)}</a>
          <CertificateChainInfo certificate={certificate} key={"chain_" + certificate.id} style="" onClick={() => { return; }} />
        </React.Fragment>
      );
    }

    return (
      <div className="add-certs">
        <CertificateInfoTabs activeCertInfoTab={this.handleChangeActiveTab} />
        <div className="add-certs-item">
          {cert}
        </div>
      </div>
    );
  }

  getTitle() {
    const { certificate } = this.state;
    const { localize, locale } = this.context;

    let title: any = null;

    if (certificate) {
      title = <div className="cert-title-main">
        <div className="collection-title cert-title">{certificate.subjectFriendlyName}</div>
        <div className="collection-info cert-info cert-title">{certificate.issuerFriendlyName}</div>
      </div>;
    } else {
      title = <span>{localize("Certificate.cert_info", locale)}</span>;
    }

    return title;
  }

  showModalDeleteCertificate = () => {
    const { localize, locale } = this.context;
    const { certificate, showModalDeleteCertifiacte } = this.state;

    if (!certificate || !showModalDeleteCertifiacte) {
      return;
    }

    return (
      <Modal
        isOpen={showModalDeleteCertifiacte}
        header={localize("Certificate.delete_certificate", locale)}
        onClose={this.handleCloseModalDeleteCertificate}>

        <CertificateDelete
          certificate={certificate}
          onCancel={this.handleCloseModalDeleteCertificate}
          reloadCertificates={this.handleReloadCertificates}
          reloadContainers={this.handleReloadContainers} />
      </Modal>
    );
  }

  showModalExportCertificate = () => {
    const { localize, locale } = this.context;
    const { certificate, showModalExportCertifiacte } = this.state;

    if (!certificate || !showModalExportCertifiacte) {
      return;
    }

    return (
      <Modal
        isOpen={showModalExportCertifiacte}
        header={localize("Export.export_certificate", locale)}
        onClose={this.handleCloseModalExportCertificate}>

        <CertificateExport
          certificate={certificate}
          onSuccess={this.handleCloseModalExportCertificate}
          onCancel={this.handleCloseModalExportCertificate}
          onFail={this.handleCloseModalExportCertificate} />
      </Modal>
    );
  }

  showModalCertificateRequest = () => {
    const { localize, locale } = this.context;
    const { certificate, showModalCertificateRequest } = this.state;

    if (!showModalCertificateRequest) {
      return;
    }

    const certificateTemplate = certificate && certificate.category === REQUEST ? certificate : undefined;

    return (
      <Modal
        isOpen={showModalCertificateRequest}
        header={localize("CSR.create_request", locale)}
        onClose={this.handleCloseModalCertificateRequest}>

        <CertificateRequest
          certificateTemplate={certificateTemplate}
          onCancel={this.handleCloseModalCertificateRequest}
          selfSigned={false}
        />
      </Modal>
    );
  }

  showModalCloudCSP = () => {
    const { localize, locale } = this.context;
    const { showModalCloudCSP } = this.state;

    if (!showModalCloudCSP) {
      return;
    }

    return (
      <Modal
        isOpen={showModalCloudCSP}
        header={localize("CloudCSP.cloudCSP", locale)}
        onClose={this.handleCloseModalCloudCSP}>

        <CloudCSP onCancel={this.handleCloseModalCloudCSP} />
      </Modal>
    );
  }

  render() {
    // tslint:disable-next-line:no-shadowed-variable
    const { resetCloudCSP } = this.props;
    const { certificates, cloudCSPState, isLoading, isLoadingFromDSS } = this.props;
    const { certificate } = this.state;
    const { localize, locale } = this.context;

    if (isLoading || isLoadingFromDSS) {
      return <ProgressBars />;
    }

    if (cloudCSPState.loaded) {
      if (cloudCSPState.error) {
        Materialize.toast(localize("CloudCSP.request_error", locale), 2000, "toast-request_error");
      }

      if (cloudCSPState.statusCode !== 200) {
        Materialize.toast(`${localize("CloudCSP.request_error", locale)} : ${cloudCSPState.statusCode}`, 2000, "toast-request_error");
      } else {
        if (cloudCSPState.allCertificatesInstalled) {
          Materialize.toast(localize("CloudCSP.certificates_import_success", locale), 2000, "toast-certificates_import_success");
        } else {
          Materialize.toast(localize("CloudCSP.certificates_import_fail", locale), 2000, "toast-certificates_import_fail");
        }

        this.handleReloadCertificates();
      }

      resetCloudCSP();
    }

    const ACTIVE_CERTIFICATE_REQUEST = certificate && certificate.category === REQUEST ? "active" : "not-active";
    const NAME = certificates.length < 1 ? "active" : "not-active";
    const VIEW = certificates.length < 1 ? "not-active" : "";
    const DISABLED = certificate ? "" : "disabled";

    return (
      <div className="main">
        <div className="content">
          <div className="col s6 m6 l6 content-item-height">
            <div className="cert-content-item">
              <div className="content-wrapper z-depth-1">
                <ToolBarWithSearch operation="certificate" disable=""
                  reloadCertificates={this.handleReloadCertificates}
                  handleShowModalCertificateRequest={this.handleShowModalCertificateRequest}
                  handleShowModalCloudCSP={this.handleShowModalCloudCSP}
                  rightBtnAction={
                    (event: any) => {
                      this.handleCertificateImport(event.target.files);
                    }
                  } />
                <div className="add-certs">
                  <div className="add-certs-item">
                    <div className={"add-cert-collection collection " + VIEW}>
                      <input type="file" className="input-file" id="cert-key-import" onChange={
                        (event: any) => {
                          this.importCertKey(event.target.files);
                        }
                      } />
                      <CertificateList activeCert={this.handleActiveCert} operation="certificate" />
                    </div>
                    <BlockNotElements name={NAME} title={localize("Certificate.cert_not_found", locale)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col s6 m6 l6 content-item-height">
            <div className={"cert-content-item-height " + ACTIVE_CERTIFICATE_REQUEST}>
              <div className="content-wrapper z-depth-1">
                <nav className="app-bar-cert">
                  <ul className="app-bar-items">
                    <li className="cert-bar-text">
                      {this.getTitle()}
                    </li>
                    <li className="right">
                      <a className={"nav-small-btn waves-effect waves-light " + DISABLED} data-activates="dropdown-btn-for-cert">
                        <i className="nav-small-icon material-icons cert-settings">more_vert</i>
                      </a>
                      <ul id="dropdown-btn-for-cert" className="dropdown-content">
                        <li><a onClick={this.handleShowModalExportCertifiacte}>{localize("Certificate.cert_export", locale)}</a></li>
                        <li><a onClick={this.handleShowModalDeleteCertifiacte}>{localize("Common.delete", locale)}</a></li>
                        {
                          certificate && certificate.category === REQUEST ?
                            <li>
                              <a onClick={this.handleOpenCSRFolder}>
                                {localize("CSR.go_to_csr_folder", locale)}
                              </a>
                            </li>
                            :
                            null
                        }
                      </ul>
                    </li>
                  </ul>
                </nav>
                {this.getCertificateInfoBody()}
                {this.showModalDeleteCertificate()}
                {this.showModalExportCertificate()}
                {this.showModalCertificateRequest()}
                {this.showModalCloudCSP()}
              </div>
              {
                certificate && certificate.category === REQUEST ?
                  <RequestButtons onCopy={() => this.handleShowModalCertificateRequest()} /> : null
              }
            </div>
          </div>
        </div>
        <Dialog isOpen={this.state.showDialogInstallRootCertificate}
          header="Внимание!" body="Для установки корневых сертификатов требуются права администратора. Продолжить?"
          onYes={this.handleInstallTrustedCertificate} onNo={this.handleCloseDialogInstallRootCertificate} />
        <PasswordDialog value={this.state.password} onChange={this.handlePasswordChange} />
      </div>
    );
  }

  handleOpenCSRFolder = () => {
    window.electron.shell.openItem(DEFAULT_CSR_PATH);
  }
}

export default connect((state) => {
  return {
    certificates: filteredCertificatesSelector(state, { operation: "certificate" }),
    cloudCSPState: state.cloudCSP,
    containersLoading: state.containers.loading,
    isLoading: state.certificates.loading,
    isLoadingFromDSS: state.cloudCSP.loading,
  };
}, { loadAllCertificates, loadAllContainers, removeAllCertificates, removeAllContainers, resetCloudCSP })(CertWindow);
