import * as React from "react";
import { encrypt, EncryptApp } from "../module/encrypt_app";
import { checkFiles, DialogBox, dlg, extFile, lang, LangApp } from "../module/global_app";
import * as native from "../native";
import * as encrypts from "../trusted/encrypt";
import { utils } from "../utils";
import { application, CertComponentsForEncrypt } from "./certificate";
import { Dialog, FileComponents, MainToolBar } from "./components";
import { BtnsForOperation, ItemBar } from "./elements";
import { CheckBoxWithLabel, EncodingType, SelectFolder } from "./settings_components";
//declare let $: any;

const dialog = window.electron.remote.dialog;

export class EncryptWindow extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.change = this.change.bind(this);
    }
    componentDidMount() {
        lang.on(LangApp.SETTINGS, this.change);
    }
    componentWillUnmount() {
        lang.removeListener(LangApp.SETTINGS, this.change);
    }
    change() {
        this.setState({});
    }
    encrypt() {
        if (checkFiles("encrypt")) {
            let certs = encrypt.get_certificates_for_encrypt;
            let pathes = encrypt.get_files_for_encrypt;
            let format = trusted.DataFormat.PEM;
            let folderOut = encrypt.get_settings_directory;
            let policies = { deleteFiles: false, archiveFiles: false };
            let res = true;

            if (folderOut.length > 0) {
                if (!utils.dirExists(folderOut)) {
                    $(".toast-failed_find_directory").remove();
                    Materialize.toast(lang.get_resource.Settings.failed_find_directory, 2000, "toast-failed_find_directory");
                    return;
                }
            }
            policies.deleteFiles = encrypt.get_settings_delete_files;
            policies.archiveFiles = encrypt.get_settings_archive_files;

            if (encrypt.get_settings_encoding !== lang.get_resource.Settings.BASE) {
                format = trusted.DataFormat.DER;
            }

            let enc_files: any = [];

            if (policies.archiveFiles) {
                let outURI: string;
                if (folderOut.length > 0) {
                    outURI = native.path.join(folderOut, lang.get_resource.Encrypt.archive_name);
                } else {
                    outURI = native.path.join(native.HOME_DIR, lang.get_resource.Encrypt.archive_name);
                }

                let output = native.fs.createWriteStream(outURI);
                let archive = window.archiver("zip");

                output.on("close", function () {
                    $(".toast-files_archived").remove();
                    Materialize.toast(lang.get_resource.Encrypt.files_archived, 2000, "toast-files_archived");

                    if (policies.deleteFiles) {
                        pathes.forEach(function (path: any) {
                            native.fs.unlinkSync(path.path);
                        });
                    }

                    let newPath = encrypts.encryptFile(outURI, certs, policies, format, folderOut);
                    if (newPath) {
                        let date = new Date();
                        if (pathes.length === 1) {
                            pathes[0].path = newPath;
                            pathes[0].date = date;
                            pathes[0].name = native.path.basename(pathes[0].path);
                            pathes[0].ext = extFile(pathes[0].name);
                            encrypt.set_files_for_encrypt = pathes;
                        } else {
                            application.emit("encrypt_archive", newPath, date);
                        }
                    } else {
                        res = false;
                    }

                    if (res) {
                        $(".toast-files_encrypt").remove();
                        Materialize.toast(lang.get_resource.Encrypt.files_encrypt, 2000, "toast-files_encrypt");
                    } else {
                        $(".toast-files_encrypt_failed").remove();
                        Materialize.toast(lang.get_resource.Encrypt.files_encrypt_failed, 2000, "toast-files_encrypt_failed");
                    }
                });

                archive.on('error', function () {
                    $(".toast-files_archived_failed").remove();
                    Materialize.toast(lang.get_resource.Encrypt.files_archived_failed, 2000, "toast-files_archived_failed");
                });

                archive.pipe(output);

                pathes.forEach(function (path: any) {
                    archive.append(native.fs.createReadStream(path.path), { name: native.path.basename(path.path) });
                });

                archive.finalize();
            } else {
                pathes.forEach(function (path: any, i: any) {
                    let newPath = encrypts.encryptFile(path.path, certs, policies, format, folderOut);
                    if (newPath) {
                        let birthtime = native.fs.statSync(newPath).birthtime;
                        pathes[i].path = newPath;
                        pathes[i].date = birthtime;
                        pathes[i].name = native.path.basename(pathes[i].path);
                        pathes[i].ext = extFile(pathes[i].name);
                    } else {
                        res = false;
                    }
                });

                if (res) {
                    $(".toast-files_encrypt").remove();
                    Materialize.toast(lang.get_resource.Encrypt.files_encrypt, 2000, "toast-files_encrypt");
                } else {
                    $(".toast-files_encrypt_failed").remove();
                    Materialize.toast(lang.get_resource.Encrypt.files_encrypt_failed, 2000, "toast-files_encrypt_failed");
                }

                encrypt.set_files_for_encrypt = pathes;
            }
        }
    }
    decrypt() {
        if (checkFiles("decrypt")) {
            let pathes = encrypt.get_files_for_encrypt;
            let folderOut = encrypt.get_settings_directory;
            let res = true;

            pathes.forEach(function (path: any, i: any) {
                let newPath = encrypts.decryptFile(path.path, folderOut);
                let date = new Date();
                if (newPath) {
                    pathes[i].path = newPath;
                    pathes[i].date = date;
                    pathes[i].name = native.path.basename(pathes[i].path);
                    pathes[i].ext = extFile(pathes[i].name);
                } else {
                    res = false;
                }
            });
            encrypt.set_files_for_encrypt = pathes;
            if (res) {
                $(".toast-files_decrypt").remove();
                Materialize.toast(lang.get_resource.Encrypt.files_decrypt, 2000, "toast-files_decrypt");
            } else {
                $(".toast-files_decrypt_failed").remove();
                Materialize.toast(lang.get_resource.Encrypt.files_decrypt_failed, 2000, "toast-files_decrypt_failed");
            }
        }
    }

    render() {
        return (
            <div className="main">
                <Dialog />
                <div className="content">
                    <div className="content-tem">
                        <div className="col s6 m6 l6 content-item">
                            <CertComponentsForEncrypt />
                        </div>
                        <div className="col s6 m6 l6 content-item">
                            <EncodeSettingsComponents />
                        </div>
                    </div>
                    <div className="col s6 m6 l6 content-item-height">
                        <BtnsForOperation
                            btn_name_first={lang.get_resource.Encrypt.encrypt}
                            btn_name_second={lang.get_resource.Encrypt.decrypt}
                            operation_first={this.encrypt.bind(this)}
                            operation_second={this.decrypt.bind(this)}
                            operation="encrypt" />
                        <FileComponents operation="encrypt" />
                    </div>
                </div>
            </div>
        );
    }
}

