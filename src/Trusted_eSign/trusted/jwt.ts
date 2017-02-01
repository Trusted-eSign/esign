/// <reference path="../../../types/index.d.ts" />

import { lang } from "../module/global_app";

const JWTDL_ERROR_INTERNAL: number = 901;
const JWTDL_ERROR_INVALID_LICENSE_FORMAT: number = 902;
const JWTDL_ERROR_INCORRECT_PRODUCT: number = 903;
const JWTDL_ERROR_LICENSE_EXPIRED: number = 904;
const JWTDL_ERROR_LOAD_LICENSE: number = 905;
const JWTDL_ERROR_INCORRECT_SIGN: number = 906;
const JWTDL_ERROR_UNSUPPORTED_OPERATION: number = 907;

var pozition: number;
var code: number;

export function checkLicense(key?: string): number {
    try {
        key ? trusted.utils.Jwt.checkLicense(key) : trusted.utils.Jwt.checkLicense();
        return 0;
    } catch (err) {
        if (~err.message.indexOf("Error check license")) {
            pozition = err.message.indexOf("jwtdlVerifyLicenseFile() failed(error code");
            if (pozition) {
                return code = parseInt(err.message.substr(pozition + "jwtdlVerifyLicenseFile() failed(error code ".length, 3));
            }
        }

        return -1;
    }
}

export function getErrorMessage(errCode: number): string {
    switch (errCode) {
        case JWTDL_ERROR_INTERNAL:
            return lang.get_resource.License.jwtErrorInternal;
        case JWTDL_ERROR_INVALID_LICENSE_FORMAT:
            return lang.get_resource.License.jwtErrorFormat;
        case JWTDL_ERROR_INCORRECT_PRODUCT:
            return lang.get_resource.License.jwtErrorProduct;
        case JWTDL_ERROR_LICENSE_EXPIRED:
            return lang.get_resource.License.jwtErrorExpired;
        case JWTDL_ERROR_LOAD_LICENSE:
            return lang.get_resource.License.jwtErrorLoad;
        case JWTDL_ERROR_INCORRECT_SIGN:
            return lang.get_resource.License.jwtErrorSign;
        case JWTDL_ERROR_UNSUPPORTED_OPERATION:
            return lang.get_resource.License.jwtErrorOperation;
        default :
            return lang.get_resource.License.jwtErrorCode;
    }
}
