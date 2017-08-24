import * as React from "react";
import { IX509Certificate, lang } from "../module/global_app";

interface ICertificateInfoProps {
  certificate: IX509Certificate;
}

export default class CertificateInfo extends React.Component<ICertificateInfoProps, any> {
  constructor(props: ICertificateInfoProps) {
    super(props);
  }

  render() {
    const { certificate } = this.props;
    const PRIV_KEY = certificate.key.length > 0 ? lang.get_resource.Certificate.present : lang.get_resource.Certificate.absent;

    return (
      <div className="add-cert-collection collection cert-info-list">
        <div className="collection-item certs-collection certificate-info">
          <div className={"collection-title "}>{certificate.serial}</div>
          <div className={"collection-info cert-info "}>{lang.get_resource.Certificate.serialNumber}</div>
        </div>
        <div className="collection-item certs-collection certificate-info">
          <div className={"collection-title "}>{certificate.subjectFriendlyName}</div>
          <div className={"collection-info cert-info "}>{lang.get_resource.Certificate.subject}</div>
        </div>
        <div className="collection-item certs-collection certificate-info">
          <div className={"collection-title "}>{certificate.organizationName}</div>
          <div className={"collection-info cert-info "}>{lang.get_resource.Certificate.organization}</div>
        </div>
        <div className="collection-item certs-collection certificate-info">
          <div className={"collection-title "}>{certificate.issuerFriendlyName}</div>
          <div className={"collection-info cert-info "}>{lang.get_resource.Certificate.issuer_name}</div>
        </div>
        <div className="collection-item certs-collection certificate-info">
          <div className={"collection-title "}>{(new Date(certificate.notAfter)).toLocaleDateString(lang.get_lang, {
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            month: "long",
            year: "numeric",
          })}</div>
          <div className={"collection-info cert-info "}>{lang.get_resource.Certificate.cert_valid}</div>
        </div>
        <div className="collection-item certs-collection certificate-info">
          <div className={"collection-title "}>{certificate.signatureAlgorithm}</div>
          <div className={"collection-info cert-info "}>{lang.get_resource.Sign.alg}</div>
        </div>
        <div className="collection-item certs-collection certificate-info">
          <div className={"collection-title "}>{certificate.hash}</div>
          <div className={"collection-info cert-info "}>{lang.get_resource.Certificate.thumbprint}</div>
        </div>
        <div className="collection-item certs-collection certificate-info">
          <div className={"collection-title "}>{PRIV_KEY}</div>
          <div className={"collection-info cert-info "}>{lang.get_resource.Certificate.priv_key}</div>
        </div>
      </div>
    );
  }
}
