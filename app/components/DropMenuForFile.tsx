import * as React from "react";
import { lang } from "../module/global_app";

interface IDropMenuForFileProps {
  file_name: string;
  file_date: Date;
  file_path: string;
  file_type: string;
  verify_status: string;
  index: string;
  operation: string;
  active_file: boolean;
  onClickBtn: (event: any) => void;
  removeFiles: (event: any) => void;
}

class DropMenuForFile extends React.Component<IDropMenuForFileProps, any> {
  constructor(props: IDropMenuForFileProps) {
    super(props);
  }

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

  componentDidUpdate() {
    $('.tooltipped').tooltip('remove');
    $('.tooltipped').tooltip({ delay: 50 });
  }

  stopEvent(event: any) {
    event.stopPropagation();
  }

  openFile(event: any, file: string) {
    event.stopPropagation();
    window.electron.shell.openItem(this.props.file_path);
  }

  openFileFolder(event: any, path: string) {
    event.stopPropagation();
    window.electron.shell.showItemInFolder(this.props.file_path);
  }

  render() {
    let self = this;
    let classStatus = "";
    let toolTipText = "";
    let active = "";
    if (this.props.active_file) {
      active = "active";
    }
    if (this.props.operation === "sign") {
      if (this.props.verify_status === "status_ok") {
        classStatus = this.props.verify_status + " tooltipped";
        toolTipText = lang.get_resource.Sign.sign_ok;
      } else if (this.props.verify_status === "status_error") {
        classStatus = this.props.verify_status + " tooltipped";
        toolTipText = lang.get_resource.Sign.sign_error;
      }
    }
    return <div className={"collection-item avatar files-collection " + active} id={"file-" + this.props.index} onClick={this.props.onClickBtn}>
      <div className="r-iconbox-link">
        <div className="r-iconbox-icon"><i className={this.props.file_type} id="file-avatar"></i></div>
        <p className="collection-title">{this.props.file_name}</p>
        <p className="collection-info">{this.props.file_date.toLocaleDateString(lang.get_lang, {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        })}</p>
      </div>
      <i className={classStatus} data-position="left" data-delay="50" data-tooltip={toolTipText} onClick={function () { $(".tooltipped").tooltip("remove"); }}></i>
      <i className="file-setting-item waves-effect material-icons secondary-content"
        data-activates={"dropdown-btn-set-file-" + this.props.index} onClick={self.stopEvent}>more_vert</i>
      <ul id={"dropdown-btn-set-file-" + this.props.index} className="dropdown-content">
        <li><a onClick={function (event: any) { self.openFile(event, self.props.file_path); }}>{lang.get_resource.Settings.open_file}</a></li>
        <li><a onClick={function (event: any) { self.openFileFolder(event, self.props.file_path); }}>{lang.get_resource.Settings.go_to_file}</a></li>
        <li><a onClick={this.props.removeFiles}>{lang.get_resource.Settings.delete_file}</a></li>
      </ul>
    </div>;
  }
}

export default DropMenuForFile;
