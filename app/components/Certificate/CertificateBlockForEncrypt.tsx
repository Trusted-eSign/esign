import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { addRecipientCertificate, deleteRecipient, verifyCertificate } from "../../AC";
import { filteredCertificatesSelector } from "../../selectors";
import { mapToArr } from "../../utils";
import BlockNotElements from "../BlockNotElements";
import HeaderWorkspaceBlock from "../HeaderWorkspaceBlock";
import ProgressBars from "../ProgressBars";
import RecipientsList from "../RecipientsList";
import ToolBarForEncryptCertificateBlock from "../ToolBarForEncryptCertificateBlock";
import { ToolBarWithSearch } from "../ToolBarWithSearch";
import CertificateInfo from "./CertificateInfo";
import CertificateList from "./CertificateList";

class CertificateBlockForEncrypt extends React.Component<any, any> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: any) {
    super(props);

    this.state = ({
      activeCertificate: null,
      modalCertList: false,
      selectedRecipients: props.recipients,
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

    // tslint:disable-next-line:no-shadowed-variable
    const { verifyCertificate, recipients } = this.props;

    if (recipients && recipients.length) {
      for (const recipient of recipients) {
        if (recipient && !recipient.verified) {
          verifyCertificate(recipient.id);
        }
      }
    }
  }

  handleAddRecipient = (cert: any) => {
    if (!this.state.selectedRecipients.includes(cert)) {
      this.setState({
        selectedRecipients: [...this.state.selectedRecipients, cert],
      });
    }
  }

  handleRemoveRecipient = (cert: any) => {
    this.setState({
      selectedRecipients: this.state.selectedRecipients.filter((item: object) => item !== cert),
    });
  }

  handleActiveCert = (certificate: any) => {
    this.setState({ activeCertificate: certificate });
  }

  handleChooseRecipients = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { addRecipientCertificate } = this.props;
    const { selectedRecipients } = this.state;

    this.handleCleanRecipientsList();

    for (const recipient of selectedRecipients) {
      addRecipientCertificate(recipient.id);
    }

    this.setState({ modalCertList: false });

    $("#add-cert").closeModal();
  }

  backViewChooseCerts = () => {
    this.setState({ activeCertificate: null });
  }

  handleCleanStateList = () => {
    this.setState({
      selectedRecipients: [],
    });
  }

  handleCleanRecipientsList = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { deleteRecipient, recipients } = this.props;

    recipients.forEach((recipient) => deleteRecipient(recipient.id));
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
        <CertificateList activeCert={this.handleAddRecipient} operation="encrypt" />
      </div>
    );
  }

  getChooseButton() {
    const { localize, locale } = this.context;

    if (this.state.activeCertificate) {
      return null;
    }

    return (
      <div className={"choose-cert active"}>
        <a className="waves-effect waves-light btn choose-cert-btn modal-close" onClick={
          this.handleChooseRecipients
        }>
          {localize("Settings.choose", locale)}
        </a>
      </div>
    );
  }

  render() {
    const { selectedRecipients } = this.state;
    const { certificates, isLoading, recipients } = this.props;
    const { localize, locale } = this.context;

    if (isLoading) {
      return <ProgressBars />;
    }

    const CERTIFICATES_IS_ACTIVE = certificates;
    const CERTIFICATE_FOR_INFO = this.state.activeCertificate;
    const CHOOSE = !selectedRecipients || !selectedRecipients.length || CERTIFICATE_FOR_INFO ? "not-active" : "active";
    const CHOOSE_VIEW = !selectedRecipients || !selectedRecipients.length ? "active" : "not-active";
    const NOT_ACTIVE = recipients && recipients.length > 0 ? "not-active" : "";
    const NOT_ACTIVE_RIGTH_BTN = !selectedRecipients || !selectedRecipients.length ? "not-active" : "";
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
        <a className={"nav-small-btn waves-effect waves-light " + NOT_ACTIVE_RIGTH_BTN} data-activates="dropdown-btn-certlist">
          <i className="nav-small-icon material-icons">more_vert</i>
        </a>
        <ul id="dropdown-btn-certlist" className="dropdown-content">
          <li><a onClick={this.handleCleanStateList}>{localize("Settings.remove_list", locale)}</a></li>
        </ul>
      </li>;
    }

    const SETTINGS = {
      draggable: false,
    };

    return (
      <div id="cert-content" className="content-wrapper z-depth-1">
        <ToolBarForEncryptCertificateBlock certificates={certificates} recipients={recipients}
          onСlickBtn={() => {
            this.setState({ modalCertList: true });
            $("#add-cert").openModal();
          }}
          handleCleanRecipientsList={() => {
            this.handleCleanStateList();
            this.handleCleanRecipientsList();
          }} />
        <div className={"cert-contents " + NOT_ACTIVE}>
          <a className="waves-effect waves-light btn-large add-cert-btn" {...SETTINGS} onClick={() => {
            this.setState({ modalCertList: true });
            return $("#add-cert").openModal();
          }
          }>{localize("Certificate.Select_Cert_Encrypt", locale)}</a>
        </div>
        <RecipientsList dialogType="window" recipients={recipients} />
        <div id="add-cert" className="modal cert-window">
          <div className="add-cert-content">
            <HeaderWorkspaceBlock text={localize("Certificate.certs", locale)} new_class="modal-bar" icon="close" onСlickBtn={() => {
              this.setState({ modalCertList: false, selectedRecipients: recipients });
              $("#add-cert").closeModal();
            }} />
            <div className="cert-window-content">
              <div className="col s6 m6 l6 content-item-height">
                <div className="cert-content-item">
                  <div className="content-wrapper z-depth-1">
                    <ToolBarWithSearch operation="encrypt" />
                    <div className="add-certs">
                      <div className="add-certs-item">
                        {this.getCertificateList()}
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
                          <RecipientsList onActive={this.handleActiveCert} handleRemoveRecipient={this.handleRemoveRecipient} dialogType="modal" recipients={selectedRecipients} />
                        </div>
                        {cert}
                        <BlockNotElements name={CHOOSE_VIEW} title={localize("Certificate.cert_not_select", locale)} />
                      </div>
                    </div>
                  </div>
                  {this.getChooseButton()}
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
    certificates: filteredCertificatesSelector(state, { operation: "encrypt" }),
    isLoaded: state.certificates.loaded,
    isLoading: state.certificates.loading,
    recipients: mapToArr(state.recipients.entities)
      .map((recipient) => state.certificates.getIn(["entities", recipient.certId]))
      .filter((recipient) => recipient !== undefined),
  };
}, { addRecipientCertificate, deleteRecipient, verifyCertificate }, null, { pure: false })(CertificateBlockForEncrypt);
