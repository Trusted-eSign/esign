import * as React from "react";
import { DialogBox, dlg, lang } from "../module/global_app";
import * as native from "../native";
import HeaderWorkspaceBlock from "./HeaderWorkspaceBlock";

const dialog = window.electron.remote.dialog;

class Dialog extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.changeSettings = this.changeSettings.bind(this);
  }

  componentDidMount() {
    dlg.on(DialogBox.SETTINGS, this.changeSettings);
  }

  componentWillUnmount() {
    dlg.removeListener(DialogBox.SETTINGS, this.changeSettings);
  }

  changeSettings() {
    this.setState({});
  }

  clickYes() {
    dlg.CloseDialog(true);
  }

  clickNo() {
    dlg.CloseDialog(false);
  }

  render() {
    let active = "";

    if (dlg.get_dlg_open) {
      active = "active";
    }

    return (
      <div className={"dialog " + active}>
        <div className="dialog-content">
          <HeaderWorkspaceBlock text={dlg.get_dlg_title} new_class="dialog-bar" />
          <div className="dialog-text">
            <div className="dialog-message">{dlg.get_dlg_message}</div>
          </div>
          <div className="dialog-buttons">
            <a className="waves-effect waves-light btn dialog-btn" onClick={this.clickYes.bind(this)}>{lang.get_resource.Common.yes}</a>
            <a className="waves-effect waves-light btn dialog-btn" onClick={this.clickNo.bind(this)}>{lang.get_resource.Common.no}</a>
          </div>
        </div>
      </div>
    );
  }
}

export default Dialog;
