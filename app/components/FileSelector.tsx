import * as React from "react";
import { connect } from "react-redux";
import { activeFile, deleteFile, selectFile } from "../AC";
import { encrypt, EncryptApp } from "../module/encrypt_app";
import { dlg, lang } from "../module/global_app";
import { sign, SignApp } from "../module/sign_app";
import * as native from "../native";
import { extFile, mapToArr } from "../utils";
import { application } from "./certificate";
import DropMenuForFile from "./DropMenuForFile";

const dialog = window.electron.remote.dialog;

interface IFileSelectorProps {
  operation: string;
}

class FileSelector extends React.Component<IFileSelectorProps, any> {
  constructor(props: IFileSelectorProps) {
    super(props);
  }

  componentDidMount() {
    $(".nav-small-btn, .file-setting-item").dropdown({
      inDuration: 300,
      outDuration: 225,
      constrain_width: false,
      gutter: 0,
      belowOrigin: false,
      alignment: "left",
    },
    );
  }

  addFiles() {
    const { selectFile } = this.props;

    if (!window.framework_NW) {
      dialog.showOpenDialog(null, { properties: ["openFile", "multiSelections"] }, function (selectedFiles: string[]) {
        if (selectedFiles) {
          for (const file of selectedFiles) {
            selectFile(file);
          }
        }
      });
    } else {
      const clickEvent = document.createEvent("MouseEvents");
      clickEvent.initEvent("click", true, true);
      document.querySelector("#choose-file").dispatchEvent(clickEvent);
    }
  }

  dragLeaveHandler(event: any) {
    event.target.classList.remove("draggedOver");
    document.querySelector("#droppableZone").classList.remove("droppableZone-active");
  }

  dragEnterHandler(event: any) {
    event.target.classList.add("draggedOver");
  }

  dragOverHandler(event: any) {
    event.stopPropagation();
    event.preventDefault();
  }

  dropFiles(files: IFiles[]) {
    const { selectFile } = this.props;

    for (const file of files) {
      selectFile(file.path);
    }
  }

