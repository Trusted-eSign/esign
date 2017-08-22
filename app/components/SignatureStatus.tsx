import * as React from "react";
import { lang } from "../module/global_app";
import { sign } from "../module/sign_app";

interface ISignatureStatusProps {
  signed_data: any;
}

class SignatureStatus extends React.Component<ISignatureStatusProps, any> {
  constructor(props: ISignatureStatusProps) {
    super(props);
  }

  viewSignCertInfo = (event: any, certs: any) => {
    event.stopPropagation();
    sign.set_sign_certs_info = certs;
    sign.set_sign_cert_info = certs[0];
  }

  render() {
    const { signed_data } = this.props;

    let self = this;
    let status = "";
    let icon = "";

    if (signed_data.status_verify === true) {
      status = lang.get_resource.Sign.sign_ok;
      icon = "status_cert_ok_icon";
    } else {
      status = lang.get_resource.Sign.sign_error;
      icon = "status_cert_fail_icon";
    }

    return (
      <div className="collection-item avatar certs-collection" onClick={function(event: any) { self.viewSignCertInfo(event, signed_data.certs); }}>
        <div className="r-iconbox-link">
          <div className="r-iconbox-cert-icon"><i className={icon}></i></div>
          <p className="collection-title si-title">{status}</p>
          <p className="collection-info cert-info si-info">{lang.get_resource.Sign.status}</p>
          <p className="collection-title si-title">{signed_data.subject}</p>
          <p className="collection-info cert-info si-info">{lang.get_resource.Certificate.subject}</p>
          <p className="collection-title si-title">{signed_data.alg}</p>
          <p className="collection-info cert-info si-info">{lang.get_resource.Sign.alg}</p>
          <p className="collection-title si-title">{signed_data.digestAlgorithm}</p>
          <p className="collection-info cert-info si-info">{lang.get_resource.Sign.digest_alg}</p>
        </div>
      </div>
    );
  }
}

export default SignatureStatus;
