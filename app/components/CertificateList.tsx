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

    $(".collapsible").collapsible();
  }

  render() {
    const { certificates, activeCert, selectedCert, operation, toggleOpenItem, isItemOpened, isLoading } = this.props;
    const { localize, locale } = this.context;

    if (isLoading) {
      return <ProgressBars />;
    }

    const my: object[] = [];
    const root: object[] = [];
    const intermediate: object[] = [];
    const other: object[] = [];
    const token: object[] = [];

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
          return intermediate.push(element);
        case "AddressBook":
          return other.push(element);
        case "TOKEN":
          return token.push(element);
      }
    });

    return (
      <div>
        <ul className="collapsible" data-collapsible="accordion">
          <li>
            <div className="collapsible-header color"><i className="material-icons left my"></i>{localize("Certificate.certs_my", locale)}</div>
            <div className="collapsible-body">{my}</div>
          </li>
          <li>
            <div className="collapsible-header color"><i className="material-icons left other"></i>{localize("Certificate.certs_other", locale)}</div>
            <div className="collapsible-body">{other}</div>
          </li>
          <li>
            <div className="collapsible-header color"><i className="material-icons left intermediate"></i>{localize("Certificate.certs_intermediate", locale)}</div>
            <div className="collapsible-body">{intermediate}</div>
          </li>
          <li>
            <div className="collapsible-header color"><i className="material-icons left root"></i>{localize("Certificate.certs_root", locale)}</div>
            <div className="collapsible-body">{root}</div>
          </li>
          <li>
            <div className="collapsible-header color"><i className="material-icons left token"></i>{localize("Certificate.certs_token", locale)}</div>
            <div className="collapsible-body">{token}</div>
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
}, { loadAllCertificates }, null, {pure: false})(accordion(CertificateList));
