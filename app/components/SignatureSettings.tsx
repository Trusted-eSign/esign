import * as React from "react";
import { connect } from "react-redux";
import {
  changeSignatureDetached, changeSignatureEncoding,
  changeSignatureOutfolder, changeSignatureTimestamp,
} from "../AC";
import { lang } from "../module/global_app";
import { sign, SignApp } from "../module/sign_app";
import CheckBoxWithLabel from "./CheckBoxWithLabel";
import EncodingTypeSelector from "./EncodingTypeSelector";
import HeaderWorkspaceBlock from "./HeaderWorkspaceBlock";
import SelectFolder from "./SelectFolder";

const dialog = window.electron.remote.dialog;

class SignatureSettings extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  addDirect() {
    const { changeSignatureOutfolder } = this.props;

    if (!window.framework_NW) {
      const directory = dialog.showOpenDialog({ properties: ["openDirectory"] });
      if (directory) {
        changeSignatureOutfolder(directory[0]);
      }
    } else {
      const clickEvent = document.createEvent("MouseEvents");
      clickEvent.initEvent("click", true, true);
      document.querySelector("#choose-folder").dispatchEvent(clickEvent);
    }
  }

  handleDetachedClick = () => {
    const { changeSignatureDetached, settings } = this.props;
    changeSignatureDetached(!settings.detached);
  }

  handleTimestampClick = () => {
    const { changeSignatureTimestamp, settings } = this.props;
    changeSignatureTimestamp(!settings.timestamp);
  }

  handleOutfolderChange = ev => {
    console.log("ev.target.value", ev.target.value);
    ev.preventDefault();
    const { changeSignatureOutfolder } = this.props;
    changeSignatureOutfolder(ev.target.value);
  }

  render() {
    const { settings } = this.props;

    return (
      <div id="sign-settings-content" className="content-wrapper z-depth-1">
        <HeaderWorkspaceBlock text={lang.get_resource.Sign.sign_setting} />
        <div className="settings-content">
          <EncodingTypeSelector EncodingValue={settings.encoding} />
          <CheckBoxWithLabel onClickCheckBox={this.handleDetachedClick}
            isChecked={settings.detached}
            elementId="detached-sign"
            title={lang.get_resource.Sign.sign_detached} />
          <CheckBoxWithLabel onClickCheckBox={this.handleTimestampClick}
            isChecked={settings.timestamp}
            elementId="sign-time"
            title={lang.get_resource.Sign.sign_time} />
          <SelectFolder directory={settings.outfolder} viewDirect={this.handleOutfolderChange}
            openDirect={this.addDirect.bind(this)} />
        </div>
      </div>
    );
  }
}

export default connect((state) => ({
  settings: state.settings.sign,
}), { changeSignatureDetached, changeSignatureEncoding, changeSignatureOutfolder, changeSignatureTimestamp })(SignatureSettings)
