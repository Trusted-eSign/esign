/// <reference path="../../../types/index.d.ts" />

import { lang } from "../module/global_app";

export function loadKey(path: string, format: trusted.DataFormat, password: string): trusted.pki.Key {
    try {
        return trusted.pki.Key.readPrivateKey(path, format, password);
    } catch (e) {
        $(".toast-key_load_failed").remove();
        Materialize.toast(lang.get_resource.Key.key_load_failed, 2000, "toast-key_load_failed");

        return undefined;
    }
}
