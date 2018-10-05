import PropTypes from "prop-types";
import React from "react";
import { localizeAlgorithm } from "../../i18n/localize";

export interface ICRL {
  active: boolean;
  category: string;
  format: string;
  hash: string;
  id: string;
  issuerFriendlyName: string;
  issuerName: string;
  lastUpdate: Date;
  nextUpdate: Date;
  provider: string;
  signatureAlgorithm: string;
  signatureDigestAlgorithm: string;
  type: string;
  uri: string;
}

interface ICRLInfoProps {
  crl: ICRL;
}

export default class CRLInfo extends React.Component<ICRLInfoProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  render() {
    const { localize, locale } = this.context;
    const { crl } = this.props;

    return (
      <div className="add-cert-collection collection cert-info-list">
        <div className="collection-item certs-collection certificate-info">
          <div className="collection-info cert-info-blue">
            {localize("Certificate.issuer_name", locale)}
          </div>
          <div className="collection-title ">
            {crl.issuerFriendlyName}
          </div>
        </div>
        <div className="collection-item certs-collection certificate-info">
          <div className="collection-info cert-info-blue">
            {localize("CRL.lastUpdate", locale)}
          </div>
          <div className="collection-title ">{(new Date(crl.lastUpdate)).toLocaleDateString(locale, {
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            month: "long",
            year: "numeric",
          })}</div>
        </div>
        <div className="collection-item certs-collection certificate-info">
          <div className="collection-info cert-info-blue">
            {localize("CRL.nextUpdate", locale)}
          </div>
          <div className="collection-title ">{(new Date(crl.nextUpdate)).toLocaleDateString(locale, {
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            month: "long",
            year: "numeric",
          })}</div>
        </div>
        <div className="collection-item certs-collection certificate-info">
          <div className="collection-info cert-info-blue">
            {localize("Sign.alg", locale)}
          </div>
          <div className={"collection-title "}>
            {localizeAlgorithm(crl.signatureAlgorithm, locale)}
          </div>
        </div>
        <div className="collection-item certs-collection certificate-info">
          <div className="collection-info cert-info-blue">
            {localize("Certificate.signature_digest_algorithm", locale)}
          </div>
          <div className="collection-title ">
            {localizeAlgorithm(crl.signatureDigestAlgorithm, locale)}
          </div>
        </div>
        <div className="collection-item certs-collection certificate-info">
          <div className="collection-info cert-info-blue">
            {localize("Certificate.thumbprint", locale)}
          </div>
          <div className="collection-title ">
            {crl.hash}
          </div>
        </div>
      </div>
    );
  }
}
