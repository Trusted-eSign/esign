import * as React from "react";
import { sign } from "../module/sign_app";

class CertificateChain extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  viewCert = (ev: any, cert: any) => {
    ev.stopPropagation();
    const certs = sign.get_sign_certs_info;

    for (let i = 0; i < certs.length; i++) {
      certs[i].active = false;
    }
    certs[certs.indexOf(cert)].active = true;
    sign.set_sign_cert_info = cert;
  }

  render() {
    const self = this;
    const certs = sign.get_sign_certs_info ? sign.get_sign_certs_info : [];
    let padding = -5;

    const elements = certs.map(function(cert: any, index: number) {
      let tree: any = null;
      let active = "";
      let status: string;

      if (cert.status) {
        status = "status_cert_ok_icon";
      } else {
        status = "status_cert_fail_icon";
      }

      padding = padding + 15;

      if (index !== certs.length - 1) {
        tree = <img className="tree-elem" src="./image/tree_element.svg" style={{ left: (padding + 10) + "px" }}></img>;
      }

      if (cert.active === true) {
        active = "active";
      }

      return (
        <div className={"collection-item avatar certs-collection cs-chain " + active} key={index} onClick={function(event: any) { self.viewCert(event, cert); }} style={{ paddingLeft: padding + "px" }}>
          <div className="r-iconbox-link">
            <div className="r-iconbox-cert-icon cs-icon"><i className={status + " cs-icon-size"}></i></div>
            <p className="cs-title">{cert.subjectFriendlyName}</p>
            <p className="cs-info cert-info">{cert.issuerFriendlyName}</p>
          </div>
          {tree}
        </div>
      );
    });

    return (
      <div className="content-wrapper z-depth-1">
        <div className="sign-info-content">
          <div className="add-cs-collection collection ">
            {elements}
          </div>
        </div>
      </div>
    );
  }
}

export default CertificateChain;
