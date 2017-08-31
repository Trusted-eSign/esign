import * as React from "react";

class ToolBarForEncryptCertificateBlock extends React.Component<any, any> {
  static contextTypes = {
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

  constructor(props) {
    super(props);
  }

  render() {
    const { localize, locale } = this.context;

    const CERTIFICATES_FOR_ENCRYPT = this.props.certificates;
    const DISABLED = CERTIFICATES_FOR_ENCRYPT.length > 0 ? "" : "disabled";
    const ACTIVE = CERTIFICATES_FOR_ENCRYPT.length > 0 ? "active" : "not-active";

    return <nav className="app-bar-content">
      <ul className="app-bar-items">
        <li className="app-bar-item" style={{ width: "calc(100% - 85px)" }}><span>{localize("Certificate.certs_encrypt", locale)}</span></li>
        <li className="right">
          <a className={"nav-small-btn waves-effect waves-light " + ACTIVE} onClick={function () { $("#add-cert").openModal(); }}>
            <i className="material-icons nav-small-icon">add</i>
          </a>
          <a className={"nav-small-btn waves-effect waves-light " + DISABLED} data-activates="dropdown-btn-set-cert">
            <i className="nav-small-icon material-icons">more_vert</i>
          </a>
          <ul id="dropdown-btn-set-cert" className="dropdown-content">
            <li><a onClick={this.props.handleCleanList}>{localize("Settings.remove_list", locale)}</a></li>
          </ul>
        </li>
      </ul>
    </nav>;
  }
}

export default ToolBarForEncryptCertificateBlock;
