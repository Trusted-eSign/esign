import * as React from "react";
import { PropTypes } from "react";
import { connect } from "react-redux";
import { loadAllCertificates } from "../AC";
import accordion from "../decorators/accordion";
import {filteredCertificatesSelector} from "../selectors";
import { CertificateListItem } from "./CertificateListItem";
import ProgressBars from "./ProgressBars";

class CertificateList extends React.Component<any, any> {
  componentDidMount() {
    const { isLoaded, isLoading, loadAllCertificates } = this.props;

    if (!isLoading && !isLoaded) {
      loadAllCertificates();
    }
  }

  render() {
    const { certificates, activeCert, selectedCert, operation, toggleOpenItem, isItemOpened, isLoading } = this.props;
    if (isLoading) {
      return  <ProgressBars />;
    }

    const elements = certificates.map((cert) =>
      <CertificateListItem
        key = {cert.id}
        cert={cert}
        chooseCert={(event: any) => activeCert(event, cert)}
        operation={operation}
        selectedCert={() => selectedCert(cert)}
        isOpen={isItemOpened(cert.id.toString())}
        toggleOpen={toggleOpenItem(cert.id.toString())} />,
    );

    return (
      <div>
        {elements}
      </div>
    );
  }
}

export default connect((state) => {
  return {
    certificates: filteredCertificatesSelector(state),
    isLoaded: state.certificates.loaded,
    isLoading: state.certificates.loading,
  };
}, { loadAllCertificates })(accordion(CertificateList));
