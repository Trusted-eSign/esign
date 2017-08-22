import * as events from "events";
import * as React from "react";
import SearchElement from "../Filters/SearchElement";
import { CertificatesApp, certs_app } from "../module/certificates_app";
import { encrypt, EncryptApp } from "../module/encrypt_app";
import { get_Certificates, lang, LangApp } from "../module/global_app";
import BlockNotElements from "./BlockNotElements";
import CertificateInfo from "./CertificateInfo";
import CertificateList from "./CertificateList";
import HeaderWorkspaceBlock from "./HeaderWorkspaceBlock";
import { ToolBarWithSearch } from "./ToolBarWithSearch";

//declare const $: any;

const DIALOG = window.electron.remote.dialog;

class AppStore extends events.EventEmitter {

}

export let application = new AppStore();

export class CertComponentsForEncrypt extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    encrypt.set_certificates = get_Certificates("encrypt");
    this.encryptChange = this.encryptChange.bind(this);
  }

  componentDidUpdate() {
    $(".nav-small-btn").dropdown({
      alignment: "right",
      belowOrigin: false,
      constrainWidth: false,
      gutter: 0,
      inDuration: 300,
      outDuration: 225,
    });
  }

  componentDidMount() {
    $(".add-cert-btn").leanModal();
    $(".nav-small-btn, .cert-btn, .cert-set-btn").dropdown({
      alignment: "left",
      belowOrigin: false,
      constrainWidth: false,
      gutter: 0,
      inDuration: 300,
      outDuration: 225,
    });
    encrypt.on(EncryptApp.SETTINGS, this.encryptChange);
  }

  componentWillUnmount() {
    encrypt.removeListener(EncryptApp.SETTINGS, this.encryptChange);
  }

  encryptChange() {
    this.setState({});
  }

  chooseCert() {
    encrypt.set_certificates_for_encrypt = encrypt.get_certificates_is_active;
  }

  activeCert = (event: any, certs: any) => {
    const ARRAY = [];
    const CERTIFICATES = encrypt.get_certificates;

    CERTIFICATES[certs.key].active = !CERTIFICATES[certs.key].active;
    encrypt.set_certificates = CERTIFICATES;
    for (const certificate of CERTIFICATES) {
      if (certificate.active) {
        ARRAY.push(certificate);
      }
    }
    encrypt.set_certificates_is_active = ARRAY;
  }

  viewCertInfo = (event: any, cert: any) => {
    encrypt.set_certificate_for_info = cert;
  }

  backViewChooseCerts = () => {
    encrypt.set_certificate_for_info = null;
  }

  removeChooseCerts = () => {
    encrypt.set_certificates_is_active = [];
    const CERTIFICATES = encrypt.get_certificates;
    for (const certificate of CERTIFICATES) {
      certificate.active = false;
    }
    encrypt.set_certificates = CERTIFICATES;
  }

  render() {
    const SELF = this;
    const CERTIFICATES_FOR_ENCRYPT = encrypt.get_certificates_for_encrypt;
    const CERTIFICATES = encrypt.get_certificates;
    const CERTIFICATES_IS_ACTIVE = encrypt.get_certificates_is_active;
    const CERTIFICATE_FOR_INFO = encrypt.get_certificate_for_info;
    const CHOOSE = CERTIFICATES_IS_ACTIVE.length < 1 || CERTIFICATE_FOR_INFO ? "not-active" : "active";
    const CHOOSE_VIEW = CERTIFICATES_IS_ACTIVE.length < 1 ? "active" : "not-active";
    const DISABLE = CERTIFICATES_IS_ACTIVE.length < 1 ? "disabled" : "";
    const NOT_ACTIVE = CERTIFICATES_FOR_ENCRYPT.length > 0 ? "not-active" : "";
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

    let certSearch = encrypt.get_certificates;
    let searchValue = encrypt.get_search_value;
    searchValue = searchValue.trim().toLowerCase();

    if (searchValue.length > 0) {
      certSearch = certSearch.filter(function(e: any) {
        return e.name.toLowerCase().match(searchValue);
      });
    }

    const NAME = certSearch.length < 1 ? "active" : "not-active";
    const VIEW = certSearch.length < 1 ? "not-active" : "";
    const SETTINGS = {
      draggable: false,
    };

    return (
      <div id="cert-content" className="content-wrapper z-depth-1">
        <CertContentToolBarForEncrypt />
        <div className={"cert-contents " + NOT_ACTIVE}>
          <a className="waves-effect waves-light btn-large add-cert-btn" {...SETTINGS} href="#add-cert">{lang.get_resource.Certificate.Select_Cert_Encrypt}</a>
        </div>
        <ChooseCertsView />
        <div id="add-cert" className="modal cert-window">
          <div className="add-cert-content">
            <HeaderWorkspaceBlock text={lang.get_resource.Certificate.certs} new_class="modal-bar" icon="close" onСlickBtn={function() {
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
                           <CertificateList activeCert = {this.viewCertInfo} operation="encrypt" />
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

class ChooseCertsView extends React.Component<any, any> {
  constructor() {
    super();
    this.encryptChange = this.encryptChange.bind(this);
  }

  componentDidMount() {
    encrypt.on(EncryptApp.SETTINGS, this.encryptChange);
  }

  componentWillUnmount() {
    encrypt.removeListener(EncryptApp.SETTINGS, this.encryptChange);
  }

  encryptChange() {
    this.setState({});
  }

  render() {
    const CERTIFICATES_FOR_ENCRYPT = encrypt.get_certificates_for_encrypt;

    if (CERTIFICATES_FOR_ENCRYPT.length > 0) {
      return <div className="cert-view-main choose-certs-view">
        <div className={"add-cert-collection collection "}>
          {CERTIFICATES_FOR_ENCRYPT.map(function(l: any, i: number) {
            let status: string;
            if (l.status) {
              status = "status_cert_ok_icon";
            } else {
              status = "status_cert_fail_icon";
            }
            return <div className="collection-item avatar certs-collection" key={i}>
              <div className="r-iconbox-link">
                <div className="r-iconbox-cert-icon"><i className={status} id="cert-status"></i></div>
                <p className="collection-title">{l.name}</p>
                <p className="collection-info cert-info">{l.issuerName}</p>
              </div>
            </div>;
          })}
        </div>
      </div>;
    } else {
      return <div></div>;
    }
  }
}

class CertContentToolBarForEncrypt extends React.Component<any, any> {
  constructor() {
    super();
    this.encryptChange = this.encryptChange.bind(this);
  }

  componentDidMount() {
    encrypt.on(EncryptApp.SETTINGS, this.encryptChange);
  }

  componentWillUnmount() {
    encrypt.removeListener(EncryptApp.SETTINGS, this.encryptChange);
  }

  encryptChange() {
    this.setState({});
  }

  removeAllChooseCerts() {
    encrypt.set_certificates_for_encrypt = [];
    encrypt.set_certificates_is_active = [];
    const CERTIFICATES = encrypt.get_certificates;

    for (const certificate of CERTIFICATES) {
      certificate.active = false;
    }
    encrypt.set_certificates = CERTIFICATES;
  }

  render() {
    const CERTIFICATES_FOR_ENCRYPT = encrypt.get_certificates_for_encrypt;
    const DISABLED = CERTIFICATES_FOR_ENCRYPT.length > 0 ? "" : "disabled";
    const ACTIVE = CERTIFICATES_FOR_ENCRYPT.length > 0 ? "active" : "not-active";

    return <nav className="app-bar-content">
      <ul className="app-bar-items">
        <li className="app-bar-item" style={{ width: "calc(100% - 85px)" }}><span>{lang.get_resource.Certificate.certs_encrypt}</span></li>
        <li className="right">
          <a className={"nav-small-btn waves-effect waves-light " + ACTIVE} onClick={function() { $("#add-cert").openModal(); }}>
            <i className="material-icons nav-small-icon">add</i>
          </a>
          <a className={"nav-small-btn waves-effect waves-light " + DISABLED} data-activates="dropdown-btn-set-cert">
            <i className="nav-small-icon material-icons">more_vert</i>
          </a>
          <ul id="dropdown-btn-set-cert" className="dropdown-content">
            <li><a onClick={this.removeAllChooseCerts.bind(this)}>{lang.get_resource.Settings.remove_list}</a></li>
          </ul>
        </li>
      </ul>
    </nav>;
  }
}
