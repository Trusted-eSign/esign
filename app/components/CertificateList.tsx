import PropTypes from "prop-types";
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
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  componentDidMount() {
    const { isLoaded, isLoading, loadAllCertificates } = this.props;

    if (!isLoading && !isLoaded) {
      loadAllCertificates();
    }

    $(".collapsible").collapsible();
  }

  getCollapsibleElement(head: string, name: string, elements: object[], active: boolean = false) {
    if (!elements || elements.length === 0) {
      return null;
    }

    const activeSection = active ? "active" : "";

    return (
      <li>
        <div className={`collapsible-header color ${activeSection}`}>
          <i className={`material-icons left ${name}`}>
          </i>
          {head}
        </div>
        <div className="collapsible-body">{elements}</div>
      </li>
    );
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
          {this.getCollapsibleElement(localize("Certificate.certs_my", locale), "my", my, true)}
          {this.getCollapsibleElement(localize("Certificate.certs_other", locale), "other", other)}
          {this.getCollapsibleElement(localize("Certificate.certs_intermediate", locale), "intermediate", intermediate)}
          {this.getCollapsibleElement(localize("Certificate.certs_root", locale), "root", root)}
          {this.getCollapsibleElement(localize("Certificate.certs_token", locale), "token", token)}
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
