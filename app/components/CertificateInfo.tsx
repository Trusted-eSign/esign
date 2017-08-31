import * as React from "react";
import { IX509Certificate } from "../module/global_app";

interface ICertificateInfoProps {
  certificate: IX509Certificate;
}

export default class CertificateInfo extends React.Component<ICertificateInfoProps, any> {
  static contextTypes = {
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

  constructor(props: ICertificateInfoProps) {
    super(props);
  }

  render() {
    const { localize, locale } = this.context;
    const { certificate } = this.props;
    const PRIV_KEY = certificate.key.length > 0 ? localize("Certificate.present", locale) : localize("Certificate.absent", locale);

    return (
      <div className="add-cert-collection collection cert-info-list">
        <div className="collection-item certs-collection certificate-info">
          <div className={"collection-title "}>{certificate.serial}</div>
          <div className={"collection-info cert-info "}>{localize("Certificate.serialNumber", locale)}</div>
        </div>
        <div className="collection-item certs-collection certificate-info">
          <div className={"collection-title "}>{certificate.subjectFriendlyName}</div>
          <div className={"collection-info cert-info "}>{localize("Certificate.subject", locale)}</div>
        </div>
        <div className="collection-item certs-collection certificate-info">
          <div className={"collection-title "}>{certificate.organizationName}</div>
          <div className={"collection-info cert-info "}>{localize("Certificate.organization", locale)}</div>
        </div>
        <div className="collection-item certs-collection certificate-info">
          <div className={"collection-title "}>{certificate.issuerFriendlyName}</div>
          <div className={"collection-info cert-info "}>{localize("Certificate.issuer_name", locale)}</div>
        </div>
        <div className="collection-item certs-collection certificate-info">
          <div className={"collection-title "}>{(new Date(certificate.notAfter)).toLocaleDateString(locale, {
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            month: "long",
            year: "numeric",
          })}</div>
          <div className={"collection-info cert-info "}>{localize("Certificate.cert_valid", locale)}</div>
        </div>
        <div className="collection-item certs-collection certificate-info">
          <div className={"collection-title "}>{certificate.signatureAlgorithm}</div>
          <div className={"collection-info cert-info "}>{localize("Sign.alg", locale)}</div>
        </div>
        <div className="collection-item certs-collection certificate-info">
          <div className={"collection-title "}>{certificate.hash}</div>
          <div className={"collection-info cert-info "}>{localize("Certificate.thumbprint", locale)}</div>
        </div>
        <div className="collection-item certs-collection certificate-info">
          <div className={"collection-title "}>{PRIV_KEY}</div>
          <div className={"collection-info cert-info "}>{localize("Certificate.priv_key", locale)}</div>
        </div>
      </div>
    );
  }
}
