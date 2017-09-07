import * as React from "react";
import { sign, SignApp } from "../module/sign_app";
import CertificateChain from "./CertificateChain";
import CertificateInfo from "./CertificateInfo";
import HeaderWorkspaceBlock from "./HeaderWorkspaceBlock";

class SignerCertificateInfo extends React.Component<any, any> {
  static contextTypes = {
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

  constructor(props: any) {
    super(props);
    this.change = this.change.bind(this);
  }

  componentDidMount() {
    sign.on(SignApp.SIGN_INFO_CHANGE, this.change);
  }

  componentWillUnmount() {
    sign.removeListener(SignApp.SIGN_INFO_CHANGE, this.change);
  }

  change() {
    this.setState({});
  }

  getCertificateInfo() {
    const { localize, locale } = this.context;

    const certificate = sign.get_sign_cert_info;
    let certificateInfo: any = null;

    if (certificate) {
      certificateInfo = <div className="add-certs">
        <div className="add-certs-item">
          <CertificateInfo certificate={certificate} />
        </div>
      </div>;
    }

    return (
      <div className="content-wrapper z-depth-1">
        <HeaderWorkspaceBlock text={localize("Certificate.cert_info", locale)} />
        {certificateInfo}
      </div>
    );
  }

  removeSignInfo() {
    sign.set_sign_certs_info = null;
    sign.set_sign_cert_info = null;
  }

  render() {
    const { localize, locale } = this.context;

    if (!sign.get_sign_certs_info) {
      return null;
    }

    return (
      <div className={"content-tem sign-info "}>
        <div className="col s6 m6 l6 content-item">
          <HeaderWorkspaceBlock icon="arrow_back" onСlickBtn={this.removeSignInfo.bind(this)} text={localize("Certificate.cert_chain", locale)} />
          <CertificateChain />
        </div>
        <div className="col s6 m6 l6 content-item">
          {this.getCertificateInfo()}
        </div>
      </div>
    );
  }
}

export default SignerCertificateInfo;
