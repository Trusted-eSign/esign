import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { verifyCertificate } from "../../AC";

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
  cert: any;
}

class CertificateListItem extends React.Component<ICertificateListItemProps, ICertificateListItemProps> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  shouldComponentUpdate(nextProps: ICertificateListItemProps, nextState: ICertificateListItemProps) {
    return nextProps.isOpen !== this.props.isOpen ||
      nextProps.cert.verified !== this.props.cert.verified;
  }

  handleClick = () => {
    const { chooseCert, toggleOpen } = this.props;

    chooseCert();
    toggleOpen();
  }

  render() {
    const { cert, operation, isOpen } = this.props;

    let active = "";
    let curStatusStyle;
    let curKeyStyle;
    let rectangleStyle;

    const status = cert.status;

    if (status) {
      curStatusStyle = "cert_status_ok";
      rectangleStyle = rectangleValidStyle;
    } else {
      curStatusStyle = "cert_status_error";
      rectangleStyle = rectangleUnvalidStyle;
    }

    if (operation === "encrypt" || operation === "sign") {
      curKeyStyle = cert.key.length > 0 ? curKeyStyle = "key short" : curKeyStyle = "";
      curStatusStyle += " short";
    } else {
      curKeyStyle = cert.key.length > 0 ? curKeyStyle = "key" : curKeyStyle = "";
    }

    if (isOpen) {
      active = "active";
    }

    return (
      <div className="row certificate-list-item" id={cert.id}>
        <div className={"collection-item avatar certs-collection " + active}
          onClick={this.handleClick}>
          <div className="rectangle" style={rectangleStyle}></div>
          <div className="col s11">
            <div className="collection-title ">{cert.subjectFriendlyName}</div>
            <div className="collection-info cert-info ">{cert.issuerFriendlyName}</div>
          </div>
          <div className="col s1">
            <div className={curKeyStyle}></div>
            <div className={curStatusStyle}></div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(null, { verifyCertificate })(CertificateListItem);
