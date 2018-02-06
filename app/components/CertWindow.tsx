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
import CSR from "./CSR";
import HeaderWorkspaceBlock from "./HeaderWorkspaceBlock";
import Modal from "./Modal";
import ProgressBars from "./ProgressBars";
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

    let certificate: trusted.pki.Certificate;
    let providerType: string = PROVIDER_SYSTEM;

    try {
      certificate = trusted.pki.Certificate.load(path, format);
    } catch (e) {
      $(".toast-cert_load_failed").remove();
      Materialize.toast(localize("Certificate.cert_load_failed", locale), 2000, "toast-cert_load_failed");

      return;
    }

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

  p12Import = (event: any) => {
    const { certificates } = this.props;
    const { localize, locale } = this.context;

    const P12_PATH = event[0].path;
    let p12: trusted.pki.Pkcs12;
    const certCount = certificates.length;

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
        if (!window.PKISTORE.importPkcs12(P12_PATH, this.state.pass_value)) {
          $(".toast-cert_import_failed").remove();
          Materialize.toast(localize("Certificate.cert_import_failed", locale), 2000, "toast-cert_import_failed");
        } else {
          if (certCount === certificates.length) {
            $(".toast-cert_imported").remove();
            Materialize.toast(localize("Certificate.cert_imported", locale), 2000, ".toast-cert_imported");
          } else {
            $(".toast-cert_import_ok").remove();
            Materialize.toast(localize("Certificate.cert_import_ok", locale), 2000, "toast-cert_import_ok");
          }

        }
      },
      dismissible: false,
    });
  }

  importCertKey = (event: any) => {
    if (isEncryptedKey(event[0].path)) {
      $("#get-password").openModal({
        complete() {
          this.importCertKeyHelper(event[0].path, this.state.pass_value);
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
                <ToolBarWithSearch operation="certificate" disable="" reloadCertificates={this.handleReloadCertificates} rightBtnAction={
                  (event: any) => {
                    this.handleCertificateImport(event.target.files);
                  }
                } />
                <div id="modal-createCertificateRequest" className="modal cert-window">
                  <div className="add-cert-content">
                    <HeaderWorkspaceBlock text={localize("CSR.create_selfSigned", locale)} new_class="modal-bar" icon="close" onСlickBtn={() => {
                      $("#modal-createCertificateRequest").closeModal();
                    }} />
                    <CSR />
                  </div>
                </div>
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
              </div>
            </div>
          </div>
        </div>
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
