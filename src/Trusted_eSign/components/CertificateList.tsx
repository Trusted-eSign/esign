import * as React from "react";
import { PropTypes } from "react";
import accordion from "../decorators/accordion";
import { CertificateListItem } from "./CertificateListItem";

class CertificateList extends React.Component<any, any> {
  render() {
    const { certs, activeCert, selectedCert, operation, toggleOpenItem, isItemOpened } = this.props;
    const elements = certs.map((cert: any) =>
      <CertificateListItem name={cert.name}
        cert={cert}
        chooseCert={(event: any) => activeCert(event, cert) }
        operation={operation}
        selectedCert={() => selectedCert(cert)}
        isOpen={isItemOpened(cert.key.toString())}
        toggleOpen={toggleOpenItem(cert.key.toString())}
        key = {cert.key.toString()}/>,
    );

    return (
      <div>
        {elements}
      </div>
    );
  }
}

export default accordion(CertificateList);
