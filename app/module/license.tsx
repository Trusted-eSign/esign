/// <reference path="../../../types/index.d.ts" />
/// <reference path="../../index.d.ts" />

import { EventEmitter } from "events";
import { lang } from "../module/global_app";
import * as native from "../native";
import * as jwt from "../trusted/jwt";

export let getLicensePath = function () {
    let licFilePath = native.path.join(window.LICENSE_PATH, "/Trusted/Trusted eSign/license.lic");
    return licFilePath;
}
export let getNullInfo = function () {
    return {
        aud: "-",
        exp: "-",
        iat: "-",
        iss: "-",
        jti: "-",
        sub: "-",
    };
}
export let licenseParse = function (info: string) {
    let data = info.split(".");
    if (data[1]) {
        try {
            let inf = decode(data[1]);
            let license = JSON.parse(inf);
            if (license.exp && license.aud && license.iat && license.iss
                && license.jti && license.sub) {
                return license;
            } else {
                return getNullInfo();
            }
        } catch (e) {
            return getNullInfo();
        }
    } else {
        return getNullInfo();
    }

}
let getLicenseInfo = function () {
    let licensePath = getLicensePath();
    if (native.fs.existsSync(licensePath)) {
        let data = native.fs.readFileSync(licensePath, "utf8");
        if (data) {
            return licenseParse(data);
        } else {
            return getNullInfo();
        }
    } else {
        return getNullInfo();
    }
}
export let getStatus = function (key?: string) {
    let code: number = key ? jwt.checkLicense(key) : jwt.checkLicense();
    if (code === 0) {
        let data = key.split(".");
        let inf = decode(data[1]);
        let license = JSON.parse(inf);
        let dateExp = new Date(license.exp * 1000).getTime();
        let dateNow = new Date().getTime();
        let dateDif = dateExp - dateNow;
        let fullDays = Math.round(dateDif / (24 * 3600 * 1000));
        let ruDay: string = " дней";

        if (fullDays < 14) {
            if (fullDays === 1) {
                ruDay = " день";
            }

            if (fullDays >= 2 && fullDays < 5) {
                ruDay = " дня";
            }

            $(".toast-lic_key_correct_days").remove();
            Materialize.toast(lang.get_resource.License.lic_key_correct_days + fullDays + ruDay, 4000, "toast-lic_key_correct_days");
        }

        if (license.exp && license.aud && license.iat && license.iss && license.jti && license.sub) {
            return {
                message: lang.get_resource.License.lic_key_correct + fullDays + ")",
                type: "ok",
            }
        } else {
            return {
                message: lang.get_resource.License.lic_key_uncorrect,
                type: "error",
            }
        }
    } else {
        return {
            message: jwt.getErrorMessage(code),
            type: "error",
        }
    }
}
export let getLicenseStatus = function () {
    let license = getLicensePath();
    if (native.fs.existsSync(license)) {
        let data = native.fs.readFileSync(license, "utf8");
        return getStatus(data);
    } else {
        return {
            message: lang.get_resource.License.failed_key_find,
            type: "error"
        }
    }
}
interface ILicenseStatus {
    message: string;
    type: string;
}
export class License extends EventEmitter {
    static CHANGE = "license_change";
    // protected info = getLicenseInfo();
    // protected status: ILicenseStatus = getLicenseStatus();
     info = getLicenseInfo();
     status: ILicenseStatus = getLicenseStatus();
    get getStatus() {
        return this.status;
    }
    set setStatus(status: ILicenseStatus) {
        this.status = status;
        this.emit(License.CHANGE, status);
    }
    get getInfo() {
        return this.info;
    }
    set setInfo(info: any) {
        this.info = info;
        this.emit(License.CHANGE, info);
    }
}

export default function padString(input: string): string {
    let segmentLength = 4;
    let stringLength = input.length;
    let diff = stringLength % segmentLength;

    if (!diff) {
        return input;
    }

    let position = stringLength;
    let padLength = segmentLength - diff;
    let paddedStringLength = stringLength + padLength;
    let buffer = new Buffer(paddedStringLength);

    buffer.write(input);

    while (padLength--) {
        buffer.write("=", position++);
    }

    return buffer.toString();
}

function decode(base64url: string, encoding: string = "utf8"): string {
    return new Buffer(toBase64(base64url), "base64").toString(encoding);
}

function toBase64(base64url: string | Buffer): string {
    // We this to be a string so we can do .replace on it. If it's
    // already a string, this is a noop.
    base64url = base64url.toString();
    return padString(base64url)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");
}

export let lic = new License();
