import * as React from "react";
import { connect } from "react-redux";
import { activeFilesSelector } from "../selectors";
import { mapToArr } from "../utils";
import HeaderWorkspaceBlock from "./HeaderWorkspaceBlock";
import SignatureStatus from "./SignatureStatus";
import SignerCertificateInfo from "./SignerCertificateInfo";

class SignatureInfoBlock extends React.Component<any, any> {
  static contextTypes = {
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

  constructor(props: any) {
    super(props);
  }

  render() {
    const { signerCertificate, filename, signatures, handleActiveCert, handleBackView } = this.props;
    const { localize, locale } = this.context;

    if (signerCertificate) {
      return (
        <SignerCertificateInfo handleBackView={handleBackView} certificate={signerCertificate} />
      );
    }

    const elements = signatures.map((signature) => {
      return <SignatureStatus key={signature.id} signature={signature} handleActiveCert={handleActiveCert} />;
    });

    return (
      <div className={"col s6 m6 l6 sign-info content-item-height "}>
        <div className="file-content-height">
          <div className="content-wrapper z-depth-1">
            <HeaderWorkspaceBlock icon="arrow_back" text={localize("Sign.sign_info", locale)} second_text={filename} />
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
