import * as React from "react";
import CertificateChainInfo from "./CertificateChainInfo";
import CertificateInfo from "./CertificateInfo";
import HeaderWorkspaceBlock from "./HeaderWorkspaceBlock";

class SignerCertificateInfo extends React.Component<any, any> {
  static contextTypes = {
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

  constructor(props: any) {
    super(props);
    this.state = ({
      certForInfo: props.certificate,
    });
  }

  handleClick = (certificate: any) => {
    this.setState({ certForInfo: certificate });
  }

  getCertificateInfo() {
    const { certForInfo } = this.state;
    const { localize, locale } = this.context;

    return (
      <div className="content-wrapper z-depth-1">
        <HeaderWorkspaceBlock text={localize("Certificate.cert_info", locale)} />
        <div className="add-certs">
          <div className="add-certs-item">
            <CertificateInfo certificate={certForInfo} />
          </div>
        </div>;
      </div>
    );
  }

  render() {
    const { certificate, handleBackView } = this.props;
    const { localize, locale } = this.context;

    if (!certificate) {
      return null;
    }

    return (
      <div className={"content-tem sign-info "}>
        <div className="col s6 m6 l6 content-item">
          <HeaderWorkspaceBlock icon="arrow_back" onСlickBtn={handleBackView} text={localize("Certificate.cert_chain", locale)} />
          <CertificateChainInfo certificate={certificate} onClick={this.handleClick} style="trlink_block"/>
        </div>
        <div className="col s6 m6 l6 content-item">
          {this.getCertificateInfo()}
        </div>
      </div>
    );
  }
}

export default SignerCertificateInfo;
