import * as React from "react";
import { checkFiles, DialogBox, dlg, extFile, lang, LangApp } from "../module/global_app";
import { sign, SignApp } from "../module/sign_app";
import * as native from "../native";
import * as signs from "../trusted/sign";
import { utills } from "../utills";
import { application, BlockNotElements, CertComponents } from "./certificate";
import { Dialog, FileComponents, MainToolBar } from "./components";
import { BtnsForOperation, CollectionItem, ItemBar, ItemBarWithBtn } from "./elements";
import { CheckBoxWithLabel, EncodingType, SelectFolder } from "./settings_components";
declare let $: any;

const dialog = window.electron.remote.dialog;

export class SignWindow extends React.Component<any, any> {
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
    signed() {
        if (checkFiles("sign")) {
            let certItem = sign.get_sign_certificate;
            let key = window.PKISTORE.findKey(certItem);
            let res = true;

            if (!key) {
                $(".toast-key_not_found").remove();
                Materialize.toast(lang.get_resource.Sign.key_not_found, 2000, "toast-key_not_found");
                return;
            }

            let cert = window.PKISTORE.getPkiObject(certItem);
            let files = sign.get_files_for_sign;
            let pathes = files.slice(0);

            let policies = ["noAttributes"];

            let format = trusted.DataFormat.PEM;
            let folderOut = sign.get_settings_directory;

            if (folderOut.length > 0) {
                if (!utills.dirExists(folderOut)) {
                    $(".toast-failed_find_directory").remove();
                    Materialize.toast(lang.get_resource.Settings.failed_find_directory, 2000, "toast-failed_find_directory");
                    return;
                }
            }

            if (sign.get_settings_detached) {
                policies.push("detached");
            }

            if (sign.get_settings_add_time) {
                policies.splice(0, 1);
            }

            if (sign.get_settings_encoding !== lang.get_resource.Settings.BASE) {
                format = trusted.DataFormat.DER;
            }
            pathes.forEach(function (uri: any, i: any) {
                let newPath = signs.signFile(uri.path, cert, key, policies, format, folderOut);
                if (newPath) {
                    let birthtime = native.fs.statSync(newPath).birthtime;
                    pathes[i].path = newPath;
                    pathes[i].date = birthtime;
                    pathes[i].name = native.path.basename(pathes[i].path);
                    pathes[i].ext = extFile(pathes[i].name);
                    pathes[i].verify_status = "default_status";
                } else {
                    res = false;
                }
            });
            if (res) {
                let sign_info = sign.get_sign_info;
                let del_obj: any = [];
                for (let i = 0; i < pathes.length; i++) {
                    for (let j = 0; j < sign_info.length; j++) {
                        if (sign_info[j].key === pathes[i].key) {
                            sign_info.splice(j, 1);
                        }
                    }
                }
                sign.set_files_for_sign = pathes;
                sign.set_sign_info_active = null;
                sign.set_sign_certs_info = null;

                $(".toast-files_signed").remove();
                Materialize.toast(lang.get_resource.Sign.files_signed, 2000, "toast-files_signed");
            } else {
                $(".toast-files_signed_failed").remove();
                Materialize.toast(lang.get_resource.Sign.files_signed_failed, 2000, "toast-files_signed_failed");
            }
        }
    }
    resign() {
        if (checkFiles("sign")) {
            let certItem = sign.get_sign_certificate;
            let key = window.PKISTORE.findKey(certItem);
            let res = true;
            let cms: trusted.cms.SignedData;

            if (!key) {
                $(".toast-key_not_found").remove();
                Materialize.toast(lang.get_resource.Sign.key_not_found, 2000, "toast-key_not_found");
                return;
            }

            let cert = window.PKISTORE.getPkiObject(certItem);
            let files = sign.get_files_for_sign;
            let pathes = files.slice(0);

            let policies = ["noAttributes"];

            let format = trusted.DataFormat.PEM;
            let folderOut = sign.get_settings_directory;

            if (folderOut.length > 0) {
                if (!utills.dirExists(folderOut)) {
                    $(".toast-failed_find_directory").remove();
                    Materialize.toast(lang.get_resource.Settings.failed_find_directory, 2000, "toast-failed_find_directory");
                    return;
                }
            }

            if (sign.get_settings_add_time) {
                policies.splice(0, 1);
            }

            if (sign.get_settings_encoding !== lang.get_resource.Settings.BASE) {
                format = trusted.DataFormat.DER;
            }
            pathes.forEach(function (uri: any, i: any) {
               let newPath = signs.resignFile(uri.path, cert, key, policies, format, folderOut);
               if (newPath) {
                    let birthtime = native.fs.statSync(newPath).birthtime;
                    pathes[i].path = newPath;
                    pathes[i].date = birthtime;
                    pathes[i].name = native.path.basename(pathes[i].path);
                    pathes[i].ext = extFile(pathes[i].name);
                    pathes[i].verify_status = "default_status";
                } else {
                    res = false;
                }
            });

            if (res) {
                let sign_info = sign.get_sign_info;
                let del_obj: any = [];
                for (let i = 0; i < pathes.length; i++) {
                    for (let j = 0; j < sign_info.length; j++) {
                        if (sign_info[j].key === pathes[i].key) {
                            sign_info.splice(j, 1);
                        }
                    }
                }
                sign.set_files_for_sign = pathes;
                sign.set_sign_info_active = null;
                sign.set_sign_certs_info = null;

                $(".toast-files_resigned").remove();
                Materialize.toast(lang.get_resource.Sign.files_resigned, 2000, "toast-files_resigned");
            } else {
                $(".toast-files_resigned_failed").remove();
                Materialize.toast(lang.get_resource.Sign.files_resigned_failed, 2000, "toast-files_resigned_failed");
            }
        }
    }
    unSign() {
        if (checkFiles("sign")) {
            let files = sign.get_files_for_sign;
            let pathes = files.slice(0);
            let folderOut = sign.get_settings_directory;
            let res = true;

            pathes.forEach(function (path: any, i: any) {
                let newPath = signs.unSign(path.path, folderOut);
                let date = new Date();
                if (newPath) {
                    pathes[i].path = newPath;
                    pathes[i].date = date;
                    pathes[i].name = native.path.basename(pathes[i].path);
                    pathes[i].ext = extFile(pathes[i].name);
                    if ($(".tooltipped")[path.key]) {
                        $(".tooltipped")[path.key].className = "tooltipped";
                    }
                } else {
                    res = false;
                }
            });
            sign.set_files_for_sign = pathes;
            if (res) {
                sign.set_sign_info_active = null;
                sign.set_sign_certs_info = null;
                $(".toast-files_unsigned_ok").remove();
                Materialize.toast(lang.get_resource.Sign.files_unsigned_ok, 2000, "toast-files_unsigned_ok");
            } else {
                $(".toast-files_unsigned_failed").remove();
                Materialize.toast(lang.get_resource.Sign.files_unsigned_failed, 2000, "toast-files_unsigned_failed");
            }
        }
    }
    verifySign() {
        if (checkFiles("verify")) {
            let files = sign.get_files_for_sign;
            let pathes = files.slice(0);
            let res = false;
            let sign_files_info = sign.get_sign_info;
            let status: string;
            let cms: trusted.cms.SignedData;

            pathes.forEach(function (path: any, i: number) {
                if (!(cms = signs.loadSign(path.path))) {
                    return;
                }

                if (cms.isDetached()) {
                    if (!(cms = signs.setDetachedContent(cms, path.path))) {
                        return;
                    }
                }

                res = signs.verifySign(cms);
                status = res ? "status_ok" : "status_error";

                let sign_info = signs.getSignPropertys(cms);

                if (sign_info) {
                    for (let j = 0; j < sign_info.length; j++) {
                        if (!sign_info[j].status_verify) {
                            status = "status_error";
                            res = false;
                        }
                    }
                } else {
                    res = false;
                }

                pathes[i].verify_status = status;

                let count = 0;
                for (let j = 0; j < sign_files_info.length; j++) {
                    if (sign_files_info[j].key === pathes[i].key) {
                        count = 1;
                    }
                }
                if (count === 0) {
                    sign_files_info.push({ name: pathes[i].name, path: pathes[i].path, key: pathes[i].key, info: sign_info });
                } else if (count === 1) {
                    sign_files_info[i].info = sign_info;
                }
            });
            if (files.length === 1) {
                sign.set_sign_info_active = sign_files_info[files[0].key];
            }
            sign.set_sign_info = sign_files_info;
            sign.set_files_for_sign = pathes;
            if (res) {
                $(".toast-verify_sign_ok").remove();
                Materialize.toast(lang.get_resource.Sign.verify_sign_ok, 2000, "toast-verify_sign_ok");
            } else {
                $(".toast-verify_sign_founds_errors").remove();
                Materialize.toast(lang.get_resource.Sign.verify_sign_founds_errors, 2000, "toast-verify_sign_founds_errors");
            }
        }
    }
    render() {
        return (
            <div className="main">
                <Dialog />
                <div className="content">
                    <SignCertAndSettings />
                    <SignsInfo />
                    <SignaturesInfo />
                    <div className="col s6 m6 l6 content-item-height">
                        <BtnsForOperation
                            btn_name_first={lang.get_resource.Sign.sign}
                            btn_name_second={lang.get_resource.Sign.verify}
                            btn_resign={lang.get_resource.Sign.resign}
                            btn_unsign={lang.get_resource.Sign.unsign}
                            operation_first={this.signed.bind(this)}
                            operation_second={this.verifySign.bind(this)}
                            operation_unsign={this.unSign.bind(this)}
                            operation_resign={this.resign.bind(this)}
                            operation="sign" />
                        <FileComponents operation="sign" />
                    </div>
                </div>
            </div>
        );
    }
}
class SignCertAndSettings extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }
    render() {
        return (
            <div className="content-tem">
                <div className="col s6 m6 l6 content-item">
                    <CertComponents />
                </div>
                <div className="col s6 m6 l6 content-item">
                    <SignSettingsComponents />
                </div>
            </div>
        );
    }
}
class SignaturesInfo extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.change = this.change.bind(this);
    }
    componentDidMount() {
        sign.on(SignApp.SIGN_INFO_CHANGE, this.change);
    }
    componentWillUnmount() {
        sign.removeListener(SignApp.SIGN_INFO_CHANGE, this.change);
    }
    change() {
        this.setState({});
    }
    render() {
        let hidden_sign_cert_info = sign.get_sign_certs_info ? "" : "hidden";
        return (
            <div className={"content-tem sign-info " + hidden_sign_cert_info}>
                <div className="col s6 m6 l6 content-item">
                    <CertChain />
                </div>
                <div className="col s6 m6 l6 content-item">
                    <SignCertInfo />
                </div>
            </div>
        );
    }
}
class CertChain extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
    }
    removeSignInfo() {
        sign.set_sign_certs_info = null;
        sign.set_sign_cert_info = null;
    }
    viewCert(event: any, cert: any) {
        event.stopPropagation();
        let certs = sign.get_sign_certs_info;
        for (let i = 0; i < certs.length; i++) {
            certs[i].active = false;
        }
        certs[certs.indexOf(cert)].active = true;
        sign.set_sign_cert_info = cert;
    }
    render() {
        let self = this;
        let certs = sign.get_sign_certs_info ? sign.get_sign_certs_info : [];
        let padding = -5;
        return (
            <div className="content-wrapper z-depth-1">
                <ItemBarWithBtn icon="arrow_back" on_btn_click={this.removeSignInfo.bind(this)} text={lang.get_resource.Certificate.cert_chain} />
                <div className="sign-info-content">
                    <div className="add-cs-collection collection ">
                        {certs.map(function (l: any, i: number) {
                            let status: string;
                            if (l.status) {
                                status = "status_cert_ok_icon";
                            }
                            else {
                                status = "status_cert_fail_icon";
                            }
                            padding = padding + 15;
                            let tree: any = null;
                            if (i !== certs.length - 1) {
                                tree = <img className="tree-elem" src="./image/tree_element.svg" style={{ left: (padding + 10) + "px" }}></img>;
                            }
                            let active = "";
                            if (l.active === true) {
                                active = "active";
                            }
                            return <div className={"collection-item avatar certs-collection cs-chain " + active} key={i} onClick={function (event: any) { self.viewCert(event, l); } } style={{ paddingLeft: padding + "px" }}>
                                <div className="r-iconbox-link">
                                    <div className="r-iconbox-cert-icon cs-icon"><i className={status + " cs-icon-size"}></i></div>
                                    <p className="cs-title">{l.subject}</p>
                                    <p className="cs-info cert-info">{l.issuer}</p>
                                </div>
                                {tree}
                            </div>;
                        })}
                    </div>
                </div>
            </div>
        );
    }
}
class SignCertInfo extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
    }
    render() {
        let cert = sign.get_sign_cert_info;
        let cert_info: any = null;
        if (cert) {
            cert_info = <div className="sign-info-content">
                <div className="cert-view-info">
                    <div className="cert-main-item">
                        <div className="add-cert-collection collection cert-info-list">
                            <CollectionItem first_text={cert.subject} second_text={lang.get_resource.Certificate.subject} />
                            <CollectionItem first_text={cert.organ} second_text={lang.get_resource.Certificate.organization} />
                        </div>
                    </div>
                    <div className="cert-main-item">
                        <div className="add-cert-collection collection cert-info-list">
                            <CollectionItem first_text={cert.issuer} second_text={lang.get_resource.Certificate.issuer} />
                            <CollectionItem first_text={cert.notBefore} second_text={lang.get_resource.Certificate.cert_valid} />
                        </div>
                    </div>
                </div>
            </div>;
        }
        return (
            <div className="content-wrapper z-depth-1">
                <ItemBar text={lang.get_resource.Certificate.cert_info} />
                {cert_info}
            </div>
        );
    }
}
class SignSettingsComponents extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.changeSettings = this.changeSettings.bind(this);
    }
    componentDidMount() {
        let self = this;
        $("select").on("change", function (event: any) {
            sign.set_settings_encoding = event.target.value;
        });
        $("select").material_select();
        sign.on(SignApp.SETTINGS_CHANGE, this.changeSettings);
    }
    componentWillUnmount() {
        sign.removeListener(SignApp.SETTINGS_CHANGE, this.changeSettings);
    }
    changeSettings() {
        this.setState({});
    }
    addDirect() {
        if (!window.framework_NW) {
            let directory = dialog.showOpenDialog({ properties: ["openDirectory"] });
            if (directory) {
                sign.set_settings_directory = directory[0];
            }
        } else {
            let clickEvent = document.createEvent("MouseEvents");
            clickEvent.initEvent("click", true, true);
            document.querySelector("#choose-folder").dispatchEvent(clickEvent);
        }
    }
    render() {
        return (
            <div id="sign-settings-content" className="content-wrapper z-depth-1">
                <ItemBar text={lang.get_resource.Sign.sign_setting} />
                <div className="settings-content">
                    <EncodingType EncodingValue={sign.get_settings_encoding} />
                    <CheckBoxWithLabel checkbox_checked={() => { sign.set_settings_detached = !sign.get_settings_detached; } }
                        check={sign.get_settings_detached}
                        id_name="detached-sign"
                        text={lang.get_resource.Sign.sign_detached} />
                    <CheckBoxWithLabel checkbox_checked={() => { sign.set_settings_add_time = !sign.get_settings_add_time; } }
                        check={sign.get_settings_add_time}
                        id_name="sign-time"
                        text={lang.get_resource.Sign.sign_time} />
                    <SelectFolder directory={sign.get_settings_directory} viewDirect={
                        function (event: any) {
                            sign.set_settings_directory = event.target.value;
                        } }
                        openDirect={this.addDirect.bind(this)} />
                </div>
            </div>
        );
    }
}

