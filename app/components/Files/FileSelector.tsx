import { is } from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { activeFile, deleteFile, filePackageDelete, filePackageSelect, selectFile } from "../../AC";
import { SIGN } from "../../constants";
import { loadingRemoteFilesSelector } from "../../selectors";
import { mapToArr } from "../../utils";
import ProgressBars from "../ProgressBars";
import FileList from "./FileList";

const dialog = window.electron.remote.dialog;

const appBarStyle = {
  width: "calc(100% - 85px)",
};

interface IFile {
  lastModified: number;
  lastModifiedDate: Date;
  name: string;
  path: string;
  size: number;
  type: string;
  webkitRelativePath: string;
  remoteId?: string;
  socket?: string;
}

interface IFilePath {
  fullpath: string;
  extra?: any;
  socket?: string;
}

interface IFileRedux {
  active: boolean;
  extension: string;
  filename: string;
  fullpath: string;
  id: number;
  lastModifiedDate: Date;
  remoteId: string;
  socket: string;
}

export interface IRemoteFile {
  extra: any;
  id: number;
  loaded: boolean;
  loading: boolean;
  name: string;
  socketId: string;
  totalSize: number;
  url: string;
}

interface IFileSelectorProps {
  activeFile: (id: number, active?: boolean) => void;
  deleteFile: (fileId: number) => void;
  operation: string;
  loadingFiles: IRemoteFile[];
  files: IFileRedux[];
  selectFile: (fullpath: string, name?: string, lastModifiedDate?: Date, size?: number) => void;
  selectedFilesPackage: boolean;
  selectingFilesPackage: boolean;
  filePackageSelect: (files: IFilePath[]) => void;
  filePackageDelete: (filesId: number[]) => void;
}

