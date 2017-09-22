import * as events from "events";
import * as React from "react";
import { connect } from "react-redux";
import { addRecipientCertificate, deleteRecipient} from "../AC";
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
  static contextTypes = {
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

  constructor(props: any) {
    super(props);

    this.state = ({
      activeCertificate: null,
      modalCertList: false,
   });
  }

  componentDidMount() {
    $(".nav-small-btn").dropdown({
      alignment: "left",
      belowOrigin: false,
      constrainWidth: false,
      gutter: 0,
      inDuration: 300,
      outDuration: 225,
    });
  }

  activeCert = (cert: any) => {
    // tslint:disable-next-line:no-shadowed-variable
    const { addRecipientCertificate } = this.props;

    addRecipientCertificate(cert.id);
  }

  handleActiveCert = (certificate: any) => {
    this.setState({activeCertificate: certificate});
  }

  backViewChooseCerts = () => {
    this.setState({activeCertificate: null});
  }

  handleCleanList = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { deleteRecipient, recipients } = this.props;

    recipients.forEach((recipient) => deleteRecipient(recipient.certId));
  }

  getCertificateList() {
    const { modalCertList } = this.state;

    if (!modalCertList) {
      return null;
    }

    $(".lean-overlay").remove();

    return (
      <div className={"add-cert-collection collection small_cert_collection"}>
        <CertificateList activeCert={this.activeCert} operation="encrypt" />
      </div>
    );
  }

  render() {
    const { certificates, isLoading, recipients } = this.props;
    const { localize, locale } = this.context;

    if (isLoading) {
      return <ProgressBars />;
    }

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
      title = <span>{localize("Certificate.certs_getters", locale)}</span>;
      activeButton = <li className="right">
        <a className={"nav-small-btn waves-effect waves-light " + DISABLE} data-activates="dropdown-btn-certlist">
          <i className="nav-small-icon material-icons">more_vert</i>
        </a>
        <ul id="dropdown-btn-certlist" className="dropdown-content">
          <li><a onClick={this.handleCleanList}>{localize("Settings.remove_list", locale)}</a></li>
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
        <ToolBarForEncryptCertificateBlock certificates={certificates} handleCleanList={this.handleCleanList}/>
        <div className={"cert-contents " + NOT_ACTIVE}>
          <a className="waves-effect waves-light btn-large add-cert-btn" {...SETTINGS} onClick={() => {
            this.setState({modalCertList: true});
            return $("#add-cert").openModal(); }
            }>{localize("Certificate.Select_Cert_Encrypt", locale)}</a>
        </div>
        <RecipientsList dialogType='window'/>
        <div id="add-cert" className="modal cert-window">
          <div className="add-cert-content">
            <HeaderWorkspaceBlock text={localize("Certificate.certs", locale)} new_class="modal-bar" icon="close" onСlickBtn={() => {
              $("#add-cert").closeModal();
            }} />
            <div className="cert-window-content">
              <div className="col s6 m6 l6 content-item-height">
                <div className="cert-content-item">
                  <div className="content-wrapper z-depth-1">
                    <ToolBarWithSearch disable="disabled" import={(event: any) => { return; }} operation="encrypt" />
                    <div className="add-certs">
                      <div className="add-certs-item">
                        {this.getCertificateList()}
                        <BlockNotElements name={NAME} title={localize("Certificate.cert_not_found", locale)} />
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
                        <div className={"add-cert-collection choose-cert-collection " + CHOOSE}>
                          <RecipientsList onActive = {this.handleActiveCert} dialogType='modal'/>
                        </div>
                        {cert}
                        <BlockNotElements name={CHOOSE_VIEW} title={localize("Certificate.cert_not_select", locale)} />
                      </div>
                    </div>
                  </div>
                  <div className={"choose-cert " + CHOOSE}>
                    <a className="waves-effect waves-light btn choose-cert-btn modal-close" onClick={this.chooseCert}>{localize("Settings.choose", locale)}</a>
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
    certificates: filteredCertificatesSelector(state, {operation: "encrypt"}),
    isLoaded: state.certificates.loaded,
    isLoading: state.certificates.loading,
    recipients: mapToArr(state.recipients.entities),
  };
}, { addRecipientCertificate, deleteRecipient }, null, {pure: false})(CertificateBlockForEncrypt);
