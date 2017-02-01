/// <reference path="../../../types/index.d.ts" />

import { lang } from "../module/global_app";

export function loadCert(path: string, format: trusted.DataFormat) {
    try {
        return trusted.pki.Certificate.load(path, format);
    } catch (e) {
        $(".toast-cert_load_failed").remove();
        Materialize.toast(lang.get_resource.Certificate.cert_load_failed, 2000, "toast-cert_load_failed");

        return undefined;
    }
}

export function getCrlDistPoints(cert: trusted.pki.Certificate): Array<string> {
    let rev = new trusted.pki.Revocation();
    return rev.getCrlDistPoints(cert);
}