class FileSelector extends React.Component<IFileSelectorProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  componentDidMount() {
    $(".nav-small-btn, .file-setting-item").dropdown({
      alignment: "left",
      belowOrigin: false,
      gutter: 0,
      inDuration: 300,
      outDuration: 225,
    });
  }

  shouldComponentUpdate(nextProps: IFileSelectorProps) {
    const { files, loadingFiles, selectingFilesPackage } = this.props;

    if (selectingFilesPackage !== nextProps.selectingFilesPackage) {
      return true;
    }

    if (loadingFiles.length !== nextProps.loadingFiles.length) {
      return true;
    }

    if (selectingFilesPackage || nextProps.selectingFilesPackage) {
      return false;
    }

    if (!selectingFilesPackage && !nextProps.selectingFilesPackage && nextProps.files.length !== this.props.files.length) {
      return true;
    }

    if (files.length === nextProps.files.length) {
      for (let i = 0; i <= files.length; i++) {
        if (is(files[i], nextProps.files[i])) {
          continue;
        } else {
          return true;
        }
      }
    }

    return false;
  }

  addFiles() {
    // tslint:disable-next-line:no-shadowed-variable
    const { filePackageSelect } = this.props;

    dialog.showOpenDialog(null, { properties: ["openFile", "multiSelections"] }, (selectedFiles: string[]) => {
      if (selectedFiles) {
        const pack: IFilePath[] = [];

        selectedFiles.forEach((file) => {
          pack.push({fullpath: file});
        });

        filePackageSelect(pack);
      }
    });
  }

  dragLeaveHandler(event: any) {
    event.target.classList.remove("draggedOver");

    const zone = document.querySelector("#droppableZone");
    if (zone) {
      zone.classList.remove("droppableZone-active");
    }
  }

  dragEnterHandler(event: any) {
    event.target.classList.add("draggedOver");
  }

  dragOverHandler(event: any) {
    event.stopPropagation();
    event.preventDefault();
  }

  directoryReader = (reader: any) => {
    reader.readEntries((entries: any) => {
      entries.forEach((entry: any) => {
        this.scanFiles(entry);
      });

      if (entries.length === 100) {
        this.directoryReader(reader);
      }
    });
  }

  scanFiles = (item: any) => {
    // tslint:disable-next-line:no-shadowed-variable
    const { selectFile } = this.props;

    if (item.isDirectory) {
      const reader = item.createReader();

      this.directoryReader(reader);
    } else {
      item.file((dropfile: IFile) => {
        selectFile(dropfile.path, dropfile.name, dropfile.lastModifiedDate, dropfile.size);
      });
    }
  }

  dropHandler = (event: any) => {
    event.stopPropagation();
    event.preventDefault();
    event.target.classList.remove("draggedOver");

    const zone = document.querySelector("#droppableZone");
    if (zone) {
      zone.classList.remove("droppableZone-active");
    }

    const items = event.dataTransfer.items;

    for (const item of items) {
      const entry = item.webkitGetAsEntry();

      if (entry) {
        this.scanFiles(entry);
      }
    }
  }

  dropZoneActive() {
    const zone = document.querySelector("#droppableZone");
    if (zone) {
      zone.classList.add("droppableZone-active");
    }
  }

  selectedAll() {
    // tslint:disable-next-line:no-shadowed-variable
    const { files, activeFile } = this.props;

    for (const file of files) {
      activeFile(file.id);
    }
  }

  removeSelectedAll() {
    // tslint:disable-next-line:no-shadowed-variable
    const { files, activeFile } = this.props;

    for (const file of files) {
      activeFile(file.id, false);
    }
  }

  removeAllFiles() {
    // tslint:disable-next-line:no-shadowed-variable
    const { filePackageDelete, files } = this.props;

    const filePackage: number[] = [];

    for (const file of files) {
      filePackage.push(file.id);
    }

    filePackageDelete(filePackage);
  }

  render() {
    // tslint:disable-next-line:no-shadowed-variable
    const { files, operation } = this.props;

    const active = files.length > 0 ? "active" : "not-active";
    const operationSign = operation === SIGN ? "operation_sign" : "";

    return (
      <div className={`file-content-height ${active} ${operationSign}`}>
        <div id="file-content" className="content-wrapper z-depth-1">
          {this.getHeader()}
          {this.getBody()}
        </div>
      </div>
    );
  }

  getHeader() {
    const { localize, locale } = this.context;
    const { files } = this.props;

    const active = files.length > 0 ? "active" : "not-active";
    const disabled = files.length > 0 ? "" : "disabled";
    const classDisabled = this.getDisabled() ? "disabled" : "";

    return (
      <nav className="app-bar-content">
        <ul className="app-bar-items">
          <li className="app-bar-item" style={appBarStyle}><span>{localize("Settings.add_files", locale)}</span></li>
          <li className="right">
            <a className={"nav-small-btn waves-effect waves-light " + active + " " + classDisabled} onClick={this.addFiles.bind(this)}>
              <i className="material-icons nav-small-icon">add</i>
            </a>
            <a className={"nav-small-btn waves-effect waves-light " + disabled + classDisabled} data-activates="dropdown-btn-set-add-files">
              <i className="nav-small-icon material-icons">more_vert</i>
            </a>
            <ul id="dropdown-btn-set-add-files" className="dropdown-content">
              <li><a onClick={this.selectedAll.bind(this)}>{localize("Settings.selected_all", locale)}</a></li>
              <li><a onClick={this.removeSelectedAll.bind(this)}>{localize("Settings.remove_selected", locale)}</a></li>
              <li><a onClick={this.removeAllFiles.bind(this)}>{localize("Settings.remove_all_files", locale)}</a></li>
            </ul>
          </li>
        </ul>
      </nav>
    );
  }

  getBody() {
    const { localize, locale } = this.context;
    const { loadingFiles, files, selectingFilesPackage } = this.props;

    if (selectingFilesPackage) {
      return <ProgressBars />;
    }

    const active = files.length > 0 || loadingFiles.length > 0 ? "active" : "not-active";
    const collection = files.length > 0 || loadingFiles.length > 0 ? "collection" : "";
    const  disabled = this.getDisabled();

    return (
      <div className="add">
        {
          disabled ?
            null
            :
            <div id="droppableZone" onDragEnter={(event: any) => this.dragEnterHandler(event)}
              onDrop={(event: any) => this.dropHandler(event)}
              onDragOver={(event: any) => this.dragOverHandler(event)}
              onDragLeave={(event: any) => this.dragLeaveHandler(event)}>
            </div>
        }
        <div onDragEnter={this.dropZoneActive.bind(this)}>
          <div className={"add-file-item " + active} id="items-hidden">
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <a className="add-file-but waves-effect waves-light btn-large" id="fileSelect" onClick={this.addFiles.bind(this)}>{localize("Settings.choose_files", locale)}</a>
            <div className="add-file-item-text">{localize("Settings.drag_drop", locale)}</div>
            <i className="material-icons large fullscreen">fullscreen</i>
          </div>
          <div className={collection}>
            <FileList operation={this.props.operation} />
          </div>
        </div>
      </div>
    );
  }

  getDisabled = () => {
    const { files, loadingFiles } = this.props;

    if (loadingFiles.length) {
      return true;
    }

    if (files.length) {
      for (const file of files) {
        if (file.socket) {
          return true;
        }
      }
    }

    return false;
  }
}

export default connect((state) => {
  return {
    files: mapToArr(state.files.entities),
    loadingFiles: loadingRemoteFilesSelector(state, { loading: true }),
    selectedFilesPackage: state.files.selectedFilesPackage,
    selectingFilesPackage: state.files.selectingFilesPackage,
  };
}, { activeFile, deleteFile, filePackageSelect, filePackageDelete, selectFile })(FileSelector);
