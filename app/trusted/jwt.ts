import { lang } from "../module/global_app";

const CTLICENSE_R_NO_ERROR: number = 900;
const CTLICENSE_R_ERROR_INTERNAL: number = 901;
const CTLICENSE_R_ERROR_LOAD_LICENSE: number = 902;
const CTLICENSE_R_ERROR_TOKEN_FORMAT: number = 903;
const CTLICENSE_R_ERROR_SIGN: number = 904;
const CTLICENSE_R_ERROR_PARSING: number = 905;
const CTLICENSE_R_ERROR_STUCTURE: number = 906;
const CTLICENSE_R_ERROR_PRODUCT: number = 907;
const CTLICENSE_R_ERROR_EXPIRED_TIME: number = 908;
const CTLICENSE_R_ERROR_NOT_STARTED: number = 909;
const CTLICENSE_R_ERROR_OPERATION_BLOCK: number = 910;
const CTLICENSE_R_ERROR_NO_LICENSE_IN_STORE: number = 911;
const CTLICENSE_R_ERROR_STORE_IS_LOCKED: number = 912;

let pozition: number;
let code: number;

export function checkLicense(key?: string): number {
    try {
        const res = key ? trusted.utils.Jwt.checkLicense(key) : trusted.utils.Jwt.checkLicense();

        return res;
    } catch (err) {
        return -1;
    }
}

export function getErrorMessage(errCode: number): string {
    switch (errCode) {
        case CTLICENSE_R_ERROR_INTERNAL:
            return lang.get_resource.License.jwtErrorInternal;
        case CTLICENSE_R_ERROR_LOAD_LICENSE:
            return lang.get_resource.License.jwtErrorLoad;
        case CTLICENSE_R_ERROR_TOKEN_FORMAT:
            return lang.get_resource.License.jwtErrorTokenFormat;
        case CTLICENSE_R_ERROR_SIGN:
            return lang.get_resource.License.jwtErrorSign;
        case CTLICENSE_R_ERROR_PARSING:
            return lang.get_resource.License.jwtErrorParsing;
        case CTLICENSE_R_ERROR_STUCTURE:
            return lang.get_resource.License.jwtErrorStructure;
        case CTLICENSE_R_ERROR_PRODUCT:
            return lang.get_resource.License.jwtErrorProduct;
        case CTLICENSE_R_ERROR_EXPIRED_TIME:
            return lang.get_resource.License.jwtErrorExpired;
        case CTLICENSE_R_ERROR_NOT_STARTED:
            return lang.get_resource.License.jwtErrorStarted;
        case CTLICENSE_R_ERROR_OPERATION_BLOCK:
            return lang.get_resource.License.jwtErrorOperation;
        case CTLICENSE_R_ERROR_NO_LICENSE_IN_STORE:
            return lang.get_resource.License.jwtErrorNoLicenseInStore;
        case CTLICENSE_R_ERROR_STORE_IS_LOCKED:
            return lang.get_resource.License.jwtErrorStoreIsLocked;
        default :
            return lang.get_resource.License.jwtErrorCode;
    }
}
