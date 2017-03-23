/// <reference path="../types/index.d.ts" />

interface Window {
    mainWindow: any;
    electron: any;
    framework_NW: boolean;
    CERTIFICATECOLLECTION: trusted.pki.CertificateCollection;
    PKIITEMS: Array<trusted.pkistore.PkiItem>;
    PKISTORE: any;
    RESOURCES_PATH: string;
    DEFAULT_PATH: string;
    HOME_DIR: string;
    DEFAULT_CERTSTORE_PATH: string;
    LICENSE_PATH: string;
    PLATFORM: string;
    fs: any;
    os: any;
    archiver: any;
    async: any;
    path: any;
    sudo: any;
}

declare var window: Window;

declare function isEncryptedKey(path: string): boolean;
declare function getFileCoding(path: string): trusted.DataFormat;
// declare function getLicensePath(): string;
// declare function licenseParse(info: string): any;