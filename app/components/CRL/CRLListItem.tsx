import PropTypes from "prop-types";
import React from "react";

const rectangleValidStyle = {
  background: "#4caf50",
};

const rectangleUnvalidStyle = {
  background: "#bf3817",
};

interface ICertificateListItemProps {
  chooseCert: () => void;
  selectedCert: (event: any) => void;
  operation: string;
  isOpen: boolean;
  toggleOpen: () => void;
  crl: any;
}

class CRLListItem extends React.Component<ICertificateListItemProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  shouldComponentUpdate(nextProps: ICertificateListItemProps) {
    return nextProps.isOpen !== this.props.isOpen;
  }

  componentDidMount() {
    $(".cert-setting-item").dropdown();
  }

  handleClick = () => {
    const { chooseCert, toggleOpen } = this.props;

    chooseCert();
    toggleOpen();
  }

  render() {
    const { crl, isOpen } = this.props;
    let active = "";
    let rectangleStyle;

    const status = true;

    if (status) {
      rectangleStyle = rectangleValidStyle;
    } else {
      rectangleStyle = rectangleUnvalidStyle;
    }

    if (isOpen) {
      active = "active";
    }

    return (
      <div className="row certificate-list-item" id={crl.id}>
        <div className={"collection-item avatar certs-collection " + active} onClick={this.handleClick}>
          <div className="rectangle" style={rectangleStyle} />
          <div className="col s11">
            <div className="collection-title ">{crl.issuerFriendlyName}</div>
            <div className="collection-info cert-info ">{crl.issuerFriendlyName}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default CRLListItem;
