import PropTypes from "prop-types";
import * as React from "react";
import { connect } from "react-redux";
import { activeFile, deleteFile, selectFile } from "../AC";
import { dlg } from "../module/global_app";
import { mapToArr } from "../utils";
import FileListItem from "./FileListItem";

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
}

interface IFileRedux {
  active: boolean;
  extension: string;
  filename: string;
  fullpath: string;
  id: string;
  lastModifiedDate: Date;
}

interface IFileSelectorProps {
  activeFile: (id: string, active?: boolean) => void;
  deleteFile: (fileId: string) => void;
  operation: string;
  files: IFileRedux[];
  selectFile: (fullpath: string) => void;
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

  addFiles() {
    // tslint:disable-next-line:no-shadowed-variable
    const { selectFile } = this.props;

    dialog.showOpenDialog(null, { properties: ["openFile", "multiSelections"] }, (selectedFiles: string[]) => {
      if (selectedFiles) {
        for (const file of selectedFiles) {
          selectFile(file);
        }
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

  dropFiles(files: IFile[]) {
    // tslint:disable-next-line:no-shadowed-variable
    const { selectFile } = this.props;

    for (const file of files) {
      selectFile(file.path);
    }
  }

  checkFolder(event: any, cb: (items: any, files: IFile[], folder: boolean) => void) {
    const files: IFile[] = [];
    const fItems: IFile[] = [];
    const items = event.dataTransfer.items;

    let counter = 0;
    let folder = false;

    for (const item of items) {
      counter++;
      const entry = item.webkitGetAsEntry();
      fItems.push(entry);
      if (entry) {
        if (entry.isFile) {
          entry.file((dropfile: IFile) => {
            counter--;
            files.push(dropfile);
            if (!counter) {
              cb(fItems, files, folder);
            }
          });
        } else if (entry.isDirectory) {
          const dirReader = entry.createReader();

          dirReader.readEntries((entries: any) => {
            counter--;
            for (const entrie of entries) {
              counter++;

              if (entrie.isFile) {
                entrie.file((filesys: IFile) => {
                  counter--;
                  files.push(filesys);

                  if (!counter) {
                    cb(fItems, files, folder);
                  }
                });
              } else {
                counter--;
                folder = true;
                if (!counter) {
                  cb(fItems, files, folder);
                }
              }
            }
            if (!counter) {
              cb(fItems, files, folder);
            }
          });
        }
      }
    }
  }

  dropFolderAndFiles(item: any, cb: (err: Error | null, files: IFile[]) => void) {
    const self = this;
    const files: IFile[] = [];
    let counter = 0;
    counter++;
    if (item) {
      if (item.isFile) {
        item.file((dropfile: IFile) => {
          counter--;
          files.push(dropfile);
          if (!counter) {
            cb(null, files);
          }
        });
      } else if (item.isDirectory) {
        const dirReader = item.createReader();

        dirReader.readEntries((entries: any) => {
          counter--;
          for (const entrie of entries) {
            counter++;
            if (entrie.isFile) {
              entrie.file((filesys: IFile) => {
                counter--;
                files.push(filesys);
                if (!counter) {
                  cb(null, files);
                }
              });
            } else {
              self.dropFolderAndFiles(entrie, (err, filesArr) => {
                counter--;
                for (const file of filesArr) {
                  files.push(file);
                }
                if (!counter) {
                  cb(null, filesArr);
                }
              });
            }
          }
          if (!counter) {
            cb(null, files);
          }
        });
      }
    }
  }

  dropHandler(event: any) {
    const { localize, locale } = this.context;

    event.stopPropagation();
    event.preventDefault();
    event.target.classList.remove("draggedOver");

    const zone = document.querySelector("#droppableZone");
    if (zone) {
      zone.classList.remove("droppableZone-active");
    }

    this.checkFolder(event, (items, files, folder) => {
      if (folder) {
        dlg.ShowDialog(localize("Common.add_files", locale), localize("Common.add_all_files", locale), (code) => {
          if (code) {
            for (const item of items) {
              this.dropFolderAndFiles(item, (err, filesArr) => {
                this.dropFiles(filesArr);
              });
            }
          } else {
            this.dropFiles(files);
          }
        });
      } else {
        this.dropFiles(files);
      }
    });
  }

  dropZoneActive() {
    const zone = document.querySelector("#droppableZone");
    if (zone) {
      zone.classList.add("droppableZone-active");
    }
  }

  toggleActive(file: any) {
    // tslint:disable-next-line:no-shadowed-variable
    const { activeFile } = this.props;

    activeFile(file.id, !file.active);
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

  removeFile = (id: string) => {
    // tslint:disable-next-line:no-shadowed-variable
    const { deleteFile } = this.props;

    deleteFile(id);
  }

  removeAllFiles() {
    // tslint:disable-next-line:no-shadowed-variable
    const { files, deleteFile } = this.props;

    for (const file of files) {
      deleteFile(file.id);
    }
  }

  render() {
    // tslint:disable-next-line:no-shadowed-variable
    const { files, deleteFile } = this.props;
    const { localize, locale } = this.context;

    const self = this;
    const active = files.length > 0 ? "active" : "not-active";
    const collection = files.length > 0 ? "collection" : "";
    const disabled = files.length > 0 ? "" : "disabled";
    return (
      <div className={"file-content-height " + active}>
        <div id="file-content" className="content-wrapper z-depth-1">
          <nav className="app-bar-content">
            <ul className="app-bar-items">
              <li className="app-bar-item" style={appBarStyle}><span>{localize("Settings.add_files", locale)}</span></li>
              <li className="right">
                <a className={"nav-small-btn waves-effect waves-light " + active} onClick={this.addFiles.bind(this)}>
                  <i className="material-icons nav-small-icon">add</i>
                </a>
                <a className={"nav-small-btn waves-effect waves-light " + disabled} data-activates="dropdown-btn-set-add-files">
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
          <div className="add">
            <div id="droppableZone" onDragEnter={(event: any) => this.dragEnterHandler(event)}
              onDrop={(event: any) => this.dropHandler(event)}
              onDragOver={(event: any) => this.dragOverHandler(event)}
              onDragLeave={(event: any) => this.dragLeaveHandler(event)}>
            </div>
            <div className="add-files" onDragEnter={this.dropZoneActive.bind(this)}>
              <div className={"add-file-item " + active} id="items-hidden">
                <a className="add-file-but waves-effect waves-light btn-large" id="fileSelect" onClick={this.addFiles.bind(this)}>{localize("Settings.choose_files", locale)}</a>
                <div className="add-file-item-text">{localize("Settings.drag_drop", locale)}</div>
                <i className="material-icons large fullscreen">fullscreen</i>
              </div>
              <div className={"add-files-collection " + collection}>
                {files.map((file: IFileRedux, i: number) => {
                  return <FileListItem
                    removeFiles={() => this.removeFile(file.id)}
                    onClickBtn={() => this.toggleActive(file)}
                    file={file}
                    index={i}
                    operation={self.props.operation}
                    key={file.id}
                  />;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect((state) => {
  return {
    files: mapToArr(state.files.entities),
  };
}, { activeFile, deleteFile, selectFile })(FileSelector);