class SignsInfo extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.changeSettings = this.changeSettings.bind(this);
    }
    componentDidMount() {
        sign.on(SignApp.SIGN_INFO_CHANGE, this.changeSettings);
    }
    componentWillUnmount() {
        sign.removeListener(SignApp.SIGN_INFO_CHANGE, this.changeSettings);
    }
    changeSettings() {
        this.setState({});
    }
    removeSignInfo() {
        sign.set_sign_info_active = null;
    }
    render() {
        let self = this;
        let sign_info = sign.get_sign_info_active;
        let file_name = sign_info && sign_info.name ? sign_info.name : "";
        let status_verify = this.props.signed_data && this.props.signed_data.status_verify ? "status_ok" : "";
        let signs_list = sign_info && sign_info.info ? sign_info.info : [];
        let hidden_sign_info = sign_info && !sign.get_sign_certs_info ? "" : "hidden";
        let hidden_sign_cert_info = sign.get_sign_certs_info ? "" : "hidden";

        return (
            <div className={"col s6 m6 l6 sign-info content-item-height " + hidden_sign_info}>
                <div className="file-content-height">
                    <div className="content-wrapper z-depth-1">
                        <ItemBarWithBtn icon="arrow_back" on_btn_click={this.removeSignInfo.bind(this)} text={lang.get_resource.Sign.sign_info} second_text={file_name} />
                        <div className="sign-info-content">
                            <div className={"add-cert-collection collection "}>
                                {signs_list.map(function (l: any, i: number) {
                                    return <ViewSignsInfo key={i} signed_data={l} />;
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
interface IViewSignsInfoProps {
    signed_data: any;
}
class ViewSignsInfo extends React.Component<IViewSignsInfoProps, any> {

    constructor(props: IViewSignsInfoProps) {
        super(props);
    }
    viewSignCertInfo(event: any, certs: any) {
        event.stopPropagation();
        sign.set_sign_certs_info = certs;
        sign.set_sign_cert_info = certs[0];
    }
    render() {
        let self = this;
        let status = "", icon = "";
        if (this.props.signed_data.status_verify === true) {
            status = lang.get_resource.Sign.sign_ok;
            icon = "status_cert_ok_icon";
        } else {
            status = lang.get_resource.Sign.sign_error;
            icon = "status_cert_fail_icon";
        }
        return (
            <div className="collection-item avatar certs-collection" onClick={function (event: any) { self.viewSignCertInfo(event, self.props.signed_data.certs); } }>
                <div className="r-iconbox-link">
                    <div className="r-iconbox-cert-icon"><i className={icon}></i></div>
                    <p className="collection-title si-title">{status}</p>
                    <p className="collection-info cert-info si-info">{lang.get_resource.Sign.status}</p>
                    <p className="collection-title si-title">{this.props.signed_data.subject}</p>
                    <p className="collection-info cert-info si-info">{lang.get_resource.Certificate.subject}</p>
                    <p className="collection-title si-title">{this.props.signed_data.alg}</p>
                    <p className="collection-info cert-info si-info">{lang.get_resource.Sign.alg}</p>
                    <p className="collection-title si-title">{this.props.signed_data.digestAlgorithm}</p>
                    <p className="collection-info cert-info si-info">{lang.get_resource.Sign.digest_alg}</p>
                </div>
            </div>
        );
    }
}
