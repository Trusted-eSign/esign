import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { List } from "react-virtualized";
import { loadAllCertificates, verifyCertificate } from "../../AC";
import accordion from "../../decorators/accordion";
import { filteredCertificatesSelector } from "../../selectors";
import ProgressBars from "../ProgressBars";
import CertificateListItem from "./CertificateListItem";

const HEIGHT_MODAL = 356;
const HEIGHT_FULL = 432;
const ROW_HEIGHT = 45;

interface ICertificateListProps {
  activeCert: (certificate: any) => void;
  certificates: any;
  isLoaded: boolean;
  isLoading: boolean;
  operation: string;
  loadAllCertificates: () => void;
  verifyCertificate: (id: number) => void;
}

class CertificateList extends React.Component<ICertificateListProps, any> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: ICertificateListProps) {
    super(props);

    this.state = ({
      activeSection: "my",
    });
  }

  componentDidMount() {
    // tslint:disable-next-line:no-shadowed-variable
    const { isLoaded, isLoading, loadAllCertificates } = this.props;

    if (!isLoading && !isLoaded) {
      loadAllCertificates();
    }

    $(".collapsible").collapsible();
  }

  render() {
    const { certificates, isLoading } = this.props;
    const { localize, locale } = this.context;

    if (isLoading) {
      return <ProgressBars />;
    }

    const my: object[] = [];
    const root: object[] = [];
    const intermediate: object[] = [];
    const other: object[] = [];
    const token: object[] = [];
    const request: object[] = [];

    certificates.forEach((cert: any) => {
      switch (cert.category) {
        case "MY":
          return my.push(cert);
        case "ROOT":
          return root.push(cert);
        case "CA":
          return intermediate.push(cert);
        case "AddressBook":
          return other.push(cert);
        case "TOKEN":
          return token.push(cert);
        case "Request":
          return request.push(cert);
      }
    });

    return (
      <React.Fragment>
        <ul className="collapsible" data-collapsible="accordion">
          {this.getCollapsibleElement(localize("Certificate.certs_my", locale), "my", my, true)}
          {this.getCollapsibleElement(localize("Certificate.certs_other", locale), "other", other)}
          {this.getCollapsibleElement(localize("Certificate.certs_intermediate", locale), "intermediate", intermediate)}
          {this.getCollapsibleElement(localize("Certificate.certs_root", locale), "root", root)}
          {this.getCollapsibleElement(localize("Certificate.certs_token", locale), "token", token)}
          {this.getCollapsibleElement(localize("Certificate.certs_request", locale), "request", request)}
        </ul>
      </React.Fragment>
    );
  }

  getCollapsibleElement = (head: string, name: string, elements: object[], active: boolean = false) => {
    const { activeCert, selectedCert, operation, toggleOpenItem, isItemOpened } = this.props;

    if (!elements || elements.length === 0) {
      return null;
    }

    const activeSection = active ? "active" : "";

    return (
      <li>
        <div className={`collapsible-header color ${activeSection}`} onClick={() => this.setState({ activeSection: name })}>
          <i className={`material-icons left ${name}`}>
          </i>
          {head}
        </div>
        <div className="collapsible-body">
          <List
            height={this.getListHeight(elements.length)}
            overscanRowCount={1}
            rowCount={elements.length}
            rowHeight={ROW_HEIGHT}
            rowRenderer={({ index, key, style }) => {
              if (!elements.length || this.state.activeSection !== name) {
                return null;
              }

              const cert = elements[index];

              return (
                <ul
                  key={key}
                  style={style}
                >
                  <CertificateListItem
                    key={cert.id}
                    cert={cert}
                    chooseCert={() => activeCert(cert)}
                    operation={operation}
                    selectedCert={() => selectedCert(cert)}
                    isOpen={isItemOpened(cert.id.toString())}
                    toggleOpen={toggleOpenItem(cert.id.toString())}
                    style={style} />;
                </ul>
              );
            }}
            width={operation === "certificate" ? 377 : 318}
          />
        </div>
      </li>
    );
  }

  getListHeight = (countItems: number) => {
    const { operation } = this.props;

    switch (operation) {
      case "sign":
      case "encrypt":
        if (countItems * ROW_HEIGHT < HEIGHT_MODAL) {
          return countItems * ROW_HEIGHT;
        } else {
          return HEIGHT_MODAL;
        }

      default:
        if (countItems * ROW_HEIGHT < HEIGHT_FULL) {
          return countItems * ROW_HEIGHT;
        } else {
          return HEIGHT_FULL;
        }
    }
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
