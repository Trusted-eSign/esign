import { EventEmitter } from "events";
import * as native from "../native";
import * as CERTS from "../trusted/certs";
import * as CHAIN from "../trusted/chain";
import * as CRLS from "../trusted/crls";

export let SETTINGS_JSON = native.path.join(native.HOME_DIR, ".Trusted", "Trusted eSign", "settings.json");

export class VideoApp extends EventEmitter {
    static SETTINGS = "video_change";
    protected video: any = {
        source: "",
        caption: "",
        currentTime: 0,
    };
    get get_video_source() {
        return this.video.source;
    }
    set set_video_source(source: string) {
        this.video.source = source;
        this.emit(VideoApp.SETTINGS, source);
    }
    get get_video_caption() {
        return this.video.caption;
    }
    set set_video_caption(caption: string) {
        this.video.caption = caption;
        this.emit(VideoApp.SETTINGS, caption);
    }
    get get_video_time() {
        return this.video.currentTime;
    }
    set set_video_time(time: number) {
        this.video.currentTime = time;
        this.emit(VideoApp.SETTINGS, time);
    }
}
export let video_app = new VideoApp();
export let extFile = function (filename: string) {
    let ext = filename.split(".").pop();
    let file_type: string;
    if (ext === "sig") {
        file_type = "sign_type_icon";
    } else if (ext === "enc") {
        file_type = "encrypt_type_icon";
    } else if (ext === "zip") {
        file_type = "zip_type_icon";
    } else if (ext === "docx" || ext === "doc") {
        file_type = "word_type_icon";
    } else if (ext === "xlsx" || ext === "xls") {
        file_type = "excel_type_icon";
    } else if (ext === "pdf") {
        file_type = "pdf_type_icon";
    } else {
        file_type = "file_type_icon";
    }
    return file_type;
};
export let get_Certificates = function (operation: string) {
    let certCollection: trusted.pki.CertificateCollection = window.CERTIFICATECOLLECTION;
    let certs: any = [];
    let certList: any = [];
    if (operation === "sign") {
        certList = window.PKIITEMS.filter(function (item: trusted.pkistore.PkiItem) {
            return item.type === "CERTIFICATE" && item.category === "MY";
        });
    } else if (operation === "encrypt") {
        certList = window.PKIITEMS.filter(function (item: trusted.pkistore.PkiItem) {
            return item.type === "CERTIFICATE" && (item.category === "MY" || item.category === "AddressBook");
        });
    }
    else {
        certList = window.PKIITEMS.filter(function (item: trusted.pkistore.PkiItem) {
            return item.type === "CERTIFICATE";
        });
    }
    for (let i = 0; i < certList.length; i++) {
        certs.push({
            format: certList[i].format,
            type: certList[i].type,
            category: certList[i].category,
            provider: certList[i].provider,
            uri: certList[i].uri,
            hash: certList[i].hash,
            serial: certList[i].serial,
            notAfter: certList[i].notAfter,
            notBefore: certList[i].notBefore,
            fullSubjectName: certList[i].subjectName,
            fullIssuerName: certList[i].issuerName,
            name: certList[i].subjectFriendlyName,
            issuerName: certList[i].issuerFriendlyName,
            organization: certList[i].organizationName,
            status: certVerify(certList[i], certCollection),
            algSign: certList[i].signatureAlgorithm,
            privateKey: certList[i].provider === "SYSTEM" ? certList[i].key.length > 0 : true,
            keyValue: certList[i].provider === "SYSTEM" ? certList[i].key : "1",
            active: false,
            key: i,
        });
    }
    if (operation === "sign") {
        let cert = sign.get_sign_certificate;
        if (cert) {
            certs[cert.key].active = true;
        }
    }
    if (operation === "encrypt") {
        let cert = encrypt.get_certificates_for_encrypt;
        if (cert) {
            if (cert.length > 0) {
                for (let i = 0; i < cert.length; i++) {
                    certs[cert[i].key].active = true;
                }
            }
        }
    }
    return certs;
};
let certCheck = function (notBefore: string, notAfter: string) {
    let before = Date.parse(notBefore);
    let after = Date.parse(notAfter);
    let curent = new Date();
    if (curent.valueOf() < before || curent.valueOf() > after) {
        return false;
    } else {
        return true;
    }
};
let certVerify = function (certItem: IX509Certificate, certCollection: trusted.pki.CertificateCollection): boolean {
    let cert = window.PKISTORE.getPkiObject(certItem);
    let chainForVerify = CHAIN.buildChain(cert, certCollection);
    if (!chainForVerify || !chainForVerify.length || chainForVerify.length === 0) {
        return false;
    }

    // let crl = STORE.getCrlLocal(cert);
    // if (crl && CRLS.checkCrlTime(crl)) {
    //     crls.push(crl);
    //     return CHAIN.verifyChain(chainForVerify, crls);
    // } else {
    //     STORE.downloadCRL(cert, function cb(err: any, res: any) {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             crl = res;
    //             if (crl && CRLS.checkCrlTime(crl)) {
    //                 crls.push(crl);
    //                 return CHAIN.verifyChain(chainForVerify, crls);
    //             } else {
    //                 return 0;
    //             }
    //         }
    //     });
    // }

    return CHAIN.verifyChain(chainForVerify, null);
};
export let get_settings_from_json = function (operation: string, settings_name: string) {
    try {
        let data = native.fs.readFileSync(SETTINGS_JSON, "utf8");
        data = JSON.parse(data);
        return data[operation][settings_name];
    } catch (e) {
        if (operation === "SIGN") {
            if (settings_name === "settings_for_sign") {
                return {
                    directory: "",
                    add_time: false,
                    encoding: "BASE-64",
                    detached: false,
                };
            } else {
                return null;
            }
        } else if (operation === "MAIN") {
            if (settings_name === "lang") {
                return "EN";
            }
        } else {
            if (settings_name === "settings_for_encrypt") {
                return {
                    directory: "",
                    archive_files: false,
                    encoding: "BASE-64",
                    delete_files: false,
                };
            } else {
                return [];
            }
        }
    }
};
export interface IX509Certificate {
    format: string;
    type: string;
    category: string;
    provider: string;
    uri: string;
    hash: string;
    serial: string;
    notAfter: string;
    notBefore: string;
    fullSubjectName: string;
    fullIssuerName: string;
    name: string;
    issuerName: string;
    organization: string;
    status: boolean;
    algSign: string;
    privateKey: boolean;
    keyValue: string;
    active: boolean;
    key: number;
}
/**функция чтения строковых ресурсов */
let get_string_resources = function (lang: string) {
    try {
        let RESOURCES_JSON: string;
        if (window.framework_NW) {
            RESOURCES_JSON = window.RESOURCES_PATH + "/Trusted_eSign/language/" + lang + ".json";
        } else {
            RESOURCES_JSON = window.RESOURCES_PATH + "/language/" + lang + ".json";
        }
        let data = native.fs.readFileSync(RESOURCES_JSON, "utf8");
        data = JSON.parse(data);
        return data;
    } catch (e) {
    }
};
export class LangApp extends EventEmitter {
    protected lang = "EN"; // get_settings_from_json("MAIN", "lang");
    protected resource = get_string_resources(this.lang);
    static SETTINGS = "lang_change";
    get get_lang() {
        return this.lang;
    }
    set set_lang(lang: string) {
        this.lang = lang;
        this.resource = get_string_resources(lang);
        this.emit(LangApp.SETTINGS, lang);
    }
    get get_resource() {
        return this.resource;
    }
    set set_resource(resource: any) {
        this.resource = resource;
        this.emit(LangApp.SETTINGS, resource);
    }
}
export let lang = new LangApp().setMaxListeners(0);
interface DialogOptions {
    title: string;
    message: string;
    open: boolean;
    code: boolean;
    cb: (code: boolean) => void;
}
export class DialogBox extends EventEmitter {
    static SETTINGS = "dialog_change";
    protected dialog: DialogOptions = {
        title: "",
        message: "",
        open: false,
        code: false,
        cb: (code) => { },
    };
    ShowDialog(title: string, message: string, cb: (code: boolean) => void) {
        let dig: DialogOptions = { title: title, message: message, open: true, code: false, cb: cb };
        this.set_dlg_all = dig;
    }
    set set_dlg_all(dig: DialogOptions) {
        this.dialog = dig;
        this.emit(DialogBox.SETTINGS, dig);
    }
    get get_dlg_open() {
        return this.dialog.open;
    }
    get get_dlg_title() {
        return this.dialog.title;
    }
    get get_dlg_message() {
        return this.dialog.message;
    }
    get get_dlg() {
        return this.dialog;
    }
    CloseDialog(button_code: boolean) {
        this.dialog.cb(button_code);
        let dig: DialogOptions = {
            title: "",
            message: "",
            open: false,
            code: button_code,
            cb: (code) => { },
        };
        this.set_dlg_all = dig;
    }
}
export let dlg = new DialogBox();
export let checkFiles = function (operation: string) {
    let files = operation === "sign" || operation === "verify" ? sign.get_files : encrypt.get_files;
    let files_for_operation: any = [];
    let count: any = [];
    for (let i = 0; i < files.length; i++) {
        if (!native.fs.existsSync(files[i].path)) {
            count.push(i);
        }
    }
    for (let i = count.length - 1; i > -1; i--) {
        files.splice(count[i], 1);
    }
    for (let j = 0; j < files.length; j++) {
        files[j].key = j;
        if (files[j].active === true) {
            files_for_operation.push(files[j]);
        }
    }
    operation === "sign" || operation === "verify" ? sign.set_files = files : encrypt.set_files = files;
    operation === "sign" || operation === "verify" ? sign.set_files_for_sign = files_for_operation : encrypt.set_files_for_encrypt = files_for_operation;
    if (files_for_operation.length === 0) {
        $(".toast-files_not_found").remove();
        Materialize.toast(lang.get_resource.Common.files_not_found, 3000, "toast-files_not_found");
        return false;
    }
    return true;
};
import { certs_app } from "./certificates_app";
import { encrypt } from "./encrypt_app";
import { sign } from "./sign_app";
