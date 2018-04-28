import PropTypes from "prop-types";
import * as React from "react";
import { localizeAlgorithm } from "../i18n/localize";

interface ISignatureStatusProps {
  signature: any;
  handleActiveCert: (cert: any) => void;
}

class SignatureStatus extends React.Component<ISignatureStatusProps, any> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

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

    const signerCert = signature.certs[signature.certs.length - 1];

    return (
      <div className="collection-item avatar certs-collection" onClick={this.handleClick}>
        <div className="row">
          <div className="col s11">
            <p className="collection-info cert-info-blue">{localize("Sign.status", locale)}</p>
            <p className="collection-title">{status}</p>
            <p className="collection-info cert-info-blue">{localize("Sign.signingTime", locale)}</p>
            <p className="collection-title">{signature.signingTime ? (new Date(signature.signingTime)).toLocaleDateString(locale, {
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              month: "long",
              year: "numeric",
            }) : "-"}</p>
            <p className="collection-info cert-info-blue">{localize("Sign.alg", locale)}</p>
            <p className="collection-title">{localizeAlgorithm(signature.alg, locale)}</p>
            <p className="collection-info cert-info-blue">{localize("Certificate.subject", locale)}</p>
            <p className="collection-title">{signerCert.subjectFriendlyName}</p>
            <p className="collection-info cert-info-blue">{localize("Certificate.issuer", locale)}</p>
            <p className="collection-title">{signerCert.issuerFriendlyName}</p>
            <p className="collection-info cert-info-blue">{localize("Certificate.cert_valid", locale)}</p>
            <p className="collection-title">{(new Date(signerCert.notAfter)).toLocaleDateString(locale, {
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              month: "long",
              year: "numeric",
            })}</p>
          </div>
          <div className={icon} />
        </div>
      </div>
    );
  }
}

export default SignatureStatus;
