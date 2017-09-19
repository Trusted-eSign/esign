import * as React from "react";

interface ISelectFolderProps {
  directory: string;
  viewDirect: (event: any) => void;
  openDirect: () => void;
}

class SelectFolder extends React.Component<ISelectFolderProps, any> {
  static contextTypes = {
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

  constructor(props: ISelectFolderProps) {
    super(props);
  }

  render() {
    const { localize, locale } = this.context;

    return (
      <div className="row settings-item">
        <div className="col sign-set-add-folder">
          <input type="file" ref={(node) => node && node.setAttribute("nwdirectory", "")} id="choose-folder" onChange={this.props.viewDirect} />
          <input id="directory" type="text" placeholder={localize("Settings.directory_file_save", locale)}
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
