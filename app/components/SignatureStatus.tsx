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
      icon = "cert_status_ok";
    } else {
      status = localize("Sign.sign_error", locale);
      icon = "cert_status_error";
    }

    return (
      <div className="collection-item avatar certs-collection" onClick={this.handleClick}>
        <div className="row">
          <div className="col s11">
            <p className="collection-title">{status}</p>
            <p className="collection-info cert-info">{localize("Sign.status", locale)}</p>
            <p className="collection-title">{signature.subject}</p>
            <p className="collection-info cert-info">{localize("Certificate.subject", locale)}</p>
            <p className="collection-title">{signature.alg}</p>
            <p className="collection-info cert-info">{localize("Sign.alg", locale)}</p>
            <p className="collection-title">{signature.digestAlgorithm}</p>
            <p className="collection-info cert-info">{localize("Sign.digest_alg", locale)}</p>
          </div>
          <div className={icon} />
        </div>
      </div>
    );
  }
}

export default SignatureStatus;
