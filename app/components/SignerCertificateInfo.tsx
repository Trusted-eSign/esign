import PropTypes from "prop-types";
import React from "react";
import BlockNotElements from "./BlockNotElements";
import CertificateChainInfo from "./Certificate/CertificateChainInfo";
import CertificateInfo from "./Certificate/CertificateInfo";
import HeaderWorkspaceBlock from "./HeaderWorkspaceBlock";

class SignerCertificateInfo extends React.Component<any, any> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: any) {
    super(props);
    this.state = ({
      certForInfo: null,
    });
  }

  handleClick = (certificate: any) => {
    this.setState({ certForInfo: certificate });
  }

  getCertificateInfo() {
    const { certForInfo } = this.state;
    const { localize, locale } = this.context;

    const body = certForInfo ?
      (<CertificateInfo certificate={certForInfo} />) :
      (<BlockNotElements name={"active"} title={localize("Certificate.cert_not_select", locale)} />);

    return (
      <div className="content-wrapper z-depth-1">
        <HeaderWorkspaceBlock text={localize("Certificate.cert_info", locale)} />
        <div className="add-certs">
          <div className="add-certs-item">
            {body}
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
          <div className="content-wrapper z-depth-1">
            <HeaderWorkspaceBlock icon="arrow_back" onСlickBtn={handleBackView} text={localize("Certificate.cert_chain", locale)} />
            <div className="add-certs">
              <CertificateChainInfo certificate={certificate} onClick={this.handleClick} />
            </div>
          </div>
        </div>
        <div className="col s6 m6 l6 content-item">
          {this.getCertificateInfo()}
        </div>
      </div>
    );
  }
}

export default SignerCertificateInfo;
