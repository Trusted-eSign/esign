import * as React from "react";
import { lang } from "../module/global_app";
interface IEncodingTypeProps {
    EncodingValue: string;
}
export class EncodingType extends React.Component<IEncodingTypeProps, any> {
    constructor(props: IEncodingTypeProps) {
        super(props);
    }
    render() {
        return <div className="row settings-item">
            <div className="col sign-set-encoding">{lang.get_resource.Settings.encoding}</div>
            <div className="col input-field">
                <select id="encoding" defaultValue={this.props.EncodingValue}>
                    <option value={lang.get_resource.Settings.BASE}>{lang.get_resource.Settings.BASE}</option>
                    <option value={lang.get_resource.Settings.DER}>{lang.get_resource.Settings.DER}</option>
                </select>
            </div>
        </div>;
    }
}
interface ICheckBoxWithLabelProps {
    checkbox_checked: (event: any) => void;
    check: boolean;
    id_name: string;
    text: string;
}
export class CheckBoxWithLabel extends React.Component<ICheckBoxWithLabelProps, any> {
    constructor(props: ICheckBoxWithLabelProps) {
        super(props);
    }
    render() {
        return <div className="row settings-item">
            <div className="col settins-check-title">{this.props.text}</div>
            <div className="col settings-check">
                <input type="checkbox" id={this.props.id_name} className="filled-in" onClick={this.props.checkbox_checked.bind(this)} defaultChecked={this.props.check} />
                <label htmlFor={this.props.id_name}></label>
            </div>
        </div>;
    }
}
interface ISelectFolderProps {
    directory: string;
    viewDirect: (event: any) => void;
    openDirect: () => void;
}
export class SelectFolder extends React.Component<ISelectFolderProps, any> {
    constructor(props: ISelectFolderProps) {
        super(props);
    }
    render() {
        return <div className="row settings-item">
            <div className="col sign-set-add-folder">
                <input type="file" ref={node => node && node.setAttribute("nwdirectory", "")} id="choose-folder" onChange={this.props.viewDirect.bind(this)} />
                <input id="directory" type="text" placeholder={lang.get_resource.Settings.directory_file_save}
                    value={this.props.directory} onChange={this.props.viewDirect.bind(this)} />
                <a className="btn-add-folder waves-effect" id="add-directory" onClick={this.props.openDirect.bind(this)}>
                    <i className="material-icons choosefolder">create_new_folder</i>
                </a>
            </div>
        </div>;
    }
}
