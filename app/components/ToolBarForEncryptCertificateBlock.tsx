import * as React from "react";
import { lang } from "../module/global_app";

class ToolBarForEncryptCetrificateBlock extends React.Component<any, any> {
  constructor(props) {
    super(props);
  }

  removeAllChooseCerts() {
    return;
  }

  render() {
    const CERTIFICATES_FOR_ENCRYPT = this.props.certificates;
    const DISABLED = CERTIFICATES_FOR_ENCRYPT.length > 0 ? "" : "disabled";
    const ACTIVE = CERTIFICATES_FOR_ENCRYPT.length > 0 ? "active" : "not-active";

    return <nav className="app-bar-content">
      <ul className="app-bar-items">
        <li className="app-bar-item" style={{ width: "calc(100% - 85px)" }}><span>{lang.get_resource.Certificate.certs_encrypt}</span></li>
        <li className="right">
          <a className={"nav-small-btn waves-effect waves-light " + ACTIVE} onClick={function () { $("#add-cert").openModal(); }}>
            <i className="material-icons nav-small-icon">add</i>
          </a>
          <a className={"nav-small-btn waves-effect waves-light " + DISABLED} data-activates="dropdown-btn-set-cert">
            <i className="nav-small-icon material-icons">more_vert</i>
          </a>
          <ul id="dropdown-btn-set-cert" className="dropdown-content">
            <li><a onClick={this.removeAllChooseCerts.bind(this)}>{lang.get_resource.Settings.remove_list}</a></li>
          </ul>
        </li>
      </ul>
    </nav>;
  }
}

export default ToolBarForEncryptCetrificateBlock;
