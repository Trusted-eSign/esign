import * as React from "react";
import { connect } from "react-redux";
import {
  changeArchiveFilesBeforeEncrypt, changeDeleteFilesAfterEncrypt,
  changeEncryptEncoding, changeEncryptOutfolder,
} from "../AC";
import { lang } from "../module/global_app";
import CheckBoxWithLabel from "./CheckBoxWithLabel";
import EncodingTypeSelector from "./EncodingTypeSelector";
import HeaderWorkspaceBlock from "./HeaderWorkspaceBlock";
import SelectFolder from "./SelectFolder";

const dialog = window.electron.remote.dialog;

class EncryptSettings extends React.Component<any, any> {
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

    return (
      <div id="encode-settings-content" className="content-wrapper z-depth-1">
        <HeaderWorkspaceBlock text={lang.get_resource.Encrypt.encrypt_setting} />
        <div className="settings-content">
          <EncodingTypeSelector EncodingValue={settings.encoding} handleChange={this.handleEncodingChange}/>
          <CheckBoxWithLabel onClickCheckBox={this.handleDeleteClick}
            isChecked={settings.delete}
            elementId="delete_files"
            title={lang.get_resource.Encrypt.delete_files_after} />
          <CheckBoxWithLabel onClickCheckBox={this.handleArchiveClick}
            isChecked={settings.archive}
            elementId="archive_files"
            title={lang.get_resource.Encrypt.archive_files_before} />
          <SelectFolder directory={settings.outfolder} viewDirect={this.handleOutfolderChange}
            openDirect={this.addDirect.bind(this)} />
        </div>
      </div>
    );
  }
}

export default connect((state) => ({
  settings: state.settings.encrypt,
}), { changeArchiveFilesBeforeEncrypt, changeDeleteFilesAfterEncrypt, changeEncryptEncoding, changeEncryptOutfolder })(EncryptSettings);
