import * as React from "react";
import { Link } from "react-router";
import { CertificatesApp, certs_app } from "../module/certificates_app";
import { encrypt, EncryptApp } from "../module/encrypt_app";
import { DialogBox, dlg, extFile, lang, SETTINGS_JSON } from "../module/global_app";
import { getLicensePath, getStatus, lic, licenseParse } from "../module/license";
import * as native from "../native";
import { application } from "./certificate";
import HeaderWorkspaceBlock from "./HeaderWorkspaceBlock";

//declare let $: any;
//declare let mainWindow: any;

export interface IFiles extends File {
    path: string;
}

const dialog = window.electron.remote.dialog;

interface ILicenseKeyProps {
    text_info: string;
    closeWindow: () => void;
    icon: string;
}
interface ILicenseKeyState {
    license_file: string;
    license_key: string;
}
export class LicenseKey extends React.Component<ILicenseKeyProps, ILicenseKeyState> {
    constructor(props: ILicenseKeyProps) {
        super(props);
        this.state = ({ license_file: "", license_key: "" });
    }
    componentDidMount() {
        $("input#input_file, textarea#input_key").characterCounter();
    }
    paste() {
        $("#input_key").focus();
        document.execCommand("paste");
        $("#input_key").trigger("autoresize");
    }
    setupLicense() {
        let licFilePath = getLicensePath();
        let path = native.path.dirname(licFilePath);

        let command = "";

        if (window.PLATFORM !== "win32") {
            command = "sh -c " + "\"";
            command = command + "mkdir -p " + "'" + path + "'" + " && ";
        } else {
            if (!native.fs.existsSync(path)) {
                command = command + " mkdir " + '"' + path + '"' + " && ";
            }
        }

        let status: any;
        let options = {
            name: "Trusted eSign",
        };
        if (this.state.license_key) {
            let data = licenseParse(this.state.license_key);
            if (data.sub !== "-") {
                status = getStatus(this.state.license_key);
                if (status.type === "ok") {
                    if (window.PLATFORM === "win32") {
                        command = command + "echo " + this.state.license_key.trim() + " > " + '"' + licFilePath + '"';
                    } else {
                        command = command + " printf " + this.state.license_key.trim() + " > " + "'" + licFilePath + "'" + " && ";
                        command = command + " chmod 777 " + "'" + licFilePath + "'" + "\"";
                    }
                    window.sudo.exec(command, options, function (error: any) {
                        if (!error) {
                            trusted.common.OpenSSL.stop();
                            trusted.common.OpenSSL.run();

                            let certificates = window.PKIITEMS.filter(function (item: trusted.pkistore.PkiItem) {
                                return item.type === "CERTIFICATE";
                            });

                            for (let item of certificates) {
                                item.status = undefined;
                            }

                            lic.setInfo = data;
                            lic.setStatus = status;
                            $(".toast-lic_key_setup").remove();
                            Materialize.toast(lang.get_resource.License.lic_key_setup, 2000, "toast-lic_key_setup");
                        } else {
                            $(".toast-write_file_error").remove();
                            Materialize.toast(lang.get_resource.Common.write_file_error, 2000, "toast-write_file_error");
                        }
                    });
                } else {
                    $(".toast-status.message").remove();
                    Materialize.toast(status.message, 2000, "toast-status.message");
                }
            } else {
                $(".toast-lic_key_uncorrect").remove();
                Materialize.toast(lang.get_resource.License.lic_key_uncorrect, 2000, "toast-lic_key_uncorrect");
            }
        } else {
            if (native.fs.existsSync(this.state.license_file)) {
                let data: string = native.fs.readFileSync(this.state.license_file, "utf8");
                if (data) {
                    data = data.trim();
                    let info = licenseParse(data);
                    if (info.sub !== "-") {
                        status = getStatus(data);
                        if (status.type === "ok") {
                            if (window.PLATFORM === "win32") {
                                command = command + "echo " + data + " > " + '"' + licFilePath + '"';
                            } else {
                                command = command + " printf " + data + " > " + "'" + licFilePath + "'" + " && ";
                                command = command + " chmod 777 " + "'" + licFilePath + "'" + "\""
                            }
                            window.sudo.exec(command, options, function (error: any) {
                                if (!error) {
                                    trusted.common.OpenSSL.stop();
                                    trusted.common.OpenSSL.run();

                                    let certificates = window.PKIITEMS.filter(function (item: trusted.pkistore.PkiItem) {
                                        return item.type === "CERTIFICATE";
                                    });

                                    for (let item of certificates) {
                                        item.status = undefined;
                                    }

                                    lic.setInfo = info;
                                    lic.setStatus = status;
                                    $(".toast-lic_key_setup").remove();
                                    Materialize.toast(lang.get_resource.License.lic_key_setup, 2000, "toast-lic_key_setup");
                                } else {
                                    $(".toast-write_file_error").remove();
                                    Materialize.toast(lang.get_resource.Common.write_file_error, 2000, "toast-write_file_error");
                                }
                            });
                        } else {
                            $(".toast-status.message").remove();
                            Materialize.toast(status.message, 2000, "toast-status.message");
                        }
                    } else {
                        $(".toast-lic_file_uncorrect").remove();
                        Materialize.toast(lang.get_resource.License.lic_file_uncorrect, 2000, "toast-lic_file_uncorrect");
                    }
                } else {
                    $(".toast-read_file_error").remove();
                    Materialize.toast(lang.get_resource.Common.read_file_error, 2000, "toast-read_file_error");
                }
            } else {
                $(".toast-lic_file_not_found").remove();
                Materialize.toast(lang.get_resource.License.lic_file_not_found, 2000, "toast-lic_file_not_found");
            }
        }
        this.props.closeWindow();
    }
    openLicenseFile() {
        if (!window.framework_NW) {
            let file = dialog.showOpenDialog({
                filters: [
                    { name: lang.get_resource.License.license, extensions: ["lic"] },
                ],
                properties: ["openFile"],
            });
            if (file) {
                $("#input_file").focus();
                this.setState({ license_file: file[0], license_key: this.state.license_key });
            }
        }
    }
    render() {
        let self = this;
        let disable = this.state.license_file || this.state.license_key ? "" : "disabled";
        return <div id="add-licence-key" className="modal licence-modal">
            <div className="licence-modal-main">
                <HeaderWorkspaceBlock text={lang.get_resource.License.enter_key} new_class="modal-bar" icon="close" onСlickBtn={this.props.closeWindow.bind(this)} />
                <div className="licence-modal-content">
                    <div className="license-key">
                        <div className="input-field col s6 input-field-licence">
                            <i className="material-icons prefix key-prefix">vpn_key</i>
                            <textarea id="input_key" className="materialize-textarea" value={this.state.license_key} onChange={function (e: any) {
                                self.setState({ license_file: self.state.license_file, license_key: e.target.value })
                            } } />
                            <label htmlFor="input_key">{lang.get_resource.License.entered_the_key}</label>
                            <a className="nav-small-btn waves-effect" onClick={this.paste.bind(this)}>
                                <i className="nav-small-icon material-icons">content_copy</i>
                            </a>
                        </div>
                    </div>
                    <div className="or">
                        {lang.get_resource.Common.or}
                    </div>
                    <div className="license-file">
                        <div className="input-field col s6 input-field-licence">
                            <i className="material-icons prefix key-prefix">vpn_key</i>
                            <input id="input_file" type="text" value={this.state.license_file} onChange={function (e: any) {
                                self.setState({ license_file: e.target.value, license_key: self.state.license_key })
                            } } />
                            <label htmlFor="input_file">{lang.get_resource.License.lic_file_choose}</label>
                            <a className="nav-small-btn waves-effect" onClick={this.openLicenseFile.bind(this)}>
                                <i className="nav-small-icon material-icons">insert_drive_file</i>
                            </a>
                        </div>
                    </div>
                    <div className="license-btn">
                        <a className={"waves-effect waves-light btn " + disable} onClick={this.setupLicense.bind(this)}>{lang.get_resource.License.Entered}</a>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export class Dialog extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.changeSettings = this.changeSettings.bind(this);
    }
    componentDidMount() {
        dlg.on(DialogBox.SETTINGS, this.changeSettings);
    }
    componentWillUnmount() {
        dlg.removeListener(DialogBox.SETTINGS, this.changeSettings);
    }
    changeSettings() {
        this.setState({});
    }
    clickYes() {
        dlg.CloseDialog(true);
    }
    clickNo() {
        dlg.CloseDialog(false);
    }
    render() {
        let active = "";
        if (dlg.get_dlg_open) {
            active = "active";
        }
        return (
            <div className={"dialog " + active}>
                <div className="dialog-content">
                    <HeaderWorkspaceBlock text={dlg.get_dlg_title} new_class="dialog-bar" />
                    <div className="dialog-text">
                        <div className="dialog-message">{dlg.get_dlg_message}</div>
                    </div>
                    <div className="dialog-buttons">
                        <a className="waves-effect waves-light btn dialog-btn" onClick={this.clickYes.bind(this)}>{lang.get_resource.Common.yes}</a>
                        <a className="waves-effect waves-light btn dialog-btn" onClick={this.clickNo.bind(this)}>{lang.get_resource.Common.no}</a>
                    </div>
                </div>
            </div>
        );
    }
};
