import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path";
import { HOME_DIR, RESOURCES_PATH } from "../constants";

export let SETTINGS_JSON = path.join(HOME_DIR, ".Trusted", "Trusted eSign", "settings.json");

export let certVerify = function (certItem: IX509Certificate, certCollection: trusted.pki.CertificateCollection): boolean {
    let chain: trusted.pki.Chain;
    let chainForVerify: trusted.pki.CertificateCollection;

    // if (certItem.status !== undefined) {
    //      return certItem.status;
    // }

    let cert = window.PKISTORE.getPkiObject(certItem);

    try {
        chain = new trusted.pki.Chain();
        chainForVerify = chain.buildChain(cert, certCollection);
       // certItem.status = chain.verifyChain(chainForVerify, null);
        return  chain.verifyChain(chainForVerify, null);
    } catch (e) {
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

    //return certItem.status;
};
export function get_settings_from_json(operation: string, settings_name: string) {
    try {
        let data = fs.readFileSync(SETTINGS_JSON, "utf8");
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
        } else if (operation === "settings") {
            if (settings_name === "locale") {
                return "RU";
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
    version: string;
    hash: string;
    serial: string;
    serialNumber: string;
    notAfter: Date;
    notBefore: string;
    subjectName: string;
    issuerName: string;
    subjectFriendlyName: string;
    issuerFriendlyName: string;
    organizationName: string;
    status: boolean;
    signatureAlgorithm: string;
    privateKey: boolean;
    active: boolean;
    key: string;
}
/**функция чтения строковых ресурсов */
let get_string_resources = function (lang: string) {
    try {
        let RESOURCES_JSON: string;
        if (window.framework_NW) {
            RESOURCES_JSON = RESOURCES_PATH + "/Trusted_eSign/language/" + lang + ".json";
        } else {
            RESOURCES_JSON = RESOURCES_PATH + "/language/" + lang + ".json";
        }
        let data = fs.readFileSync(RESOURCES_JSON, "utf8");
        data = JSON.parse(data);
        return data;
    } catch (e) {
    }
};
export class LangApp extends EventEmitter {
    // protected lang = "EN"; // get_settings_from_json("MAIN", "lang");
    // protected resource = get_string_resources(this.lang);
    // static SETTINGS = "lang_change";
    lang = get_settings_from_json("settings", "locale");
    resource = get_string_resources(this.lang);
    SETTINGS = "lang_change";
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
    /*protected */dialog: DialogOptions = {
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
