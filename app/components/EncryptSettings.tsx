import * as React from "react";
import { connect } from "react-redux";
import {
  changeArchiveFilesBeforeEncrypt, changeDeleteFilesAfterEncrypt,
  changeEncryptEncoding, changeEncryptOutfolder,
} from "../AC";
import CheckBoxWithLabel from "./CheckBoxWithLabel";
import EncodingTypeSelector from "./EncodingTypeSelector";
import HeaderWorkspaceBlock from "./HeaderWorkspaceBlock";
import SelectFolder from "./SelectFolder";

const dialog = window.electron.remote.dialog;

class EncryptSettings extends React.Component<any, any> {
  static contextTypes = {
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

  constructor(props: any) {
    super(props);
  }

  addDirect() {
    const { changeEncryptOutfolder } = this.props;

    if (!window.framework_NW) {
      const directory = dialog.showOpenDialog({ properties: ["openDirectory"] });
      if (directory) {
        changeEncryptOutfolder(directory[0]);
      }
    } else {
      const clickEvent = document.createEvent("MouseEvents");
      clickEvent.initEvent("click", true, true);
      document.querySelector("#choose-folder").dispatchEvent(clickEvent);
    }
  }

  handleDeleteClick = () => {
    const { changeDeleteFilesAfterEncrypt, settings } = this.props;
    changeDeleteFilesAfterEncrypt(!settings.delete);
  }

  handleArchiveClick = () => {
    const { changeArchiveFilesBeforeEncrypt, settings } = this.props;
    changeArchiveFilesBeforeEncrypt(!settings.archive);
  }

  handleOutfolderChange = ev => {
    ev.preventDefault();
    const { changeEncryptOutfolder } = this.props;
    changeEncryptOutfolder(ev.target.value);
  }

  handleEncodingChange = (encoding: string) => {
    const { changeEncryptEncoding } = this.props;
    changeEncryptEncoding(encoding);
  }

  render() {
    const { settings } = this.props;
    const { localize, locale } = this.context;

    return (
      <div id="encode-settings-content" className="content-wrapper z-depth-1">
        <HeaderWorkspaceBlock text={localize("Encrypt.encrypt_setting", locale)} />
        <div className="settings-content">
          <EncodingTypeSelector EncodingValue={settings.encoding} handleChange={this.handleEncodingChange}/>
          <CheckBoxWithLabel onClickCheckBox={this.handleDeleteClick}
            isChecked={settings.delete}
            elementId="delete_files"
            title={localize("Encrypt.delete_files_after", locale)} />
          <CheckBoxWithLabel onClickCheckBox={this.handleArchiveClick}
            isChecked={settings.archive}
            elementId="archive_files"
            title={localize("Encrypt.archive_files_before", locale)} />
          <SelectFolder directory={settings.outfolder} viewDirect={this.handleOutfolderChange}
            openDirect={this.addDirect.bind(this)} />
        </div>
      </div>
    );
  }
}

export default connect((state) => ({
  settings: state.settings.encrypt,
}), { changeArchiveFilesBeforeEncrypt, changeDeleteFilesAfterEncrypt, changeEncryptEncoding, changeEncryptOutfolder }, null, {pure: false})(EncryptSettings);
