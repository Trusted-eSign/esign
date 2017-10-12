import * as React from "react";

interface ISignatureStatusProps {
  signature: any;
  handleActiveCert: (cert: any) => void;
}

class SignatureStatus extends React.Component<ISignatureStatusProps, any> {
  static contextTypes = {
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

  constructor(props: ISignatureStatusProps) {
    super(props);
  }

  handleClick = () => {
    const { signature, handleActiveCert } = this.props;

    handleActiveCert(signature.certs[0]);
  }

  render() {
    const { signature } = this.props;
    const { localize, locale } = this.context;

    let status = "";
    let icon = "";

    if (signature.status_verify === true) {
      status = localize("Sign.sign_ok", locale);
      icon = "status_cert_ok_icon";
    } else {
      status = localize("Sign.sign_error", locale);
      icon = "status_cert_fail_icon";
    }

    return (
      <div className="collection-item avatar certs-collection" onClick={this.handleClick}>
        <div className="r-iconbox-link">
          <div className="r-iconbox-cert-icon"><i className={icon}></i></div>
          <p className="collection-title si-title">{status}</p>
          <p className="collection-info cert-info si-info">{localize("Sign.status", locale)}</p>
          <p className="collection-title si-title">{signature.subject}</p>
          <p className="collection-info cert-info si-info">{localize("Certificate.subject", locale)}</p>
          <p className="collection-title si-title">{signature.alg}</p>
          <p className="collection-info cert-info si-info">{localize("Sign.alg", locale)}</p>
          <p className="collection-title si-title">{signature.digestAlgorithm}</p>
          <p className="collection-info cert-info si-info">{localize("Sign.digest_alg", locale)}</p>
        </div>
      </div>
    );
  }
}

export default SignatureStatus;
