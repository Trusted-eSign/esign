import PropTypes from "prop-types";
import React from "react";
import { localizeAlgorithm } from "../../i18n/localize";

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
            <div className="collection-info cert-info-blue">{localize("Sign.status", locale)}</div>
            <div className="collection-title">{status}</div>
            <div className="collection-info cert-info-blue">{localize("Sign.signingTime", locale)}</div>
            <div className="collection-title">{signature.signingTime ? (new Date(signature.signingTime)).toLocaleDateString(locale, {
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              month: "long",
              year: "numeric",
            }) : "-"}</div>
            <div className="collection-info cert-info-blue">{localize("Sign.alg", locale)}</div>
            <div className="collection-title">{localizeAlgorithm(signature.alg, locale)}</div>
            <div className="collection-info cert-info-blue">{localize("Certificate.subject", locale)}</div>
            <div className="collection-title">{signerCert.subjectFriendlyName}</div>
            <div className="collection-info cert-info-blue">{localize("Certificate.issuer", locale)}</div>
            <div className="collection-title">{signerCert.issuerFriendlyName}</div>
            <div className="collection-info cert-info-blue">{localize("Certificate.cert_valid", locale)}</div>
            <div className="collection-title">{(new Date(signerCert.notAfter)).toLocaleDateString(locale, {
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              month: "long",
              year: "numeric",
            })}</div>
          </div>
          <div className={icon} />
        </div>
      </div>
    );
  }
}

export default SignatureStatus;
