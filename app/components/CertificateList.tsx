import * as React from "react";
import { connect } from "react-redux";
import { loadAllCertificates } from "../AC";
import accordion from "../decorators/accordion";
import { filteredCertificatesSelector } from "../selectors";
import CertificateListItem from "./CertificateListItem";
import ProgressBars from "./ProgressBars";

interface ICertificateListProps {
  activeCert: (certificate: any) => void;
}

class CertificateList extends React.Component<ICertificateListProps, ICertificateListProps> {
  static contextTypes = {
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

  constructor(props: ICertificateListProps) {
    super(props);
  }

  componentDidMount() {
    const { isLoaded, isLoading, loadAllCertificates } = this.props;

    if (!isLoading && !isLoaded) {
      loadAllCertificates();
    }

    $('.collapsible').collapsible();
  }

  render() {
    const { certificates, activeCert, selectedCert, operation, toggleOpenItem, isItemOpened, isLoading } = this.props;
    const { localize, locale } = this.context;

    if (isLoading) {
      return <ProgressBars />;
    }

    const my: object[] = [];
    const root: object[] = [];
    const ca: object[] = [];
    const adressbook: object[] = [];

    certificates.forEach((cert) => {
      const element = (
        <CertificateListItem
          key={cert.id}
          cert={cert}
          chooseCert={() => activeCert(cert)}
          operation={operation}
          selectedCert={() => selectedCert(cert)}
          isOpen={isItemOpened(cert.id.toString())}
          toggleOpen={toggleOpenItem(cert.id.toString())} />
      );

      switch (cert.category) {
        case "MY":
          return my.push(element);
        case "ROOT":
          return root.push(element);
        case "CA":
          return ca.push(element);
        case "AddressBook":
          return adressbook.push(element);
      }
    });

    return (
      <div>
        <ul className="collapsible" data-collapsible="accordion">
          <li>
            <div className="collapsible-header active"><i className="material-icons">person</i>{localize("Certificate.my", locale)}</div>
            <div className="collapsible-body">{my}</div>
          </li>
          <li>
            <div className="collapsible-header"><i className="material-icons">security</i>{localize("Certificate.root", locale)}</div>
            <div className="collapsible-body">{root}</div>
          </li>
          <li>
            <div className="collapsible-header"><i className="material-icons">low_priority</i>{localize("Certificate.certificate_authority", locale)}</div>
            <div className="collapsible-body">{ca}</div>
          </li>
          <li>
            <div className="collapsible-header"><i className="material-icons">people</i>{localize("Certificate.address_book", locale)}</div>
            <div className="collapsible-body">{adressbook}</div>
          </li>
        </ul>
      </div>
    );
  }
}

interface IOwnProps {
  operation: string;
}

export default connect((state, ownProps: IOwnProps) => {
  return {
    certificates: filteredCertificatesSelector(state, { operation: ownProps.operation }),
    isLoaded: state.certificates.loaded,
    isLoading: state.certificates.loading,
  };
}, { loadAllCertificates }, null, {
  pure: false})(accordion(CertificateList));
