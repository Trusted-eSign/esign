import * as React from "react";
import { connect } from "react-redux";
import {
  changeSignatureDetached, changeSignatureEncoding,
  changeSignatureOutfolder, changeSignatureTimestamp,
} from "../AC";
import { BASE64, DER } from "../constants";
import CheckBoxWithLabel from "./CheckBoxWithLabel";
import EncodingTypeSelector from "./EncodingTypeSelector";
import HeaderWorkspaceBlock from "./HeaderWorkspaceBlock";
import SelectFolder from "./SelectFolder";

const dialog = window.electron.remote.dialog;

class SignatureSettings extends React.Component<any, any> {
  static contextTypes = {
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

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
    ev.preventDefault();
    const { changeSignatureOutfolder } = this.props;
    changeSignatureOutfolder(ev.target.value);
  }

  handleEncodingChange = (encoding: string) => {
    const { changeSignatureEncoding } = this.props;
    changeSignatureEncoding(encoding);
  }

  render() {
    const { settings } = this.props;
    const { localize, locale } = this.context;

    return (
      <div id="sign-settings-content" className="content-wrapper z-depth-1">
        <HeaderWorkspaceBlock text={localize("Sign.sign_setting", locale)} />
        <div className="settings-content">
          <EncodingTypeSelector EncodingValue={settings.encoding} handleChange={this.handleEncodingChange}/>
          <CheckBoxWithLabel onClickCheckBox={this.handleDetachedClick}
            isChecked={settings.detached}
            elementId="detached-sign"
            title={localize("Sign.sign_detached", locale)} />
          <CheckBoxWithLabel onClickCheckBox={this.handleTimestampClick}
            isChecked={settings.timestamp}
            elementId="sign-time"
            title={localize("Sign.sign_time", locale)} />
          <SelectFolder directory={settings.outfolder} viewDirect={this.handleOutfolderChange}
            openDirect={this.addDirect.bind(this)} />
        </div>
      </div>
    );
  }
}

export default connect((state) => ({
  settings: state.settings.sign,
}), { changeSignatureDetached, changeSignatureEncoding, changeSignatureOutfolder, changeSignatureTimestamp }, null, {pure: false})(SignatureSettings);
