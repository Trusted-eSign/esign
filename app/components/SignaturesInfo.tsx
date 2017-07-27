import * as React from "react";
import { lang, LangApp } from "../module/global_app";
import { sign, SignApp } from "../module/sign_app";
import CertificateChain from "./CertificateChain";
import CertificateInfo from "./CertificateInfo";
import HeaderWorkspaceBlock from "./HeaderWorkspaceBlock";

class SignaturesInfo extends React.Component<any, any> {
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
        <HeaderWorkspaceBlock text={lang.get_resource.Certificate.cert_info} />
        {certificateInfo}
      </div>
    );
  }

  render() {
    const hidden_sign_cert_info = sign.get_sign_certs_info ? "" : "hidden";

    return (
      <div className={"content-tem sign-info " + hidden_sign_cert_info}>
        <div className="col s6 m6 l6 content-item">
          <CertificateChain />
        </div>
        <div className="col s6 m6 l6 content-item">
          {this.getCertificateInfo()}
        </div>
      </div>
    );
  }
}

export default SignaturesInfo;
