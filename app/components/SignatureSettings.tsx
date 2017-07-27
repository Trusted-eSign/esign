import * as React from "react";
import { lang } from "../module/global_app";
import { sign, SignApp } from "../module/sign_app";
import CheckBoxWithLabel from "./CheckBoxWithLabel";
import EncodingTypeSelector from "./EncodingTypeSelector";
import HeaderWorkspaceBlock from "./HeaderWorkspaceBlock";
import { SelectFolder } from "./settings_components";

const dialog = window.electron.remote.dialog;

class SignatureSettings extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.changeSettings = this.changeSettings.bind(this);
  }

  componentDidMount() {
    $("select").on("change", function(event: any) {
      sign.set_settings_encoding = event.target.value;
    });
    $("select").material_select();
    sign.on(SignApp.SETTINGS_CHANGE, this.changeSettings);
  }

  componentWillUnmount() {
    sign.removeListener(SignApp.SETTINGS_CHANGE, this.changeSettings);
  }

  changeSettings() {
    this.setState({});
  }

  addDirect() {
    if (!window.framework_NW) {
      const directory = dialog.showOpenDialog({ properties: ["openDirectory"] });
      if (directory) {
        sign.set_settings_directory = directory[0];
      }
    } else {
      const clickEvent = document.createEvent("MouseEvents");
      clickEvent.initEvent("click", true, true);
      document.querySelector("#choose-folder").dispatchEvent(clickEvent);
    }
  }

  render() {
    return (
      <div id="sign-settings-content" className="content-wrapper z-depth-1">
        <HeaderWorkspaceBlock text={lang.get_resource.Sign.sign_setting} />
        <div className="settings-content">
          <EncodingTypeSelector EncodingValue={sign.get_settings_encoding} />
          <CheckBoxWithLabel onClickCheckBox={() => { sign.set_settings_detached = !sign.get_settings_detached; }}
            isChecked={sign.get_settings_detached}
            elementId="detached-sign"
            title={lang.get_resource.Sign.sign_detached} />
          <CheckBoxWithLabel onClickCheckBox={() => { sign.set_settings_add_time = !sign.get_settings_add_time; }}
            isChecked={sign.get_settings_add_time}
            elementId="sign-time"
            title={lang.get_resource.Sign.sign_time} />
          <SelectFolder directory={sign.get_settings_directory} viewDirect={
            function(event: any) {
              sign.set_settings_directory = event.target.value;
            }}
            openDirect={this.addDirect.bind(this)} />
        </div>
      </div>
    );
  }
}

export default SignatureSettings;
