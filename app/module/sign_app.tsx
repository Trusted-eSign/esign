import { EventEmitter } from "events";
import { get_settings_from_json, IX509Certificate } from "./global_app";
export class SignApp extends EventEmitter {
    // protected settings = get_settings_from_json("SIGN", "settings_for_sign");
    // protected sign_certificate: IX509Certificate = get_settings_from_json("SIGN", "certificate_for_sign");
    // protected certificate_for_info: IX509Certificate = this.sign_certificate;
    // protected certificates: IX509Certificate[] = [];
    // protected files: any = [];
    // protected files_for_sign: any = [];
    // protected sign_info: any = [];
    // protected sign_info_active: any = null;
    // protected sign_certs_info: any = null;
    // protected sign_cert_info: any = null;
    // protected search_value = "";
     settings = get_settings_from_json("SIGN", "settings_for_sign");
     sign_certificate: IX509Certificate = get_settings_from_json("SIGN", "certificate_for_sign");
     certificate_for_info: IX509Certificate = this.sign_certificate;
     certificates: IX509Certificate[] = [];
     files: any = [];
     files_for_sign: any = [];
     sign_info: any = [];
     sign_info_active: any = null;
     sign_certs_info: any = null;
     sign_cert_info: any = null;
     search_value = "";
    static SETTINGS = "sign_change";
    static SETTINGS_CHANGE = "settings_change";
    static FILES_CHANGE = "files_change";
    static SIGN_INFO_CHANGE = "sign_info_change"
    /*------------sign info--------------------*/
    get get_sign_cert_info() {
        return this.sign_cert_info;
    }
    set set_sign_cert_info(sign_cert_info: any) {
        this.sign_cert_info = sign_cert_info;
        this.emit(SignApp.SIGN_INFO_CHANGE, sign_cert_info);
    }
    get get_sign_certs_info() {
        return this.sign_certs_info;
    }
    set set_sign_certs_info(sign_certs_info: any) {
        this.sign_certs_info = sign_certs_info;
        this.emit(SignApp.SIGN_INFO_CHANGE, sign_certs_info);
    }
    get get_sign_info_active() {
        return this.sign_info_active;
    }
    set set_sign_info_active(sign_info_active: any) {
        this.sign_info_active = sign_info_active;
        this.emit(SignApp.SIGN_INFO_CHANGE, sign_info_active);
    }
    get get_sign_info() {
        return this.sign_info;
    }
    set set_sign_info(sign_info: any) {
        this.sign_info = sign_info;
        this.emit(SignApp.SIGN_INFO_CHANGE, sign_info);
    }
    /*---------Settings change---------*/
    get get_settings_directory() {
        return this.settings.directory;
    }
    set set_settings_directory(directory: string) {
        this.settings.directory = directory;
        this.emit(SignApp.SETTINGS_CHANGE, directory);
    }
    get get_settings_encoding() {
        return this.settings.encoding;
    }
    set set_settings_encoding(encoding: string) {
        this.settings.encoding = encoding;
        this.emit(SignApp.SETTINGS_CHANGE, encoding);
    }
    get get_settings_detached() {
        return this.settings.detached;
    }
    set set_settings_detached(detached: boolean) {
        this.settings.detached = detached;
        this.emit(SignApp.SETTINGS_CHANGE, detached);
    }
    get get_settings_add_time() {
        return this.settings.add_time;
    }
    set set_settings_add_time(add_time: boolean) {
        this.settings.add_time = add_time;
        this.emit(SignApp.SETTINGS_CHANGE, add_time);
    }
    get get_settings() {
        return this.settings;
    }
    /*------------certificate for sign--------------*/
    get get_sign_certificate() {
        return this.sign_certificate;
    }
    set set_sign_certificate(sign_certificate: any) {
        this.sign_certificate = sign_certificate;
        this.emit(SignApp.SETTINGS, sign_certificate);
    }
    get get_certificate_for_info() {
        return this.certificate_for_info;
    }
    set set_certificate_for_info(certificate_for_info: any) {
        this.certificate_for_info = certificate_for_info;
        this.emit(SignApp.SETTINGS, certificate_for_info);
    }
    get get_certificates() {
        return this.certificates;
    }
    set set_certificates(certificates: any) {
        this.certificates = certificates;
        this.emit(SignApp.SETTINGS, certificates);
    }
    /*--------Files change--------*/
    get get_files() {
        return this.files;
    }
    set set_files(files: any) {
        this.files = files;
        this.emit(SignApp.FILES_CHANGE, files);
    }
    get get_files_for_sign() {
        return this.files_for_sign;
    }
    set set_files_for_sign(files_for_sign: any) {
        this.files_for_sign = files_for_sign;
        this.emit(SignApp.FILES_CHANGE, files_for_sign);
    }
    get get_search_value() {
        return this.search_value;
    }
    set set_search_value(search_value: string) {
        this.search_value = search_value;
        this.emit(SignApp.SETTINGS, search_value);
    }
}
export let sign = new SignApp().setMaxListeners(0);
