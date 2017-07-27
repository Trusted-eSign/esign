import * as React from "react";
import { encrypt, EncryptApp } from "../module/encrypt_app";
import { lang } from "../module/global_app";
import CheckBoxWithLabel from "./CheckBoxWithLabel";
import EncodingTypeSelector from "./EncodingTypeSelector";
import HeaderWorkspaceBlock from "./HeaderWorkspaceBlock";
import { SelectFolder } from "./settings_components";

const dialog = window.electron.remote.dialog;

class EncryptSettings extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.settingsChange = this.settingsChange.bind(this);
  }

  componentDidMount() {
    $("select").on("change", function (event: any) {
      encrypt.set_settings_encoding = event.target.value;
    });
    $("select").material_select();
    encrypt.on(EncryptApp.SETTINGS_CHANGE, this.settingsChange);
  }

  componentWillUnmount() {
    encrypt.removeListener(EncryptApp.SETTINGS_CHANGE, this.settingsChange);
  }

  settingsChange() {
    this.setState({});
  }

  addDirect() {
    if (!window.framework_NW) {
      const directory = dialog.showOpenDialog({ properties: ["openDirectory"] });
      if (directory) {
        encrypt.set_settings_directory = directory[0];
      }
    } else {
      const clickEvent = document.createEvent("MouseEvents");
      clickEvent.initEvent("click", true, true);
      document.querySelector("#choose-folder").dispatchEvent(clickEvent);
    }
  }

  render() {
    return (
      <div id="encode-settings-content" className="content-wrapper z-depth-1">
        <HeaderWorkspaceBlock text={lang.get_resource.Encrypt.encrypt_setting} />
        <div className="settings-content">
          <EncodingTypeSelector EncodingValue={encrypt.get_settings_encoding} />
          <CheckBoxWithLabel onClickCheckBox={() => { encrypt.set_settings_delete_files = !encrypt.get_settings_delete_files }}
            isChecked={encrypt.get_settings_delete_files}
            elementId="delete_files"
            title={lang.get_resource.Encrypt.delete_files_after} />
          <CheckBoxWithLabel onClickCheckBox={() => { encrypt.set_settings_archive_files = !encrypt.get_settings_archive_files }}
            isChecked={encrypt.get_settings_archive_files}
            elementId="archive_files"
            title={lang.get_resource.Encrypt.archive_files_before} />
          <SelectFolder directory={encrypt.get_settings_directory} viewDirect={
            function (event: any) {
              encrypt.set_settings_directory = event.target.value;
            }}
            openDirect={this.addDirect.bind(this)} />
        </div>
      </div>
    );
  }
}

export default EncryptSettings;
