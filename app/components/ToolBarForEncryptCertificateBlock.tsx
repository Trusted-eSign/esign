import PropTypes from "prop-types";
import React from "react";

const appBarStyle = {
  width: "calc(100% - 85px)",
};

class ToolBarForEncryptCertificateBlock extends React.Component<any, any> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  render() {
    const { localize, locale } = this.context;
    const { certificates, recipients, handleCleanRecipientsList, onСlickBtn } = this.props;

    const ACTIVE = recipients.length > 0 ? "" : "not-active";

    return <nav className="app-bar-content">
      <ul className="app-bar-items">
        <li className="app-bar-item" style={appBarStyle}><span>{localize("Certificate.certs_encrypt", locale)}</span></li>
        <li className="right">
          <a className={"nav-small-btn waves-effect waves-light " + ACTIVE} onClick={onСlickBtn.bind(this)}>
            <i className="material-icons nav-small-icon">add</i>
          </a>
          <a className={"nav-small-btn waves-effect waves-light " + ACTIVE} data-activates="dropdown-btn-set-cert">
            <i className="nav-small-icon material-icons">more_vert</i>
          </a>
          <ul id="dropdown-btn-set-cert" className="dropdown-content">
            <li><a onClick={handleCleanRecipientsList}>{localize("Settings.remove_list", locale)}</a></li>
          </ul>
        </li>
      </ul>
    </nav>;
  }
}

export default ToolBarForEncryptCertificateBlock;
