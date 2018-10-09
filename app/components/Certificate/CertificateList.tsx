import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { AutoSizer, List } from "react-virtualized";
import { loadAllCertificates, verifyCertificate } from "../../AC";
import { ENCRYPT, SIGN } from "../../constants";
import accordion from "../../decorators/accordion";
import { filteredCertificatesSelector } from "../../selectors";
import ProgressBars from "../ProgressBars";
import CertificateListItem from "./CertificateListItem";

interface ICertificateListProps {
  activeCert: (certificate: any) => void;
  certificates: any;
  isLoaded: boolean;
  isLoading: boolean;
  operation: string;
  loadAllCertificates: () => void;
  verifyCertificate: (id: number) => void;
}

// let scrollTimer: NodeJS.Timer | null;
// let lastScrollFireTime = 0;

const HEIGHT_MODAL = 356;
const HEIGHT_FULL = 432;

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

    // const addCerts = $(".add-certs");

    // if (addCerts.length) {
    //   addCerts[0].addEventListener("scroll", this.fireOnScroll);
    // }

    // this.processScroll();
  }

  // fireOnScroll = () => {
  //   const minScrollTime = 1000;
  //   const now = new Date().getTime();
  //   const self = this;

  //   if (!scrollTimer) {
  //     if (now - lastScrollFireTime > (3 * minScrollTime)) {
  //       lastScrollFireTime = now;
  //     }

  //     scrollTimer = setTimeout(function() {
  //       scrollTimer = null;
  //       lastScrollFireTime = new Date().getTime();
  //       self.processScroll();
  //     }, minScrollTime);
  //   }
  // }

  // processScroll = () => {
  //   // tslint:disable-next-line:no-shadowed-variable
  //   const { certificates, verifyCertificate } = this.props;

  //   certificates.forEach((cert: any) => {
  //     let visible = false;

  //     if ($(`#${cert.id}:visible`).length > 0) {
  //       visible = $(`#${cert.id}:visible`).visible();
  //     }

  //     if (visible) {
  //       if (!cert.verified) {
  //         verifyCertificate(cert.id);
  //       }
  //     }
  //   });
  // }

  getCollapsibleElement(head: string, name: string, elements: object[], active: boolean = false) {
    const { certificates, activeCert, selectedCert, operation, toggleOpenItem, isItemOpened, isLoading } = this.props;

    if (!elements || elements.length === 0) {
      return null;
    }

    const activeSection = active ? "active" : "";

    return (
      <li>
        <div className={`collapsible-header color ${activeSection}`} onClick={() => this.setState({activeSection: name})}>
          <i className={`material-icons left ${name}`}>
          </i>
          {head}
        </div>
        <div className="collapsible-body">
          <List
            height={this.getListHeight(elements)}
            overscanRowCount={1}
            rowCount={elements.length}
            rowHeight={45}
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
            width={369}
          />
        </div>
      </li>
    );
  }

  getListHeight = () => {
    const { operation } = this.props;

    switch (operation) {
      case "sign":
      case "encrypt":
        return HEIGHT_MODAL;

      default:
        return HEIGHT_FULL;
    }
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
    const request: object[] = [];

    certificates.forEach((cert) => {
      // const element = (
      //   <CertificateListItem
      //     key={cert.id}
      //     cert={cert}
      //     chooseCert={() => activeCert(cert)}
      //     operation={operation}
      //     selectedCert={() => selectedCert(cert)}
      //     isOpen={isItemOpened(cert.id.toString())}
      //     toggleOpen={toggleOpenItem(cert.id.toString())} />
      // );

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
