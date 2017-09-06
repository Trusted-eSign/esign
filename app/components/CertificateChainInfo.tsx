import * as React from "react";

const TRUE_CERT_STATUS = {
  border: "1px solid #4caf50",
  color: "#4caf50",
};

const FALSE_CERT_STATUS = {
  border: "1px solid red",
  color: "red",
};

const getChain = (certItem: any) => {
  try {
    const cert = window.PKISTORE.getPkiObject(certItem);
    const chain = new trusted.pki.Chain();
    const chainForVerify = chain.buildChain(cert, window.TRUSTEDCERTIFICATECOLLECTION);

    return chainForVerify;
  } catch (e) {
    return null;
  }
};

const certVerify = (cert: trusted.pki.Certificate) => {
  let chain: trusted.pki.Chain;
  let chainForVerify: trusted.pki.CertificateCollection;

  try {
    chain = new trusted.pki.Chain();
    chainForVerify = chain.buildChain(cert, window.TRUSTEDCERTIFICATECOLLECTION);
    return chain.verifyChain(chainForVerify, null);
  } catch (e) {
    return false;
  }
};

function CertificateChainInfo({ certificate }, context) {
  const { localize, locale } = context;
  const chain = getChain(certificate);
  const elements = [];
  let curStyle;

  if (chain && chain.length) {
    for (let j: number = chain.length - 1; j >= 0; j--) {
      const element = chain.items(j);
      const status = certVerify(element);

      status ? curStyle = TRUE_CERT_STATUS : curStyle = FALSE_CERT_STATUS;
      elements.push(
        <div className={"collection collection-item avatar certs-collection "}>
          <div className="r-iconbox-link">
            <div className={"r-iconbox-cert-icon numberCircle"}>{j + 1}</div>
            <div className="collection-title">{element.subjectFriendlyName}</div>
            <div className="collection-info cert-info ">{element.issuerFriendlyName}
              <div>
                <div className="statusOval" style={curStyle}>{status ? localize("Certificate.cert_status_true", locale) : localize("Certificate.cert_status_false", locale)}</div>
              </div>
            </div>
          </div>
        </div>);
    }
  } else {
    elements.push(
      <div className={"collection collection-item avatar certs-collection "}>
        <div className="r-iconbox-link">
          <div className={"r-iconbox-cert-icon numberCircle"}>1</div>
          <div className="collection-title">{certificate.subjectFriendlyName}</div>
          <div className="collection-info cert-info ">{certificate.issuerFriendlyName}
            <div>
              <div className="statusOval" style={FALSE_CERT_STATUS}>{status ? "действителен" : "недействителен"}</div>
            </div>
          </div>
        </div>
      </div>);
  }

  return (
    <div>
      {elements}
    </ div>
  );
}

CertificateChainInfo.contextTypes = {
  locale: React.PropTypes.string,
  localize: React.PropTypes.func,
};

export default CertificateChainInfo;
