import * as React from "react";
import { lang } from "../module/global_app";

interface ISelectFolderProps {
  directory: string;
  viewDirect: (event: any) => void;
  openDirect: () => void;
}

class SelectFolder extends React.Component<ISelectFolderProps, any> {
  constructor(props: ISelectFolderProps) {
    super(props);
  }

  render() {
    return (
      <div className="row settings-item">
        <div className="col sign-set-add-folder">
          <input type="file" ref={node => node && node.setAttribute("nwdirectory", "")} id="choose-folder" onChange={this.props.viewDirect.bind(this)} />
          <input id="directory" type="text" placeholder={lang.get_resource.Settings.directory_file_save}
            value={this.props.directory} onChange={this.props.viewDirect.bind(this)} />
          <a className="btn-add-folder waves-effect" id="add-directory" onClick={this.props.openDirect.bind(this)}>
            <i className="material-icons choosefolder">create_new_folder</i>
          </a>
        </div>
      </div>
    );
  }
}

export default SelectFolder;