class EncodeSettingsComponents extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.settingsChange = this.settingsChange.bind(this);
    }
    componentDidMount() {
        $("select").on("change", function (event: any) {
            encrypt.set_settings_encoding = event.target.value;
        });
        $("select").material_select();
        encrypt.on(EncryptApp.SETTINGS_CHANGE, this.settingsChange);
    }
    componentWillUnmount() {
        encrypt.removeListener(EncryptApp.SETTINGS_CHANGE, this.settingsChange);
    }
    settingsChange() {
        this.setState({});
    }
    addDirect() {

        if (!window.framework_NW) {
            let directory = dialog.showOpenDialog({ properties: ["openDirectory"] });
            if (directory) {
                encrypt.set_settings_directory = directory[0];
            }
        } else {
            let clickEvent = document.createEvent("MouseEvents");
            clickEvent.initEvent("click", true, true);
            document.querySelector("#choose-folder").dispatchEvent(clickEvent);
        }
    }
    render() {
        return (
            <div id="encode-settings-content" className="content-wrapper z-depth-1">
                <ItemBar text={lang.get_resource.Encrypt.encrypt_setting} />
                <div className="settings-content">
                    <EncodingType EncodingValue={encrypt.get_settings_encoding} />
                    <CheckBoxWithLabel checkbox_checked={() => { encrypt.set_settings_delete_files = !encrypt.get_settings_delete_files } }
                        check={encrypt.get_settings_delete_files}
                        id_name="delete_files"
                        text={lang.get_resource.Encrypt.delete_files_after} />
                    <CheckBoxWithLabel checkbox_checked={() => { encrypt.set_settings_archive_files = !encrypt.get_settings_archive_files } }
                        check={encrypt.get_settings_archive_files}
                        id_name="archive_files"
                        text={lang.get_resource.Encrypt.archive_files_before} />
                    <SelectFolder directory={encrypt.get_settings_directory} viewDirect={
                        function (event: any) {
                            encrypt.set_settings_directory = event.target.value;
                        } }
                        openDirect={this.addDirect.bind(this)} />
                </div>
            </div>
        );
    }
}
