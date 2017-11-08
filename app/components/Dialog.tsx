import * as React from "react";
import { DialogBox, dlg } from "../module/global_app";
import HeaderWorkspaceBlock from "./HeaderWorkspaceBlock";

const dialog = window.electron.remote.dialog;

class Dialog extends React.Component<any, any> {
  static contextTypes = {
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

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
    const { localize, locale } = this.context;
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
            <a className="waves-effect waves-light btn dialog-btn" onClick={this.clickYes.bind(this)}>{localize("Common.yes", locale)}</a>
            <a className="waves-effect waves-light btn dialog-btn" onClick={this.clickNo.bind(this)}>{localize("Common.no", locale)}</a>
          </div>
        </div>
      </div>
    );
  }
}

export default Dialog;
