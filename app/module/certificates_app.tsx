import { EventEmitter } from "events";
import { IX509Certificate } from "./global_app";
export class CertificatesApp extends EventEmitter {
    static SETTINGS = "certificates_change";
    // protected certificates: IX509Certificate[] = [];
    // protected search_value: string = "";
    // protected certificate_for_info: IX509Certificate = null;
    certificates: IX509Certificate[] = [];
    search_value: string = "";
    certificate_for_info: IX509Certificate = null;
    get get_certificates() {
        return this.certificates;
    }
    set set_certificates(certificates: any) {
        this.certificates = certificates;
        this.emit(CertificatesApp.SETTINGS, certificates);
    }
    get get_certificate_for_info() {
        return this.certificate_for_info;
    }
    set set_certificate_for_info(certificate_for_info: any) {
        this.certificate_for_info = certificate_for_info;
        this.emit(CertificatesApp.SETTINGS, certificate_for_info);
    }
    get get_search_value() {
        return this.search_value;
    }
    set set_search_value(search_value: string) {
        this.search_value = search_value;
        this.emit(CertificatesApp.SETTINGS, search_value);
    }
}
export let certs_app = new CertificatesApp();
