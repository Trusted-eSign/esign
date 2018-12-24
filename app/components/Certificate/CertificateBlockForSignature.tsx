import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { selectSignerCertificate, verifyCertificate } from "../../AC";
import { filteredCertificatesSelector } from "../../selectors";
import BlockNotElements from "../BlockNotElements";
import HeaderWorkspaceBlock from "../HeaderWorkspaceBlock";
import ProgressBars from "../ProgressBars";
import { ToolBarWithSearch } from "../ToolBarWithSearch";
import CertificateInfo from "./CertificateInfo";
import CertificateList from "./CertificateList";

class CertificateBlockForSignature extends React.Component<any, any> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: any) {
    super(props);
    this.state = ({
      modalCertList: false,
      selectedSigner: "",
    });
  }

  activeCert = (cert: any) => {
    this.setState({ selectedSigner: cert });
  }

  handleChooseSigner = () => {
    const { selectSignerCertificate } = this.props;
    const { selectedSigner } = this.state;

    selectSignerCertificate(selectedSigner.id);
  }

  getCertificateInfo() {
    const { signer, verifyCertificate } = this.props;

    let curStatusStyle;
    let curKeyStyle = signer.key.length > 0 ? "key " : "";

    if (curKeyStyle) {
      curKeyStyle += signer.service === "MEGAFON" ? "megafonkey" : "localkey";
    }

    if (signer && !signer.verified) {
      verifyCertificate(signer.id);
    }

    if (signer && signer.status) {
      curStatusStyle = "cert_status_ok";
    } else {
      curStatusStyle = "cert_status_error";
    }

    if (signer) {
      return (
        <div className="add-certs">
          <div className="add-certs-item">
            <div className="row">
              <div className="col s11">
                <CertificateInfo certificate={signer} />
              </div>
              <div className="col s1">
                <div className={curStatusStyle} />
                <div className={curKeyStyle} style={{ "margin-top": "10px" }} />
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (null);
    }
  }

  getCertificateList() {
    const { certificates } = this.props;
    const { modalCertList } = this.state;
    const { localize, locale } = this.context;

    if (!modalCertList) {
      return null;
    }

    $(".lean-overlay").remove();

    if (!certificates.length) {
      return (
        <BlockNotElements name={"active"} title={localize("Certificate.cert_not_found", locale)} />
      );
    }

    return (
      <div className={"add-cert-collection collection small_cert_collection"}>
        <CertificateList
          activeCert={this.activeCert}
          operation="sign" />
      </div>
    );
  }

  getSignerCertificateInfo() {
    const { selectedSigner } = this.state;
    const { localize, locale } = this.context;

    if (!selectedSigner) {
      return <BlockNotElements name={"active"} title={localize("Certificate.cert_not_select", locale)} />;
    }

    return <CertificateInfo certificate={selectedSigner} />;
  }

  render() {
    const { isLoading, signer } = this.props;
    const { selectedSigner } = this.state;
    const { localize, locale } = this.context;

    const ACTIVE_SIGNER = selectedSigner ? "active" : "not-active";
    const NOT_ACTIVE_SIGNER = signer ? "not-active" : "active";

    if (isLoading) {
      return <ProgressBars />;
    }

    let itemBar: any = null;
    let icon = "";

    if (signer) {
      icon = "add";
    }

    if (selectedSigner) {
      itemBar = <HeaderWorkspaceBlock text={selectedSigner.subjectFriendlyName} second_text={selectedSigner.issuerFriendlyName} />;
    } else {
      itemBar = <HeaderWorkspaceBlock text={localize("Certificate.cert_info", locale)} />;
    }

    const SETTINGS = {
      draggable: false,
    };

    return (
      <div id="cert-content" className="content-wrapper z-depth-1">
        <HeaderWorkspaceBlock text={localize("Certificate.certificate", locale)} icon={icon} onСlickBtn={() => {
          this.setState({ modalCertList: true });
          $("#add-cert").openModal();
        }} />
        <div className={"cert-contents " + NOT_ACTIVE_SIGNER}>
          <a className="waves-effect waves-light btn-large add-cert-btn" {...SETTINGS} onClick={() => {
            this.setState({ modalCertList: true });
            $("#add-cert").openModal();
          }
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
                    <ToolBarWithSearch operation="sign" />
                    <div className="add-certs">
                      <div className="add-certs-item">
                        {this.getCertificateList()}
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
                        {this.getSignerCertificateInfo()}
                      </div>
                    </div>
                  </div>
                  <div className={"choose-cert " + ACTIVE_SIGNER}>
                    <a className="waves-effect waves-light btn-large choose-btn modal-close" onClick={this.handleChooseSigner}>{localize("Settings.choose", locale)}</a>
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
    certificates: filteredCertificatesSelector(state, { operation: "sign" }),
    isLoaded: state.certificates.loaded,
    isLoading: state.certificates.loading,
    signer: state.certificates.getIn(["entities", state.signers.signer]),
  };
}, { selectSignerCertificate, verifyCertificate }, null, { pure: false })(CertificateBlockForSignature);
