import * as events from "events";
import * as React from "react";
import { connect } from "react-redux";
import { loadAllCertificates, selectSignerCertificate } from "../AC";
import { lang } from "../module/global_app";
import { sign } from "../module/sign_app";
import { filteredCertificatesSelector } from "../selectors";
import BlockNotElements from "./BlockNotElements";
import CertificateInfo from "./CertificateInfo";
import CertificateList from "./CertificateList";
import HeaderWorkspaceBlock from "./HeaderWorkspaceBlock";
import ProgressBars from "./ProgressBars";
import { ToolBarWithSearch } from "./ToolBarWithSearch";

class CertificateBlockForSignature extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  componentDidMount() {
    const { isLoaded, isLoading, loadAllCertificates } = this.props;

    if (!isLoading && !isLoaded) {
      loadAllCertificates();
    }
  }

  activeCert = (event: any, cert: any) => {
    const { selectSignerCertificate } = this.props;

    selectSignerCertificate(cert.id);
  }

  getCertificateInfo() {
    const { signer } = this.props;

    if (signer) {
      return (
        <div className="add-certs">
          <div className="add-certs-item">
            <CertificateInfo certificate={signer} />
          </div>
        </div>
      );
    } else {
      return (<div></div>);
    }
  }

  render() {
    const { certificates, isLoading, signer } = this.props;

    const ACTIVE_SIGNER = signer ? "active" : "not-active";
    const NOT_ACTIVE_SIGNER = signer ? "not-active" : "active";
    const CERTIFICATES_ACTIVE = certificates.length < 1 ? "active" : "not-active";
    const CERTIFICATES_NOT_ACTIVE = certificates.length < 1 ? "not-active" : "";

    if (isLoading) {
      return <ProgressBars />;
    }

    let cert: any = null;
    let itemBar: any = null;

    if (signer) {
      cert = <CertificateInfo certificate={signer} />;
      itemBar = <HeaderWorkspaceBlock text={signer.subjectFriendlyName} second_text={signer.issuerFriendlyName} />;
    } else {
      cert = "";
      itemBar = <HeaderWorkspaceBlock text={lang.get_resource.Certificate.cert_info} />;
    }

    const SETTINGS = {
      draggable: false,
    };

    return (
      <div id="cert-content" className="content-wrapper z-depth-1">
        <HeaderWorkspaceBlock text={lang.get_resource.Certificate.certificate} icon="add" onСlickBtn={function () {
          $("#add-cert").openModal();
        }} />
        <div className={"cert-contents " + NOT_ACTIVE_SIGNER}>
          <a className="waves-effect waves-light btn-large add-cert-btn" {...SETTINGS} href="#add-cert">{lang.get_resource.Certificate.Select_Cert_Sign}</a>
        </div>
        {this.getCertificateInfo()}
        <div id="add-cert" className="modal cert-window">
          <div className="add-cert-content">
            <HeaderWorkspaceBlock text={lang.get_resource.Certificate.certs} new_class="modal-bar" icon="close" onСlickBtn={function () {
              $("#add-cert").closeModal();
            }} />
            <div className="cert-window-content">
              <div className="col s6 m6 l6 content-item-height" style={{ paddingRight: 0 }}>
                <div className="cert-content-item">
                  <div className="content-wrapper z-depth-1">
                    <ToolBarWithSearch disable="disabled" import={(event: any) => { return; }} operation="sign" />
                    <div className="add-certs">
                      <div className="add-certs-item">
                        <div className={"add-cert-collection collection " + CERTIFICATES_NOT_ACTIVE}>
                          <CertificateList
                            activeCert={this.activeCert}
                            operation="sign" />
                        </div>
                        <BlockNotElements name={CERTIFICATES_ACTIVE} title={lang.get_resource.Certificate.cert_not_found} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col s6 m6 l6 content-item-height">
                <div className={"cert-content-item-height " + ACTIVE_SIGNER}>
                  <div className="content-wrapper z-depth-1">
                    {itemBar}
                    <div className="add-certs">
                      <div className="add-certs-item">
                        {cert}
                        <BlockNotElements name={NOT_ACTIVE_SIGNER} title={lang.get_resource.Certificate.cert_not_select} />
                      </div>
                    </div>
                  </div>
                  <div className={"choose-cert " + ACTIVE_SIGNER}>
                    <a className="waves-effect waves-light btn-large choose-btn modal-close" >{lang.get_resource.Settings.choose}</a>
                  </div>
                </div>
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
    certificates: filteredCertificatesSelector(state),
    isLoaded: state.certificates.loaded,
    isLoading: state.certificates.loading,
    signer: state.certificates.getIn(["entities", state.signers.signer]),
  };
}, { loadAllCertificates, selectSignerCertificate })(CertificateBlockForSignature);
