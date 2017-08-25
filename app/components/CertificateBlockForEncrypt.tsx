import * as events from "events";
import * as React from "react";
import { connect } from "react-redux";
import { addRecipientCertificate, deleteRecipient} from "../AC";
import { lang } from "../module/global_app";
import { filteredCertificatesSelector } from "../selectors";
import { extFile, mapToArr } from "../utils";
import BlockNotElements from "./BlockNotElements";
import CertificateInfo from "./CertificateInfo";
import CertificateList from "./CertificateList";
import HeaderWorkspaceBlock from "./HeaderWorkspaceBlock";
import ProgressBars from "./ProgressBars";
import RecipientsList from "./RecipientsList";
import ToolBarForEncryptCertificateBlock from "./ToolBarForEncryptCertificateBlock";
import { ToolBarWithSearch } from "./ToolBarWithSearch";

class CertificateBlockForEncrypt extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = ({
      activeCertificate: null,
   });
  }

  activeCert = (cert: any) => {
    const { addRecipientCertificate } = this.props;

   //this.handleActiveCert(cert);
    addRecipientCertificate(cert.id);
  }

  handleActiveCert = (certificate: any) => {
    this.setState({activeCertificate: certificate});
  }

  backViewChooseCerts = () => {
    this.setState({activeCertificate: null});
  }

  removeChooseCerts = () => {
    const { deleteRecipient, recipients } = this.props;

    recipients.forEach((recipient) => deleteRecipient(recipient.certId));
  }

  render() {
    const { certificates, isLoading, recipients } = this.props;

    if (isLoading) {
      return <ProgressBars />;
    }

    const CERTIFICATES_FOR_ENCRYPT = recipients;
    const CERTIFICATES_IS_ACTIVE = certificates;
    const CERTIFICATE_FOR_INFO = this.state.activeCertificate;
    const CHOOSE = !CERTIFICATES_IS_ACTIVE || CERTIFICATE_FOR_INFO ? "not-active" : "active";
    const CHOOSE_VIEW = !CERTIFICATES_IS_ACTIVE ? "active" : "not-active";
    const DISABLE = !CERTIFICATES_IS_ACTIVE ? "disabled" : "";
    const NOT_ACTIVE = recipients && recipients.length > 0 ? "not-active" : "";
    let activeButton: any = null;
    let cert: any = null;
    let title: any = null;

    if (CERTIFICATE_FOR_INFO) {
      cert = <CertificateInfo certificate={CERTIFICATE_FOR_INFO} />;
      title = <div className="cert-title-main">
        <div className="collection-title cert-title">{CERTIFICATE_FOR_INFO.subjectFriendlyName}</div>
        <div className="collection-info cert-info cert-title">{CERTIFICATE_FOR_INFO.issuerFriendlyName}</div>
      </div>;
      activeButton = <li className="right">
        <a className="nav-small-btn waves-effect waves-light" onClick={this.backViewChooseCerts}>
          <i className="nav-small-icon material-icons">arrow_back</i>
        </a>
      </li>;
    } else {
      cert = "";
      title = <span>{lang.get_resource.Certificate.certs_getters}</span>;
      activeButton = <li className="right">
        <a className={"nav-small-btn waves-effect waves-light " + DISABLE} data-activates="dropdown-btn-certlist">
          <i className="nav-small-icon material-icons">more_vert</i>
        </a>
        <ul id="dropdown-btn-certlist" className="dropdown-content">
          <li><a onClick={this.removeChooseCerts}>{lang.get_resource.Settings.remove_list}</a></li>
        </ul>
      </li>;
    }

    const NAME = certificates < 1 ? "active" : "not-active";
    const VIEW = certificates < 1 ? "not-active" : "";
    const SETTINGS = {
      draggable: false,
    };

    return (
      <div id="cert-content" className="content-wrapper z-depth-1">
        <ToolBarForEncryptCertificateBlock certificates={certificates} />
        <div className={"cert-contents " + "not-active"}>
          <a className="waves-effect waves-light btn-large add-cert-btn" {...SETTINGS} onClick={() => {$("#add-cert").openModal(); }}>{lang.get_resource.Certificate.Select_Cert_Encrypt}</a>
        </div>
        <RecipientsList />
        <div id="add-cert" className="modal cert-window">
          <div className="add-cert-content">
            <HeaderWorkspaceBlock text={lang.get_resource.Certificate.certs} new_class="modal-bar" icon="close" onСlickBtn={() => {
              $("#add-cert").closeModal();
            }} />
            <div className="cert-window-content">
              <div className="col s6 m6 l6 content-item-height" style={{ paddingRight: 0 }}>
                <div className="cert-content-item">
                  <div className="content-wrapper z-depth-1">
                    <ToolBarWithSearch disable="disabled" import={(event: any) => { return; }} operation="encrypt" />
                    <div className="add-certs">
                      <div className="add-certs-item">
                        <div className={"add-cert-collection collection " + VIEW}>
                          <CertificateList activeCert = {this.activeCert} operation="encrypt" />
                        </div>
                        <BlockNotElements name={NAME} title={lang.get_resource.Certificate.cert_not_found} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col s6 m6 l6 content-item-height">
                <div className={"cert-content-item-height " + CHOOSE}>
                  <div className="content-wrapper z-depth-1">
                    <nav className="app-bar-cert">
                      <ul className="app-bar-items">
                        <li className="cert-bar-text">
                          {title}
                        </li>
                        {activeButton}
                      </ul>
                    </nav>
                    <div className="add-certs">
                      <div className="add-certs-item">
                        <div className={"add-cert-collection choose-cert-collection collection " + CHOOSE}>
                          <CertificateList activeCert = {this.handleActiveCert} operation="encrypt" />
                        </div>
                        {cert}
                        <BlockNotElements name={CHOOSE_VIEW} title={lang.get_resource.Certificate.cert_not_select} />
                      </div>
                    </div>
                  </div>
                  <div className={"choose-cert " + CHOOSE}>
                    <a className="waves-effect waves-light btn choose-cert-btn modal-close" onClick={this.chooseCert}>{lang.get_resource.Settings.choose}</a>
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
    recipients: mapToArr(state.recipients).forEach((recipient) => state.certificates.getIn(["entities", recipient])),
  };
}, { addRecipientCertificate, deleteRecipient })(CertificateBlockForEncrypt);
