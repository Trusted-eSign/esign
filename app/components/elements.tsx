import * as React from "react";
import { encrypt, EncryptApp } from "../module/encrypt_app";
import { sign, SignApp } from "../module/sign_app";

interface IBtnsForOperationProps {
    operation: string;
    btn_name_first: string;
    operation_first: () => void;
    btn_name_second: string;
    operation_second: () => void;
    btn_resign?: string;
    operation_resign?: () => void;
    btn_unsign?: string;
    operation_unsign?: () => void;
}
export class BtnsForOperation extends React.Component<IBtnsForOperationProps, any> {
    constructor(props: IBtnsForOperationProps) {
        super(props);
        this.change = this.change.bind(this);
    }
    componentDidMount() {
        encrypt.on(EncryptApp.FILES_CHANGE, this.change);
        encrypt.on(EncryptApp.SETTINGS, this.change);
        sign.on(SignApp.FILES_CHANGE, this.change);
        sign.on(SignApp.SETTINGS, this.change);
    }
    componentWillUnmount() {
        encrypt.removeListener(EncryptApp.FILES_CHANGE, this.change);
        encrypt.removeListener(EncryptApp.SETTINGS, this.change);
        sign.removeListener(SignApp.FILES_CHANGE, this.change);
        sign.removeListener(SignApp.SETTINGS, this.change);
    }
    change() {
        this.setState({});
    }
    render() {
        let files = this.props.operation === "sign" ? sign.get_files : encrypt.get_files;
        let active = files.length > 0 ? "active" : "";
        let files_operation = this.props.operation === "sign" ? sign.get_files_for_sign : encrypt.get_files_for_encrypt;
        let certs_operation: any = this.props.operation === "sign" ? sign.get_sign_certificate : encrypt.get_certificates_for_encrypt;
        let disabled_first = "";
        let disabled_second = "";
        let disabled_unsign = "disabled";
        let j = 0;
        if (files_operation.length > 0) {
            if (this.props.operation === "encrypt" && certs_operation.length > 0 ) {
                disabled_first = "";
            } else if (this.props.operation === "sign" && certs_operation) {
                disabled_first = "";
            } else {
                disabled_first = "disabled";
            }
            for (let i = 0; i < files_operation.length; i++) {
                if (this.props.operation === "sign" && files_operation[i].path.split(".").pop() === "sig") {
                    j++;
                } else if (this.props.operation === "encrypt" && files_operation[i].path.split(".").pop() === "enc") {
                    j++;
                    disabled_first = "disabled";
                }
            }
            if (this.props.operation === "encrypt" && j === files_operation.length) {
                disabled_second = "";
            } else if (this.props.operation === "sign" && j === files_operation.length) {
                disabled_second = "";
                disabled_unsign = "";
            } else {
                if (this.props.operation === "sign" && certs_operation) {
                     j > 0  ? disabled_first = "disabled" : disabled_first = "";
                }

                disabled_second = "disabled";
            }
        } else {
            disabled_first = "disabled";
            disabled_second = "disabled";
        }
        if (!disabled_unsign) {
            return (
                <div className={"btns-for-operation " + active}>
                    <a className={"waves-effect waves-light btn-large operation-btn " + disabled_first} onClick={this.props.operation_resign.bind(this)}>{this.props.btn_resign}</a>
                    <a className={"waves-effect waves-light btn-large operation-btn " + disabled_second} onClick={this.props.operation_second.bind(this)}>{this.props.btn_name_second}</a>
                    <a className={"waves-effect waves-light btn-large operation-btn " + disabled_unsign} onClick={this.props.operation_unsign.bind(this)}>{this.props.btn_unsign}</a>
                </div>
            );
        } else {
            return (
                <div className={"btns-for-operation " + active}>
                    <a className={"waves-effect waves-light btn-large operation-btn " + disabled_first} onClick={this.props.operation_first.bind(this)}>{this.props.btn_name_first}</a>
                    <a className={"waves-effect waves-light btn-large operation-btn " + disabled_second} onClick={this.props.operation_second.bind(this)}>{this.props.btn_name_second}</a>
                </div>
            );
        }
    }
}
interface ItemBarProps {
    text: string;
    second_text?: string;
    new_class?: string;
}
export class ItemBar extends React.Component<ItemBarProps, any> {
    render() {
        let class_name = this.props.new_class ? this.props.new_class : "";
        let text: any;
        if (this.props.second_text) {
            text = <div className="cert-title-main">
                <div className="collection-title cert-title">{this.props.text}</div>
                <div className="collection-info cert-info cert-title">{this.props.second_text}</div>
            </div>;
        } else {
            text = <span>{this.props.text}</span>;
        }
        return (
            <nav className={"app-bar-content " + class_name}>
                <ul className="app-bar-items">
                    <li className="app-bar-item" style={{ width: 100 + "%" }}>
                        {text}
                    </li>
                </ul>
            </nav>
        );
    }
}

interface ItemBarWithBtnProps {
    text: string;
    second_text?: string;
    on_btn_click: () => void;
    icon: string;
    new_class?: string;
}
export class ItemBarWithBtn extends React.Component<ItemBarWithBtnProps, any> {
    render() {
        let text: any;
        let class_name = this.props.new_class ? this.props.new_class : "";
        if (this.props.second_text) {
            text = <div className="cert-title-main">
                <div className="collection-title cert-title">{this.props.text}</div>
                <div className="collection-info cert-info cert-title">{this.props.second_text}</div>
            </div>;
        } else {
            text = <span>{this.props.text}</span>;
        }
        return (
            <nav className={"app-bar-content " + class_name}>
                <ul className="app-bar-items">
                    <li className="app-bar-item">
                        {text}
                    </li>
                    <li className="right">
                        <a className="nav-small-btn waves-effect waves-light" onClick={this.props.on_btn_click.bind(this)}>
                            <i className="nav-small-icon material-icons">{this.props.icon}</i>
                        </a>
                    </li>
                </ul>
            </nav>
        );
    }
}

interface ICollectionItemProps {
    first_text: string;
    second_text: string;
}
export class CollectionItem extends React.Component<ICollectionItemProps, any> {
    render() {
        return (
            <div className="collection-item certs-collection certificate-info">
                <div className="collection-title">{this.props.first_text}</div>
                <div className="collection-info cert-info">{this.props.second_text}</div>
            </div>
        );
    }
}
