import PropTypes from "prop-types";
import React from "react";
import HeaderWorkspaceBlock from "../HeaderWorkspaceBlock";
import SignerCertificateInfo from "../SignerCertificateInfo";
import SignatureStatus from "./SignatureStatus";

class SignatureInfoBlock extends React.Component<any, any> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  render() {
    const { signerCertificate, filename, signatures, handleActiveCert, handleNoShowSignatureInfo, handleNoShowSignerCertificateInfo } = this.props;
    const { localize, locale } = this.context;

    if (!signatures) {
      return null;
    }

    if (signerCertificate) {
      return (
        <SignerCertificateInfo handleBackView={handleNoShowSignerCertificateInfo} certificate={signerCertificate} />
      );
    }

    const elements = signatures.map((signature: any) => {
      return <SignatureStatus key={signature.id} signature={signature} handleActiveCert={handleActiveCert} />;
    });

    return (
      <div className={"col s6 m6 l6 sign-info content-item-height "}>
        <div className="file-content-height">
          <div className="content-wrapper z-depth-1">
            <HeaderWorkspaceBlock icon="arrow_back" text={localize("Sign.sign_info", locale)} second_text={filename} onСlickBtn={handleNoShowSignatureInfo} />
            <div className="sign-info-content">
              <div className={"add-cert-collection collection "}>
                {elements}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SignatureInfoBlock;
