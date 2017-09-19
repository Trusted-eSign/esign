import * as React from "react";
import { connect } from "react-redux";
import { verifyCertificate } from "../AC";

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
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

  constructor(props: ICertificateListItemProps) {
    super(props);
  }

  shouldComponentUpdate(nextProps: ICertificateListItemProps, nextState: ICertificateListItemProps) {
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
    this.checkAndVerify(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.checkAndVerify(nextProps);
  }

  checkAndVerify({ cert, verifyCertificate }) {
    if (!cert.verified) {
      verifyCertificate(cert.id);
    }
  }

  handleClick = () => {
    const { chooseCert, toggleOpen } = this.props;

    chooseCert();
    toggleOpen();
  }

  render() {
    const { cert, chooseCert, operation, selectedCert, toggleOpen, isOpen } = this.props;
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
        curKeyStyle = cert.key.length > 0 ? curKeyStyle = "key short" : curKeyStyle = "";
        curStatusStyle += " short";
    } else {
        curKeyStyle = cert.key.length > 0 ? curKeyStyle = "key" : curKeyStyle = "";
    }

    if (isOpen) {
      active = "active";
    }

    if (operation === "certificate" && cert.key.length === 0 && cert.provider === "SYSTEM") {
      certKeyMenu = (
        <div>
          <i className="cert-setting-item waves-effect material-icons secondary-content"
            data-activates={"cert-key-set-file"} onClick={this.stopEvent}>more_vert</i>
          <ul id={"cert-key-set-file"} className="dropdown-content">
            <li><a onClick={this.addCertKey}>{localize("Certificate.import_key", locale)}</a></li>
          </ul>
        </div>
      );
    } else {
      certKeyMenu = null;
    }

    return (
      <div className={"collection-item avatar certs-collection " + active}
        onClick={this.handleClick}>
        <div className="r-iconbox-link">
          <div className={"rectangle"} style={rectangleStyle}></div>
          <div className="collection-title">{cert.subjectFriendlyName}</div>
          <div className="collection-info cert-info ">{cert.issuerFriendlyName}
          <div className={curKeyStyle}></div>
          <div className={curStatusStyle}></div>
          </div>
        </div>
        {certKeyMenu}
      </div>
    );
  }
}

export default connect(null, { verifyCertificate })(CertificateListItem);
