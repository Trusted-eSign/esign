import { EventEmitter } from "events";
import { get_settings_from_json, IX509Certificate } from "./global_app";

export class EncryptApp extends EventEmitter {
    // protected settings = get_settings_from_json("ENCRYPT", "settings_for_encrypt");
    // protected files: any = [];
    // protected files_for_encrypt: any = [];
    // protected certificates_for_encrypt: trusted.pkistore.PkiItem[] = get_settings_from_json("ENCRYPT", "certificates_for_encrypt");
    // protected certificates_is_active: trusted.pkistore.PkiItem[] = this.certificates_for_encrypt;
    // protected certificates: IX509Certificate[] = [];
    // protected certificate_for_info: IX509Certificate = null;
    // protected search_value = "";
     settings = get_settings_from_json("ENCRYPT", "settings_for_encrypt");
     files: any = [];
     files_for_encrypt: any = [];
     certificates_for_encrypt: trusted.pkistore.PkiItem[] = get_settings_from_json("ENCRYPT", "certificates_for_encrypt");
     certificates_is_active: trusted.pkistore.PkiItem[] = this.certificates_for_encrypt;
     certificates: IX509Certificate[] = [];
     certificate_for_info: IX509Certificate = null;
     search_value = "";
    static SETTINGS = "encrypt_change";
    static SETTINGS_CHANGE = "settings_change";
    static CERT_CHANGE = "cert_change";
    static FILES_CHANGE = "files_change";
    get get_settings_directory() {
        return this.settings.directory;
    }
    set set_settings_directory(directory: string) {
        this.settings.directory = directory;
        this.emit(EncryptApp.SETTINGS_CHANGE, directory);
    }
    get get_settings_encoding() {
        return this.settings.encoding;
    }
    set set_settings_encoding(encoding: string) {
        this.settings.encoding = encoding;
        this.emit(EncryptApp.SETTINGS_CHANGE, encoding);
    }
    get get_settings_archive_files() {
        return this.settings.archive_files;
    }
    set set_settings_archive_files(archive_files: boolean) {
        this.settings.archive_files = archive_files;
        this.emit(EncryptApp.SETTINGS_CHANGE, archive_files);
    }
    get get_settings_delete_files() {
        return this.settings.delete_files;
    }
    set set_settings_delete_files(delete_files: boolean) {
        this.settings.delete_files = delete_files;
        this.emit(EncryptApp.SETTINGS_CHANGE, delete_files);
    }
    get get_settings() {
        return this.settings;
    }
    get get_files() {
        return this.files;
    }
    set set_files(files: any) {
        this.files = files;
        this.emit(EncryptApp.FILES_CHANGE, files);
    }
    get get_files_for_encrypt() {
        return this.files_for_encrypt;
    }
    set set_files_for_encrypt(files_for_encrypt: any) {
        this.files_for_encrypt = files_for_encrypt;
        this.emit(EncryptApp.FILES_CHANGE, files_for_encrypt);
    }
    get get_certificates() {
        return this.certificates;
    }
    set set_certificates(certificates: any) {
        this.certificates = certificates;
        this.emit(EncryptApp.SETTINGS, certificates);
    }
    get get_certificates_for_encrypt() {
        return this.certificates_for_encrypt;
    }
    set set_certificates_for_encrypt(certificates_for_encrypt: any) {
        this.certificates_for_encrypt = certificates_for_encrypt;
        this.emit(EncryptApp.SETTINGS, certificates_for_encrypt);
    }
    get get_certificate_for_info() {
        return this.certificate_for_info;
    }
    set set_certificate_for_info(certificate_for_info: any) {
        this.certificate_for_info = certificate_for_info;
        this.emit(EncryptApp.SETTINGS, certificate_for_info);
    }
    get get_certificates_is_active() {
        return this.certificates_is_active;
    }
    set set_certificates_is_active(certificates_is_active: any) {
        this.certificates_is_active = certificates_is_active;
        this.emit(EncryptApp.SETTINGS, certificates_is_active);
    }
    get get_search_value() {
        return this.search_value;
    }
    set set_search_value(search_value: string) {
        this.search_value = search_value;
        this.emit(EncryptApp.SETTINGS, search_value);
    }
}
export let encrypt = new EncryptApp();
