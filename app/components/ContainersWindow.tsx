import * as events from "events";
import * as os from "os";
import PropTypes from "prop-types";
import * as React from "react";
import { connect } from "react-redux";
import { getCertificateFromContainer, loadAllCertificates, loadAllContainers, removeAllCertificates } from "../AC";
import { PROVIDER_CRYPTOPRO, PROVIDER_MICROSOFT, PROVIDER_SYSTEM } from "../constants";
import { filteredContainersSelector } from "../selectors";
import { fileCoding } from "../utils";
import { mapToArr } from "../utils";
import BlockNotElements from "./BlockNotElements";
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

class ContainersWindow extends React.Component<any, any> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  handleInstallCertificate = () => {
    const { certificatesLoading, container, loadAllCertificates, removeAllCertificates } = this.props;
    const { localize, locale } = this.context;

    if (!container.certificate) {
      return;
    }

    try {
      trusted.utils.Csp.installCertifiacteFromContainer(container.name, 75, "Crypto-Pro GOST R 34.10-2001 Cryptographic Service Provider");
    } catch (e) {
      Materialize.toast(localize("Certificate.cert_import_failed", locale), 2000, "toast-cert_import_error");
    }

    removeAllCertificates();

    if (!certificatesLoading) {
      loadAllCertificates();
    }

    Materialize.toast(localize("Certificate.cert_import_ok", locale), 2000, "toast-cert_imported");
  }

  getInstallButton() {
    const { container } = this.props;
    const { localize, locale } = this.context;

    if (!container) {
      return (
        null
      );
    }

    return (
    <div className={"choose-cert"}>
        <a className="waves-effect waves-light btn-large choose-btn " onClick={this.handleInstallCertificate}>{localize("Containers.installCertificate", locale)}</a>
    </div>);
  }


  getCertificateInfoBody() {
    const { container, getCertificateFromContainer } = this.props;
    const { localize, locale } = this.context;

    if (!container) {
      return (
        <BlockNotElements name={"active"} title={localize("Containers.contNotSelected", locale)} />
      );
    }

    if (!container.certificateLoading && !container.certificateLoaded) {
      getCertificateFromContainer(container.id);
    }

    if (!container.certificate || container.certificateLoading) {
      return <ProgressBars />;
    }

    return (
      <div className="add-certs">
        <CertificateInfo certificate={container.certificateItem} />
      </div>
    );
  }

  render() {
    const { container, containers, isLoading, certificatesLoading } = this.props;
    const { localize, locale } = this.context;

    if (isLoading || certificatesLoading) {
      return <ProgressBars />;
    }

    const block = containers.length > 0 ? "not-active" : "active";
    const active = container ? "active" : "not-active";
    const view = containers.length < 1 ? "not-active" : "";
    const disabled = container ? "" : "disabled";

    return (
      <div className="main">
        <div className="content">
          <div className="col s6 m6 l6 content-item-height">
            <div className="cert-content-item">
              <div className="content-wrapper z-depth-1">
                <ToolBarWithSearch disable="disabled" import={(event: any) => { return; }} operation="containers" />
                <div className="add-certs">
                  <BlockNotElements name={block} title={localize("Containers.containersNotFound", locale)} />
                  <div className={"add-cert-collection collection " + view}>
                    <ContainersList />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col s6 m6 l6 content-item-height">
            <div className={"file-content-height " + active}>
              <div className="content-wrapper z-depth-1">
                <nav className="app-bar-cert">
                  <ul className="app-bar-items">
                    <li className="cert-bar-text">
                      <div className="collection-title">{localize("Containers.certificateInfo", locale)}</div>
                    </li>
                  </ul>
                </nav>
                {this.getCertificateInfoBody()}
                {this.getInstallButton()}
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
    certificatesLoading: state.certificates.loading,
    container: state.containers.getIn(["entities", state.containers.active]),
    containers: filteredContainersSelector(state),
    isLoaded: state.containers.loaded,
    isLoading: state.containers.loading,
  };
}, { getCertificateFromContainer, loadAllCertificates, loadAllContainers, removeAllCertificates })(ContainersWindow);