  checkFolder(event: any, cb: (items: any, files: IFiles[], folder: boolean) => void) {
    let items = event.dataTransfer.items;
    let counter = 0;
    let files: IFiles[] = [];
    let folder = false;
    let fItems: any = [];
    for (let i = 0; i < items.length; i++) {
      counter++;
      let item = items[i].webkitGetAsEntry();
      fItems.push(item);
      if (item) {
        if (item.isFile) {
          item.file(function (Dropfile: any) {
            counter--;
            files.push(Dropfile);
            if (!counter) cb(fItems, files, folder);
          });
        } else if (item.isDirectory) {
          let dirReader = item.createReader();
          dirReader.readEntries(function (entries: any) {
            counter--;
            for (let j = 0; j < entries.length; j++) {
              counter++;
              if (entries[j].isFile) {
                entries[j].file(function (filesys: any) {
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

  dropFolderAndFiles(item: any, cb: (err: Error, files: IFiles[]) => void) {
    let self = this;
    let files: IFiles[] = [];
    let counter = 0;
    counter++;
    if (item) {
      if (item.isFile) {
        item.file(function (Dropfile: any) {
          counter--;
          files.push(Dropfile);
          if (!counter) {
            cb(null, files);
          }
        });
      } else if (item.isDirectory) {
        let dirReader = item.createReader();
        dirReader.readEntries(function (entries: any) {
          counter--;
          for (let j = 0; j < entries.length; j++) {
            counter++;
            if (entries[j].isFile) {
              entries[j].file(function (filesys: any) {
                counter--;
                files.push(filesys);
                if (!counter) {
                  cb(null, files);
                }
              });
            } else {
              self.dropFolderAndFiles(entries[j], (err, file) => {
                counter--;
                for (let s = 0; s < file.length; s++) {
                  files.push(file[s]);
                }
                if (!counter) {
                  cb(null, files);
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
    event.stopPropagation();
    event.preventDefault();
    event.target.classList.remove("draggedOver");
    document.querySelector("#droppableZone").classList.remove("droppableZone-active");
    this.checkFolder(event, (items, files, folder) => {
      if (folder) {
        dlg.ShowDialog(lang.get_resource.Common.add_files, lang.get_resource.Common.add_all_files, (code) => {
          if (code) {
            for (let i = 0; i < items.length; i++) {
              this.dropFolderAndFiles(items[i], (err, files) => {
                this.dropFiles(files);
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
    document.querySelector("#droppableZone").classList.add("droppableZone-active");
  }

  toggleActive(file: any) {
    const { activeFile } = this.props;

    activeFile(file.id, !file.active);
  }

  selectedAll() {
    const { files, activeFile } = this.props;

    for (const file of files) {
      activeFile(file.id);
    }
  }

  removeSelectedAll() {
    const { files, activeFile } = this.props;

    for (const file of files) {
      activeFile(file.id, false);
    }
  }

  removeFile = (event: any, id: string) => {
    const { deleteFile } = this.props;

    deleteFile(id);
  }

  removeAllFiles() {
    const { files, deleteFile } = this.props;

    for (const file of files) {
      deleteFile(file.id);
    }
  }

  render() {
    const { files, deleteFile } = this.props;
    const self = this;
    let active = files.length > 0 ? "active" : "not-active";
    let collection = files.length > 0 ? "collection" : "";
    let disabled = files.length > 0 ? "" : "disabled";
    return (
      <div className={"file-content-height " + active}>
        <div id="file-content" className="content-wrapper z-depth-1">
          <nav className="app-bar-content">
            <ul className="app-bar-items">
              <li className="app-bar-item" style={{ width: "calc(100% - 85px)" }}><span>{lang.get_resource.Settings.add_files}</span></li>
              <li className="right">
                <a className={"nav-small-btn waves-effect waves-light " + active} onClick={this.addFiles.bind(this)}>
                  <i className="material-icons nav-small-icon">add</i>
                </a>
                <a className={"nav-small-btn waves-effect waves-light " + disabled} data-activates="dropdown-btn-set-add-files">
                  <i className="nav-small-icon material-icons">more_vert</i>
                </a>
                <ul id="dropdown-btn-set-add-files" className="dropdown-content">
                  <li><a onClick={this.selectedAll.bind(this)}>{lang.get_resource.Settings.selected_all}</a></li>
                  <li><a onClick={this.removeSelectedAll.bind(this)}>{lang.get_resource.Settings.remove_selected}</a></li>
                  <li><a onClick={this.removeAllFiles.bind(this)}>{lang.get_resource.Settings.remove_all_files}</a></li>
                </ul>
              </li>
            </ul>
          </nav>
          <div className="add">
            <div id="droppableZone" onDragEnter={function (event: any) { self.dragEnterHandler(event); }}
              onDrop={function (event: any) { self.dropHandler(event); }}
              onDragOver={function (event: any) { self.dragOverHandler(event); }}
              onDragLeave={function (event: any) { self.dragLeaveHandler(event); }}>
            </div>
            <div className="add-files" onDragEnter={this.dropZoneActive.bind(this)}>
              <div className={"add-file-item " + active} id="items-hidden">
                <a className="add-file-but waves-effect waves-light btn-large" id="fileSelect" onClick={this.addFiles.bind(this)}>{lang.get_resource.Settings.choose_files}</a>
                <div className="add-file-item-text">{lang.get_resource.Settings.drag_drop}</div>
                <i className="material-icons large fullscreen">fullscreen</i>
              </div>
              <div className={"add-files-collection " + collection}>
                {files.map((file) => {
                  return <DropMenuForFile removeFiles={function (event: any) { self.removeFile(event, file.id); }}
                    onClickBtn={function (event: any) { self.toggleActive(file); }}
                    file_name={file.filename}
                    file_date={file.lastModifiedDate}
                    file_path={file.fullpath}
                    file_type={file.extension}
                    verify_status={file.verified}
                    index={file.key}
                    operation={self.props.operation}
                    active_file={file.active}
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
