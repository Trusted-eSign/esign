import PropTypes from "prop-types";
import * as React from "react";
import { findDOMNode } from "react-dom";
import { connect } from "react-redux";
import { loadAllCertificates, verifyCertificate } from "../AC";
import accordion from "../decorators/accordion";
import { filteredCertificatesSelector } from "../selectors";
import CertificateListItem from "./CertificateListItem";
import ProgressBars from "./ProgressBars";

interface ICertificateListProps {
  activeCert: (certificate: any) => void;
}

let scrollTimer: NodeJS.Timer | null;
let lastScrollFireTime = 0;

class CertificateList extends React.Component<ICertificateListProps, ICertificateListProps> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  componentDidMount() {
    const { certificates, isLoaded, isLoading, loadAllCertificates } = this.props;

    if (!isLoading && !isLoaded) {
      loadAllCertificates();
    }

    $(".collapsible").collapsible();

    const addCerts = $(".add-certs");

    if (addCerts.length) {
      addCerts[0].addEventListener("scroll", this.fireOnScroll);
    }

    this.processScroll();
  }

  fireOnScroll = () => {
    const minScrollTime = 1000;
    const now = new Date().getTime();
    const self = this;

    if (!scrollTimer) {
      if (now - lastScrollFireTime > (3 * minScrollTime)) {
        lastScrollFireTime = now;
      }

      scrollTimer = setTimeout(function() {
        scrollTimer = null;
        lastScrollFireTime = new Date().getTime();
        self.processScroll();
      }, minScrollTime);
    }
  }

  processScroll = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { certificates, verifyCertificate } = this.props;

    certificates.forEach((cert: any) => {
      let visible = false;

      if ($(`#${cert.id}:visible`).length > 0) {
        visible = $(`#${cert.id}:visible`).visible();
      }

      if (visible) {
        if (!cert.verified) {
          verifyCertificate(cert.id);
        }
      }
    });
  }

  getCollapsibleElement(head: string, name: string, elements: object[], active: boolean = false) {
    if (!elements || elements.length === 0) {
      return null;
    }

    const activeSection = active ? "active" : "";

    return (
      <li>
        <div className={`collapsible-header color ${activeSection}`} onClick={this.processScroll}>
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
}, { loadAllCertificates, verifyCertificate }, null, { pure: false })(accordion(CertificateList));
