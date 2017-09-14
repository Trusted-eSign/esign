import * as events from "events";
import * as React from "react";
import { connect } from "react-redux";
import { selectSignerCertificate } from "../AC";
import { filteredCertificatesSelector } from "../selectors";
import BlockNotElements from "./BlockNotElements";
import CertificateInfo from "./CertificateInfo";
import CertificateList from "./CertificateList";
import HeaderWorkspaceBlock from "./HeaderWorkspaceBlock";
import ProgressBars from "./ProgressBars";
import { ToolBarWithSearch } from "./ToolBarWithSearch";

class CertificateBlockForSignature extends React.Component<any, any> {
  static contextTypes = {
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

  constructor(props: any) {
    super(props);
    this.state = ({
      modalCertList: false,
    });
  }

  activeCert = (cert: any) => {
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

  getCertificateList() {
    const { modalCertList } = this.state;

    if (!modalCertList) {
      return null;
    }

    $(".lean-overlay").remove();

    return (
      <div className={"add-cert-collection collection "}>
        <CertificateList
          activeCert={this.activeCert}
          operation="sign" />
      </div>
    );
  }

  render() {
    const { certificates, isLoading, signer } = this.props;
    const { localize, locale } = this.context;

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
      itemBar = <HeaderWorkspaceBlock text={localize("Certificate.cert_info", locale)} />;
    }

    const SETTINGS = {
      draggable: false,
    };

    return (
      <div id="cert-content" className="content-wrapper z-depth-1">
        <HeaderWorkspaceBlock text={localize("Certificate.certificate", locale)} icon="add" onСlickBtn={() => {
          this.setState({modalCertList: true});
          $("#add-cert").openModal();
        }} />
        <div className={"cert-contents " + NOT_ACTIVE_SIGNER}>
          <a className="waves-effect waves-light btn-large add-cert-btn" {...SETTINGS} onClick={() => {
            this.setState({modalCertList: true});
            $("#add-cert").openModal(); }
            }>{localize("Certificate.Select_Cert_Sign", locale)}</a>
        </div>
        {this.getCertificateInfo()}
        <div id="add-cert" className="modal cert-window">
          <div className="add-cert-content">
            <HeaderWorkspaceBlock text={localize("Certificate.certs", locale)} new_class="modal-bar" icon="close" onСlickBtn={function () {
              $("#add-cert").closeModal();
            }} />
            <div className="cert-window-content">
              <div className="col s6 m6 l6 content-item-height">
                <div className="cert-content-item">
                  <div className="content-wrapper z-depth-1">
                    <ToolBarWithSearch disable="disabled" import={(event: any) => { return; }} operation="sign" />
                    <div className="add-certs">
                      <div className="add-certs-item">
                        {this.getCertificateList()}
                        <BlockNotElements name={CERTIFICATES_ACTIVE} title={localize("Certificate.cert_not_found", locale)} />
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
                        <BlockNotElements name={NOT_ACTIVE_SIGNER} title={localize("Certificate.cert_not_select", locale)} />
                      </div>
                    </div>
                  </div>
                  <div className={"choose-cert " + ACTIVE_SIGNER}>
                    <a className="waves-effect waves-light btn-large choose-btn modal-close" >{localize("Settings.choose", locale)}</a>
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
    certificates: filteredCertificatesSelector(state, {operation: "sign"}),
    isLoaded: state.certificates.loaded,
    isLoading: state.certificates.loading,
    signer: state.certificates.getIn(["entities", state.signers.signer]),
  };
}, { selectSignerCertificate }, null, {
  pure: false})(CertificateBlockForSignature);
