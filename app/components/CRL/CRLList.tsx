import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { loadAllCertificates } from "../../AC";
import accordion from "../../decorators/accordion";
import { filteredCrlsSelector } from "../../selectors/crlsSelectors";
import ProgressBars from "../ProgressBars";
import CRLListItem from "./CRLListItem";

interface ICRLListProps {
  activeCert: (certificate: any) => void;
  certificates: any;
  isLoaded: boolean;
  isLoading: boolean;
  loadAllCertificates: () => void;
  verifyCertificate: (id: number) => void;
}

class CRLList extends React.Component<ICRLListProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  componentDidMount() {
    // tslint:disable-next-line:no-shadowed-variable
    const { isLoaded, isLoading, loadAllCertificates } = this.props;

    if (!isLoading && !isLoaded) {
      loadAllCertificates();
    }

    $(".collapsible").collapsible();
  }

  render() {
    const { isLoading } = this.props;

    if (isLoading) {
      return <ProgressBars />;
    }

    return (
      <React.Fragment>
        <ul className="collapsible" data-collapsible="accordion">
          {this.getCollapsibleBody()}
        </ul>
      </React.Fragment>
    );
  }

  getCollapsibleBody() {
    const { crls, activeCert, selectedCert, operation, toggleOpenItem, isItemOpened } = this.props;

    if (!crls || crls.length === 0) {
      return null;
    }

    const elements = crls.map((crl: any) =>
      <CRLListItem
        key={crl.id}
        crl={crl}
        chooseCert={() => activeCert(crl)}
        operation={operation}
        selectedCert={() => selectedCert(crl)}
        isOpen={isItemOpened(crl.id.toString())}
        toggleOpen={toggleOpenItem(crl.id.toString())} />);

    return (
      <li>
        <div className="collapsible-header color">
          <i className="material-icons left intermediate" />
          Список отзыва сертификатов
        </div>
        <div className="collapsible-body">
          {elements}
        </div>
      </li>
    );
  }
}

export default connect((state) => {
  return {
    crls: filteredCrlsSelector(state),
    isLoaded: state.crls.loaded,
    isLoading: state.crls.loading,
  };
}, { loadAllCertificates })(accordion(CRLList));
