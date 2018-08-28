import PropTypes from "prop-types";
import React from "react";
import SearchElement from "../Filters/SearchElement";

interface IToolBarWithSearchProps {
  disable?: string;
  rightBtnAction?: (event: any) => void;
  reloadCertificates?: () => void;
  handleShowModalCertificateRequest?: () => void;
  handleShowModalSelfSigned?: () => void;
  handleShowModalCloudCSP?: () => void;
  operation: string;
}

export class ToolBarWithSearch extends React.Component<IToolBarWithSearchProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  componentDidMount() {
    $(".nav-small-btn").dropdown();
  }

  certImport = () => {
    const CLICK_EVENT = document.createEvent("MouseEvents");

    CLICK_EVENT.initEvent("click", true, true);
    document.querySelector("#choose-cert").dispatchEvent(CLICK_EVENT);
  }

  render() {
    const { localize, locale } = this.context;

    let btn: any = null;
    let style = {};

    if (this.props.operation === "certificate") {
      btn = <li className="right import-col">
        <input type="file" className="input-file" id="choose-cert" value="" onChange={this.props.rightBtnAction} />
        <a className={"nav-small-btn waves-effect waves-light " + this.props.disable} data-activates="dropdown-btn-import">
          <i className="nav-small-icon material-icons cert-settings">more_vert</i>
        </a>
        <ul id="dropdown-btn-import" className="dropdown-content">
          <li><a onClick={this.props.reloadCertificates}>{localize("Common.update_list", locale)}</a></li>
          <li><a onClick={this.certImport}>{localize("Certificate.cert_import_from_file", locale)}</a></li>
          <li><a onClick={this.props.handleShowModalCloudCSP}>{localize("CloudCSP.cert_import_from_cloudCSP", locale)}</a></li>
          <li><a onClick={this.props.handleShowModalCertificateRequest}>{localize("CSR.create_request", locale)}</a></li>
        </ul>
      </li>;
    } else if (this.props.operation === "containers") {
      btn = <li className="right import-col">
        <input type="file" className="input-file" id="choose-cert" value="" />
        <a className={"nav-small-btn waves-effect waves-light "} data-activates="dropdown-btn-import">
          <i className="nav-small-icon material-icons cert-settings">more_vert</i>
        </a>
        <ul id="dropdown-btn-import" className="dropdown-content">
          <li><a onClick={this.props.rightBtnAction}>{localize("Common.update", locale)}</a></li>
        </ul>
      </li>;
    } else {
      style = { width: 100 + "%", paddingRight: 0.75 + "rem" };
    }

    return <nav className="app-bar-cert">
      <ul className="app-bar-items">
        <li className="cert-bar-text" style={style}>
          <SearchElement />
        </li>
        {btn}
      </ul>
    </nav>;
  }
}
