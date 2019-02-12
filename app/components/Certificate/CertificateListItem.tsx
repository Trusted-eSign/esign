import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { verifyCertificate } from "../../AC";
import { CRYPTOPRO_DSS } from "../../constants";
import { MEGAFON } from "../../service/megafon/constants";

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
  verifyCertificate: (id: any) => void;
}

class CertificateListItem extends React.Component<ICertificateListItemProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  timerHandle: NodeJS.Timer | null;

  shouldComponentUpdate(nextProps: ICertificateListItemProps) {
    return nextProps.isOpen !== this.props.isOpen ||
      nextProps.cert.verified !== this.props.cert.verified;
  }

  stopEvent = (event: any) => {
    event.stopPropagation();
  }

  addCertKey = () => {
    const CLICK_EVENT = document.createEvent("MouseEvents");

    CLICK_EVENT.initEvent("click", true, true);
    document.querySelector("#cert-key-import").dispatchEvent(CLICK_EVENT);
  }

  componentDidMount() {
    $(".cert-setting-item").dropdown();
  }

  handleClick = () => {
    const { chooseCert, toggleOpen } = this.props;

    this.timerHandle = setTimeout(() => {
      if (!cert.verified) {
        verifyCertificate(cert.id);
      }

      this.timerHandle = null;
    }, 2000);
  }

  componentWillUnmount() {
    if (this.timerHandle) {
      clearTimeout(this.timerHandle);
      this.timerHandle = null;
    }
  }

  render() {
    const { cert, operation, isOpen } = this.props;
    const { localize, locale } = this.context;

    let certKeyMenu: any = null;
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
      curKeyStyle = cert.key.length > 0 ? curKeyStyle = "key short " : curKeyStyle = "";
      curStatusStyle += " short";
    } else {
      curKeyStyle = cert.key.length > 0 ? curKeyStyle = "key " : curKeyStyle = "";
    }

    if (curKeyStyle) {
      if (cert.service) {
        if (cert.service === MEGAFON) {
          curKeyStyle += "megafonkey";
        } else if (cert.service === CRYPTOPRO_DSS) {
          curKeyStyle += "dsskey";
        }
      } else {
        curKeyStyle += "localkey";
      }
    }

    if (isOpen) {
      active = "active";
    }

    if (operation === "certificate" && cert.key.length === 0 && cert.provider === "SYSTEM") {
      certKeyMenu = (
        <React.Fragment>
          <i className="cert-setting-item waves-effect material-icons secondary-content"
            data-activates={"cert-key-set-file"} onClick={this.stopEvent}>more_vert</i>
          <ul id={"cert-key-set-file"} className="dropdown-content">
            <li><a onClick={this.addCertKey}>{localize("Certificate.import_key", locale)}</a></li>
          </ul>
        </React.Fragment>
      );
    } else {
      certKeyMenu = null;
    }

    return (
      <div className="row certificate-list-item" id={cert.id}>
        <div className={"collection-item avatar certs-collection " + active}
          onClick={this.handleClick}>
          <div className={"rectangle"} style={rectangleStyle}></div>
          <div className="col s11">
            <div className="collection-title ">{cert.subjectFriendlyName}</div>
            <div className="collection-info cert-info ">{cert.issuerFriendlyName}</div>
          </div>
          <div className="col s1">
            <div className={curKeyStyle}></div>
            <div className={curStatusStyle}></div>
          </div>
        </div>
        {certKeyMenu}
      </div>
    );
  }

  handleClick = () => {
    const { chooseCert, toggleOpen } = this.props;

    chooseCert();
    toggleOpen();
  }
}

export default connect(null, { verifyCertificate })(CertificateListItem);
