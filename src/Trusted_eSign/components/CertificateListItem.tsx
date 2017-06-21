import * as React from "react";
import { CertificatesApp, certs_app } from "../module/certificates_app";
import { lang } from "../module/global_app";
import { sign, SignApp } from "../module/sign_app";

declare const $: any;

interface ICertificateListItemProps {
  chooseCert: (event: any) => void;
  selectedCert: (event: any) => void;
  operation: string;
  isOpen: boolean;
  toggleOpen: () => void;
  cert: any;
}

export class CertificateListItem extends React.Component<ICertificateListItemProps, ICertificateListItemProps> {
  constructor(props: ICertificateListItemProps) {
    super(props);
  }

  componentDidMount() {
    $(".cert-setting-item").dropdown({
      alignment: "right",
      belowOrigin: false,
      constrainWidth: false,
      gutter: 0,
      inDuration: 300,
      outDuration: 225,
    });
  }

  shouldComponentUpdate(nextProps: ICertificateListItemProps, nextState: ICertificateListItemProps) {
       return nextProps.isOpen !== this.props.isOpen;
  }

  stopEvent = (event: any) => {
    event.stopPropagation();
  }

  addCertKey = () => {
    const CLICK_EVENT = document.createEvent("MouseEvents");

    CLICK_EVENT.initEvent("click", true, true);
    document.querySelector("#cert-key-import").dispatchEvent(CLICK_EVENT);
  }

//todo FIX FIX FIX
  activeCert() {
    if (this.props.isOpen) {
      certs_app.set_certificate_for_info = this.props.cert;
      if (this.props.operation === "sign") {
        sign.set_certificate_for_info = this.props.cert;
      }
    }
  }

  render() {
    const { cert, chooseCert, operation, selectedCert, toggleOpen } = this.props;
    const STYLE = {};
    let certKeyMenu: any = null;
    let active = "";
    let doubleClick: () => void;

    let status: string;
    if (cert.status) {
      status = "status_cert_ok_icon";
    } else {
      status = "status_cert_fail_icon";
    }

    if (this.props.isOpen) {
      active = "active";
    }
    if (operation === "certificate" && !cert.privateKey && cert.provider === "SYSTEM") {
      certKeyMenu = <div key = {"i" + "_" + cert.key.toString()}>
        <i className="cert-setting-item waves-effect material-icons secondary-content"
          data-activates={"cert-key-set-file-" + cert.key} onClick={this.stopEvent}>more_vert</i>
        <ul id={"cert-key-set-file-" + cert.key} className="dropdown-content">
          <li><a onClick={this.addCertKey}>{lang.get_resource.Certificate.import_key}</a></li>
        </ul>
      </div>;
    } else {
      certKeyMenu = "";
    }

    if (operation === "sign") {
      doubleClick = selectedCert;
    }

    return <div key = {cert.id.toString()} className={"collection-item avatar certs-collection " + active} id={cert.id}
      onClick={toggleOpen}
      onDoubleClick={doubleClick}
      style={STYLE}>
      <div className="r-iconbox-link">
        <div className="r-iconbox-cert-icon"><i className={status} id="cert-status"></i></div>
        <p className="collection-title">{cert.subjectFriendlyName}</p>
        <p className="collection-info cert-info">{cert.issuerFriendlyName}</p>
      </div>
      {certKeyMenu}
      {this.activeCert()}
    </div>;
  }
}
