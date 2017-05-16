import * as React from "react";
import { lang } from "../module/global_app";
import { application } from "./certificate";
import { SearchElement } from "./components";

declare const $: any;

interface IToolBarWithSearchProps {
  disable: string;
  import: (event: any) => void;
  operation: string;
}

export class ToolBarWithSearch extends React.Component<IToolBarWithSearchProps, any> {
  constructor(props: IToolBarWithSearchProps) {
    super(props);
  }

  certImport = () => {
    application.emit("import_cert", "");
  }

  render() {
    let btn: any = null;
    let style = {};

    if (this.props.operation === "certificate") {
      btn = <li className="right import-col">
        <input type="file" className="input-file" id="choose-cert" value="" onChange={this.props.import} />
        <a className={"nav-small-btn waves-effect waves-light " + this.props.disable} data-activates="dropdown-btn-import">
          <i className="nav-small-icon material-icons cert-settings">more_vert</i>
        </a>
        <ul id="dropdown-btn-import" className="dropdown-content">
          <li><a onClick={this.certImport}>{lang.get_resource.Certificate.cert_import}</a></li>
        </ul>
      </li>;
    } else {
      style = { width: 100 + "%", paddingRight: 0.75 + "rem" };
    }

    return <nav className="app-bar-cert">
      <ul className="app-bar-items">
        <li className="cert-bar-text" style={style}>
          <SearchElement operation={this.props.operation} />
        </li>
        {btn}
      </ul>
    </nav>;
  }
}
