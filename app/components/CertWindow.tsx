import * as events from "events";
import * as os from "os";
import PropTypes from "prop-types";
import * as React from "react";
import { connect } from "react-redux";
import { loadAllCertificates, loadAllContainers, removeAllCertificates, removeAllContainers } from "../AC";
import { PROVIDER_CRYPTOPRO, PROVIDER_MICROSOFT, PROVIDER_SYSTEM } from "../constants";
import { filteredCertificatesSelector } from "../selectors";
import { fileCoding } from "../utils";
import BlockNotElements from "./BlockNotElements";
import CertificateDelete from "./Certificate/CertificateDelete";
import CertificateExport from "./Certificate/CertificateExport";
import CertificateChainInfo from "./CertificateChainInfo";
import CertificateInfo from "./CertificateInfo";
import CertificateInfoTabs from "./CertificateInfoTabs";
import CertificateList from "./CertificateList";
import ContainersList from "./ContainersList";
import HeaderWorkspaceBlock from "./HeaderWorkspaceBlock";
import Modal from "./Modal";
import PasswordDialog from "./PasswordDialog";
import ProgressBars from "./ProgressBars";
import CertificateRequest from "./Request/CertificateRequest";
import { ToolBarWithSearch } from "./ToolBarWithSearch";

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
      password: "",
      showModalCertificateRequest: false,
      showModalDeleteCertifiacte: false,
      showModalExportCertifiacte: false,
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
    const { isLoading, loadAllCertificates, removeAllCertificates } = this.props;

    this.setState({ certificate: null });

    removeAllCertificates();

    if (!isLoading) {
      loadAllCertificates();
    }

    this.handleCloseModalDeleteCertificate();
  }

  handleReloadContainers = () => {
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
    const { isLoading, loadAllCertificates, removeAllCertificates } = this.props;
    const path = event[0].path;
    const format: trusted.DataFormat = fileCoding(path);
    const OS_TYPE = os.type();
    let container = "";

    let certificate: trusted.pki.Certificate;
    let providerType: string = PROVIDER_SYSTEM;

    try {
      certificate = trusted.pki.Certificate.load(path, format);
    } catch (e) {
      this.p12Import(event);

      return;
    }

    try {
      container = trusted.utils.Csp.getContainerNameByCertificate(certificate);
    } catch (e) {
      //
    }

    if (container) {
      try {
        trusted.utils.Csp.installCertifiacteToContainer(certificate, container, 75);
        trusted.utils.Csp.installCertifiacteFromContainer(container, 75, "Crypto-Pro GOST R 34.10-2001 Cryptographic Service Provider");

        removeAllCertificates();

        if (!isLoading) {
          loadAllCertificates();
        }

        Materialize.toast(localize("Certificate.cert_import_ok", locale), 2000, "toast-cert_imported");
      } catch (e) {
        Materialize.toast(localize("Certificate.cert_import_failed", locale), 2000, "toast-cert_import_error");

        return;
      }
    } else {
      if (OS_TYPE === "Windows_NT") {
        providerType = PROVIDER_MICROSOFT;
      } else {
        providerType = PROVIDER_CRYPTOPRO;
      }

      window.PKISTORE.importCertificate(certificate, providerType, (err: Error) => {
        if (err) {
          Materialize.toast(localize("Certificate.cert_import_failed", locale), 2000, "toast-cert_import_error");
        } else {
          removeAllCertificates();

          if (!isLoading) {
            loadAllCertificates();
          }

          Materialize.toast(localize("Certificate.cert_import_ok", locale), 2000, "toast-cert_imported");
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
          trusted.utils.Csp.importPkcs12(p12, self.state.password);

          self.handlePasswordChange("");

          self.props.removeAllCertificates();

          if (!self.props.isLoading) {
            self.props.loadAllCertificates();
          }

          $(".toast-cert_import_ok").remove();
          Materialize.toast(localize("Certificate.cert_import_ok", locale), 2000, ".toast-cert_import_ok");
        } catch (e) {
          self.handlePasswordChange("");

          $(".toast-cert_import_failed").remove();
          Materialize.toast(localize("Certificate.cert_import_failed", locale), 2000, "toast-cert_import_failed");
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
        <div>
          <a className="collection-info chain-info-blue">{localize("Certificate.cert_chain_status", locale)}</a>
          <div className="collection-info chain-status">{certificate.status ? localize("Certificate.cert_chain_status_true", locale) : localize("Certificate.cert_chain_status_false", locale)}</div>
          <a className="collection-info cert-info-blue">{localize("Certificate.cert_chain_info", locale)}</a>
          <CertificateChainInfo certificate={certificate} key={"chain_" + certificate.id} style="" onClick={() => { return; }} />
        </div>
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
    const { activeTabIsCertInfo, certificate } = this.state;
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
    const { certificate, container, deleteContainer, showModalDeleteCertifiacte } = this.state;

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
    const { showModalCertificateRequest } = this.state;

    if (!showModalCertificateRequest) {
      return;
    }

    return (
      <Modal
        isOpen={showModalCertificateRequest}
        header={localize("CSR.create_request", locale)}
        onClose={this.handleCloseModalCertificateRequest}>

        <CertificateRequest
          onCancel={this.handleCloseModalCertificateRequest}
          selfSigned={false}
        />
      </Modal>
    );
  }

  render() {
    const { certificates, isLoading } = this.props;
    const { activeTabIsCertInfo, certificate } = this.state;
    const { localize, locale } = this.context;

    if (isLoading) {
      return <ProgressBars />;
    }

    const CURRENT = certificate ? "not-active" : "active";
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
            <div className="cert-content-item-height">
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
                      </ul>
                    </li>
                  </ul>
                </nav>
                {this.getCertificateInfoBody()}
                {this.showModalDeleteCertificate()}
                {this.showModalExportCertificate()}
                {this.showModalCertificateRequest()}
              </div>
            </div>
          </div>
        </div>
        <PasswordDialog value={this.state.password} onChange={this.handlePasswordChange} />
      </div>
    );
  }
}

export default connect((state) => {
  return {
    certificates: filteredCertificatesSelector(state, { operation: "certificate" }),
    containersLoading: state.containers.loading,
    isLoading: state.certificates.loading,
  };
}, { loadAllCertificates, loadAllContainers, removeAllCertificates, removeAllContainers })(CertWindow);
