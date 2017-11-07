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
    const cert = certItem.object ? certItem.object : window.PKISTORE.getPkiObject(certItem);
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

function CertificateChainInfo({ certificate, onClick , style}, context) {
  const { localize, locale } = context;
  const chain = getChain(certificate);
  const elements = [];
  let curKeyStyle = "";
  let curStatusStyle: string;

  if (chain && chain.length) {
    for (let j: number = chain.length - 1; j >= 0; j--) {
      const element = chain.items(j);
      const status = certVerify(element);
      let circleStyle = "material-icons left chain_1";
      const vertlineStyle = {
        visibility: "hidden",
      };

      if (j < 10)  {
        circleStyle = "material-icons left chain_" + (j + 1);
      } else {
        circleStyle = "material-icons left chain_10";
      }

      if (j > 0) {
        vertlineStyle.visibility = "visible";
      }

      if (status) {
        curStatusStyle = "cert_status_ok";
      } else {
        curStatusStyle = "cert_status_error";
      }

      if (j === 0) {
        curKeyStyle = certificate.key.length > 0 ? "key" : "";
      }

      elements.push(
        <div className={"collection collection-item avatar certs-collection chain-text"} key={element.serialNumber + "_" + element.thumbprint}>
          <div className="row chain-item">
            <div className="col s1">
              <i className={circleStyle}></i>
              <div className={"vert_line"} style={vertlineStyle}></div>
            </div>
            <div className="col s8" onClick={() => onClick(element)}>
              <div className="r-iconbox-link">
                <div className="collection-title chain_textblock">{element.subjectFriendlyName}</div>
                <div className="collection-info cert-info ">{element.issuerFriendlyName}</div>
              </div>
            </div>
            <div className={curKeyStyle}></div>
            <div className={curStatusStyle}></div>
          </div>
        </div>);
    }
  } else {
    const circleStyle = "material-icons left chain_1";
    const vertlineStyle = {
      visibility: "hidden",
    };
    curStatusStyle = "cert_status_error";
    let curKeyStyle = certificate.key.length > 0 ? curKeyStyle = "key" : curKeyStyle = "";
    elements.push(
      <div className={"collection collection-item avatar certs-collection chain-text"}  key={certificate.serialNumber + "_" + certificate.thumbprint}>
        <div className="row chain-item">
          <div className="col s1">
            <i className={circleStyle}></i>
            <div className={"vert_line"} style={vertlineStyle}></div>
          </div>
          <div className="col s8">
            <div className="r-iconbox-link">
              <div className="collection-title chain_textblock">{certificate.subjectFriendlyName}</div>
              <div className="collection-info cert-info ">{certificate.issuerFriendlyName}<div>
              </div>
              </div>
              <div className={curKeyStyle}></div>
              <div className={curStatusStyle}></div>
            </div>
          </div>
        </div>
      </div>);
  }

  return (
    <div className={style}>
      {elements}
    </ div>
  );
}

CertificateChainInfo.contextTypes = {
  locale: React.PropTypes.string,
  localize: React.PropTypes.func,
};

export default CertificateChainInfo;
