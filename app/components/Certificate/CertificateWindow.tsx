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
import { filteredCrlsSelector } from "../../selectors/crlsSelectors";
import { fileCoding } from "../../utils";
import logger from "../../winstonLogger";
import BlockNotElements from "../BlockNotElements";
import CloudCSP from "../CloudCSP/CloudCSP";
import CRLDelete from "../CRL/CRLDelete";
import CRLExport from "../CRL/CRLExport";
import CRLInfo from "../CRL/CRLInfo";
import CRLList from "../CRL/CRLList";
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

const MODAL_DELETE_CERTIFICATE = "MODAL_DELETE_CERTIFICATE";
const MODAL_EXPORT_CERTIFICATE = "MODAL_EXPORT_CERTIFICATE";
const MODAL_EXPORT_CRL = "MODAL_EXPORT_CRL";
const MODAL_DELETE_CRL = "MODAL_DELETE_CRL";
const MODAL_CERTIFICATE_REQUEST = "MODAL_CERTIFICATE_REQUEST";
const MODAL_CLOUD_CSP = "MODAL_CLOUD_CSP";

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
      crl: null,
      importingCertificate: null,
      importingCertificatePath: null,
      password: "",
      showDialogInstallRootCertificate: false,
      showModalCertificateRequest: false,
      showModalCloudCSP: false,
      showModalDeleteCRL: false,
      showModalDeleteCertifiacte: false,
      showModalExportCRL: false,
      showModalExportCertifiacte: false,
    });
  }

  handleShowModalByType = (typeOfModal: string) => {
    switch (typeOfModal) {
      case MODAL_DELETE_CERTIFICATE:
        this.setState({ showModalDeleteCertifiacte: true });
        break;
      case MODAL_EXPORT_CERTIFICATE:
        this.setState({ showModalExportCertifiacte: true });
        break;
      case MODAL_EXPORT_CRL:
        this.setState({ showModalExportCRL: true });
        break;
      case MODAL_DELETE_CRL:
        this.setState({ showModalDeleteCRL: true });
        break;
      case MODAL_CERTIFICATE_REQUEST:
        this.setState({ showModalCertificateRequest: true });
        break;
      case MODAL_CLOUD_CSP:
        this.setState({ showModalCloudCSP: true });
        break;
      default:
        return;
    }
  }

  handleCloseModalByType = (typeOfModal: string): void => {
    switch (typeOfModal) {
      case MODAL_DELETE_CERTIFICATE:
        this.setState({ showModalDeleteCertifiacte: false });
        break;
      case MODAL_EXPORT_CERTIFICATE:
        this.setState({ showModalExportCertifiacte: false });
        break;
      case MODAL_EXPORT_CRL:
        this.setState({ showModalExportCRL: false });
        break;
      case MODAL_DELETE_CRL:
        this.setState({ showModalDeleteCRL: false });
        break;
      case MODAL_CERTIFICATE_REQUEST:
        this.setState({ showModalCertificateRequest: false });
        break;
      case MODAL_CLOUD_CSP:
        this.setState({ showModalCloudCSP: false });
        break;
      default:
        return;
    }
  }

  handleCloseModals = () => {
    this.setState({
      showModalCertificateRequest: false,
      showModalCloudCSP: false,
      showModalDeleteCRL: false,
      showModalDeleteCertifiacte: false,
      showModalExportCRL: false,
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

  handlePasswordChange = (password: string) => {
    this.setState({ password });
  }

  handleChangeActiveTab = (certInfoTab: boolean) => {
    this.setState({
      activeCertInfoTab: certInfoTab,
    });
  }

  handleActiveCert = (certificate: any) => {
    this.setState({ certificate, crl: null });
  }

  handleActiveCRL = (crl: any) => {
    this.setState({ certificate: null, crl });
  }

  handleReloadCertificates = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { isLoading, loadAllCertificates, removeAllCertificates } = this.props;

    this.setState({ certificate: null });

    removeAllCertificates();

    if (!isLoading) {
      loadAllCertificates();
    }

    this.handleCloseModals();
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

    this.handleCloseModals();
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

      const storeName = isSelfSigned ? "mROOT" : "mCA";

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

  getCertificateOrCRLInfo() {
    const { certificate, crl } = this.state;
    const { localize, locale } = this.context;

    if (certificate) {
      return this.getCertificateInfoBody();
    } else if (crl) {
      return this.getCRLInfoBody();
    } else {
      return <BlockNotElements name={"active"} title={localize("Certificate.cert_not_select", locale)} />;
    }
  }

  getCertificateInfoBody() {
    const { activeCertInfoTab, certificate } = this.state;
    const { localize, locale } = this.context;

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

  getCRLInfoBody() {
    const { crl } = this.state;

    return (
      <div className="add-certs">
        <div className="add-certs-item">
          <CRLInfo crl={crl} />
        </div>
      </div>
    );
  }

  getTitle() {
    const { certificate, crl } = this.state;
    const { localize, locale } = this.context;

    let title: any = null;

    if (certificate) {
      title = <div className="cert-title-main">
        <div className="collection-title cert-title">{certificate.subjectFriendlyName}</div>
        <div className="collection-info cert-info cert-title">{certificate.issuerFriendlyName}</div>
      </div>;
    } else if (crl) {
      title = (
        <div className="cert-title-main">
          <div className="collection-title cert-title">{crl.issuerFriendlyName}</div>
        </div>);
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
        onClose={() => this.handleCloseModalByType(MODAL_DELETE_CERTIFICATE)}>

        <CertificateDelete
          certificate={certificate}
          onCancel={() => this.handleCloseModalByType(MODAL_DELETE_CERTIFICATE)}
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
        onClose={() => this.handleCloseModalByType(MODAL_EXPORT_CERTIFICATE)}>

        <CertificateExport
          certificate={certificate}
          onSuccess={() => this.handleCloseModalByType(MODAL_EXPORT_CERTIFICATE)}
          onCancel={() => this.handleCloseModalByType(MODAL_EXPORT_CERTIFICATE)}
          onFail={() => this.handleCloseModalByType(MODAL_EXPORT_CERTIFICATE)} />
      </Modal>
    );
  }

  showModalExportCRL = () => {
    const { localize, locale } = this.context;
    const { crl, showModalExportCRL } = this.state;

    if (!crl || !showModalExportCRL) {
      return;
    }

    return (
      <Modal
        isOpen={showModalExportCRL}
        header={localize("CRL.export_crl", locale)}
        onClose={() => this.handleCloseModalByType(MODAL_EXPORT_CRL)}>

        <CRLExport
          crl={crl}
          onSuccess={() => this.handleCloseModalByType(MODAL_EXPORT_CRL)}
          onCancel={() => this.handleCloseModalByType(MODAL_EXPORT_CRL)}
          onFail={() => this.handleCloseModalByType(MODAL_EXPORT_CRL)} />
      </Modal>
    );
  }

  showModalDeleteCrl = () => {
    const { localize, locale } = this.context;
    const { crl, showModalDeleteCRL } = this.state;

    if (!crl || !showModalDeleteCRL) {
      return;
    }

    return (
      <Modal
        isOpen={showModalDeleteCRL}
        header={localize("CRL.delete_crl", locale)}
        onClose={() => this.handleCloseModalByType(MODAL_DELETE_CRL)}>

        <CRLDelete
          crl={crl}
          onCancel={() => this.handleCloseModalByType(MODAL_DELETE_CRL)}
          reloadCertificates={this.handleReloadCertificates} />
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
        onClose={() => this.handleCloseModalByType(MODAL_CERTIFICATE_REQUEST)}>

        <CertificateRequest
          certificateTemplate={certificateTemplate}
          onCancel={() => this.handleCloseModalByType(MODAL_CERTIFICATE_REQUEST)}
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
        onClose={() => this.handleCloseModalByType(MODAL_CLOUD_CSP)}>

        <CloudCSP onCancel={() => this.handleCloseModalByType(MODAL_CLOUD_CSP)} />
      </Modal>
    );
  }

  render() {
    // tslint:disable-next-line:no-shadowed-variable
    const { resetCloudCSP } = this.props;
    const { certificates, cloudCSPState, crls, isLoading, isLoadingFromDSS } = this.props;
    const { certificate, crl } = this.state;
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
    const NAME = certificates.length < 1 && crls.length < 1 ? "active" : "not-active";
    const VIEW = certificates.length < 1 && crls.length < 1 ? "not-active" : "";
    const DISABLED = certificate || crl ? "" : "disabled";

    return (
      <div className="main">
        <div className="content">
          <div className="col s6 m6 l6 content-item-height">
            <div className="cert-content-item">
              <div className="content-wrapper z-depth-1">
                <ToolBarWithSearch operation="certificate" disable=""
                  reloadCertificates={this.handleReloadCertificates}
                  handleShowModalCertificateRequest={() => this.handleShowModalByType(MODAL_CERTIFICATE_REQUEST)}
                  handleShowModalCloudCSP={() => this.handleShowModalByType(MODAL_CLOUD_CSP)}
                  rightBtnAction={
                    (event: any) => {
                      this.handleCertificateImport(event.target.files);
                    }
                  } />
                <div className="add-certs">
                  <div className="add-certs-item">
                    <div className={"add-cert-collection collection " + VIEW}>
                      <CertificateList activeCert={this.handleActiveCert} operation="certificate" />
                      <CRLList activeCert={this.handleActiveCRL} />
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
                        {
                          certificate ?
                            <React.Fragment>
                              <li><a onClick={() => this.handleShowModalByType(MODAL_EXPORT_CERTIFICATE)}>{localize("Certificate.cert_export", locale)}</a></li>
                              <li><a onClick={() => this.handleShowModalByType(MODAL_DELETE_CERTIFICATE)}>{localize("Common.delete", locale)}</a></li>
                            </React.Fragment>
                            : null
                        }
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
                        {
                          crl ?
                            <li>
                              <a onClick={() => this.handleShowModalByType(MODAL_EXPORT_CRL)}>{localize("Certificate.cert_export", locale)}</a>
                              <li><a onClick={() => this.handleShowModalByType(MODAL_DELETE_CRL)}>{localize("Common.delete", locale)}</a></li>
                            </li>
                            :
                            null
                        }
                      </ul>
                    </li>
                  </ul>
                </nav>
                {this.getCertificateOrCRLInfo()}
                {this.showModalDeleteCertificate()}
                {this.showModalExportCertificate()}
                {this.showModalExportCRL()}
                {this.showModalDeleteCrl()}
                {this.showModalCertificateRequest()}
                {this.showModalCloudCSP()}
              </div>
              {
                certificate && certificate.category === REQUEST ?
                  <RequestButtons onCopy={() => this.handleShowModalByType(MODAL_CERTIFICATE_REQUEST)} /> : null
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
    crls: filteredCrlsSelector(state),
    isLoading: state.certificates.loading,
    isLoadingFromDSS: state.cloudCSP.loading,
  };
}, { loadAllCertificates, loadAllContainers, removeAllCertificates, removeAllContainers, resetCloudCSP })(CertWindow);
