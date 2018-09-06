import PropTypes from "prop-types";
import React from "react";
import SignatireStatusCicrcle from "../Signature/SignatureStatusCircle";

interface IFileRedux {
  active: boolean;
  extension: string;
  filename: string;
  fullpath: string;
  id: number;
  lastModifiedDate: Date;
  socket: string;
}

interface IFilelistItemProps {
  file: IFileRedux;
  operation: string;
  onClickBtn: (event: any) => void;
  removeFiles: (event: any) => void;
  index: string;
}

class FileListItem extends React.Component<IFilelistItemProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  componentDidMount() {
    $(".file-setting-item").dropdown({
      inDuration: 300,
      outDuration: 225,
      constrain_width: false,
      gutter: 0,
      belowOrigin: false,
      alignment: "left",
    },
    );
  }

  shouldComponentUpdate(nextProps: IFilelistItemProps) {
    return nextProps.file.active !== this.props.file.active || nextProps.file.id !== this.props.file.id;
  }

  stopEvent(event: any) {
    event.stopPropagation();
  }

  openFile(event: any, file: string) {
    event.stopPropagation();
    window.electron.shell.openItem(file);
  }

  openFileFolder(event: any, path: string) {
    event.stopPropagation();
    window.electron.shell.showItemInFolder(path);
  }

  getSignatureStatusCicrcle() {
    const { operation, file } = this.props;

    if (operation !== "sign") {
      return null;
    }

    return (
      <SignatireStatusCicrcle fileId={file.id} />
    );
  }

  render() {
    const { localize, locale } = this.context;
    const { file, style } = this.props;

    const self = this;
    let active = "";

    if (file.active) {
      active = "active";
    }

    return (
      <div style={style}>
        <div className={"collection-item avatar files-collection " + active} id={"file-" + this.props.index} onClick={this.props.onClickBtn}>
          <div className="r-iconbox-link">
            <div className="r-iconbox-icon"><i className={file.extension + " icon_file_type"} id="file-avatar"></i></div>
            <p className="collection-title">{file.filename}</p>
            <p className="collection-info-files">{file.lastModifiedDate.toLocaleDateString(locale, {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
            })}</p>
          </div>
          {this.getSignatureStatusCicrcle()}
          <i className="file-setting-item waves-effect material-icons secondary-content"
            data-activates={"dropdown-btn-set-file-" + this.props.index} onClick={self.stopEvent}>more_vert</i>
          <ul id={"dropdown-btn-set-file-" + this.props.index} className="dropdown-content">
            <li><a onClick={function(event: any) { self.openFile(event, file.fullpath); }}>{localize("Settings.open_file", locale)}</a></li>
            {
              file.socket ? null
                :
                <div>
                  <li><a onClick={function(event: any) { self.openFileFolder(event, file.fullpath); }}>{localize("Settings.go_to_file", locale)}</a></li>
                  <li><a onClick={this.props.removeFiles}>{localize("Settings.delete_file", locale)}</a></li>
                </div>
            }
          </ul>
        </div>
      </div>
    );
  }
}

export default FileListItem;
