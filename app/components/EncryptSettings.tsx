import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import {
  changeArchiveFilesBeforeEncrypt, changeDeleteFilesAfterEncrypt,
  changeEncryptEncoding, changeEncryptOutfolder, toggleSaveToDocuments,
} from "../AC";
import { DEFAULT_DOCUMENTS_PATH } from "../constants";
import CheckBoxWithLabel from "./CheckBoxWithLabel";
import EncodingTypeSelector from "./EncodingTypeSelector";
import HeaderWorkspaceBlock from "./HeaderWorkspaceBlock";
import SelectFolder from "./SelectFolder";

const dialog = window.electron.remote.dialog;

interface IEncryptSettingsProps {
  changeDeleteFilesAfterEncrypt: (del: boolean) => void;
  changeEncryptOutfolder: (path: string) => void;
  changeEncryptEncoding: (encoding: string) => void;
  changeArchiveFilesBeforeEncrypt: (archive: boolean) => void;
  saveToDocuments: boolean;
  settings: {
    archive: boolean,
    delete: boolean,
    encoding: string,
    outfolder: string,
    saveToDocuments: boolean,
  };
  toggleSaveToDocuments: (saveToDocuments: boolean) => void;
}

class EncryptSettings extends React.Component<IEncryptSettingsProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  addDirect() {
    // tslint:disable-next-line:no-shadowed-variable
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
    // tslint:disable-next-line:no-shadowed-variable
    const { changeDeleteFilesAfterEncrypt, settings } = this.props;
    changeDeleteFilesAfterEncrypt(!settings.delete);
  }

  handleArchiveClick = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { changeArchiveFilesBeforeEncrypt, settings } = this.props;
    changeArchiveFilesBeforeEncrypt(!settings.archive);
  }

  handleOutfolderChange = (ev: any) => {
    ev.preventDefault();
    // tslint:disable-next-line:no-shadowed-variable
    const { changeEncryptOutfolder } = this.props;
    changeEncryptOutfolder(ev.target.value);
  }

  handleEncodingChange = (encoding: string) => {
    // tslint:disable-next-line:no-shadowed-variable
    const { changeEncryptEncoding } = this.props;
    changeEncryptEncoding(encoding);
  }

  handleSaveToDocumentsClick = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { toggleSaveToDocuments, saveToDocuments } = this.props;
    toggleSaveToDocuments(!saveToDocuments);
  }

  render() {
    const { saveToDocuments, settings } = this.props;
    const { localize, locale } = this.context;

    return (
      <div id="encode-settings-content" className="content-wrapper z-depth-1">
        <HeaderWorkspaceBlock text={localize("Encrypt.encrypt_setting", locale)} />
        <div className="settings-content">
          <EncodingTypeSelector EncodingValue={settings.encoding} handleChange={this.handleEncodingChange} />
          <CheckBoxWithLabel onClickCheckBox={this.handleDeleteClick}
            isChecked={settings.delete}
            elementId="delete_files"
            title={localize("Encrypt.delete_files_after", locale)} />
          <CheckBoxWithLabel onClickCheckBox={this.handleArchiveClick}
            isChecked={settings.archive}
            elementId="archive_files"
            title={localize("Encrypt.archive_files_before", locale)} />
          <CheckBoxWithLabel onClickCheckBox={this.handleSaveToDocumentsClick}
            isChecked={saveToDocuments}
            elementId="saveToDocuments"
            title={localize("Documents.save_to_documents", locale)} />
          <SelectFolder
            directory={saveToDocuments ? DEFAULT_DOCUMENTS_PATH : settings.outfolder}
            viewDirect={this.handleOutfolderChange}
            openDirect={this.addDirect.bind(this)}
          />
        </div>
      </div>
    );
  }
}

export default connect((state) => ({
  saveToDocuments: state.settings.saveToDocuments,
  settings: state.settings.encrypt,
}), { changeArchiveFilesBeforeEncrypt, changeDeleteFilesAfterEncrypt, changeEncryptEncoding, changeEncryptOutfolder, toggleSaveToDocuments }, null, { pure: false })(EncryptSettings);
