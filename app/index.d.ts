interface Window {
    mainWindow: any;
    electron: any;
    framework_NW: boolean;
    TRUSTEDCERTIFICATECOLLECTION: trusted.pki.CertificateCollection;
    PKIITEMS: Array<trusted.pkistore.PkiItem>;
    PKISTORE: any;
    RESOURCES_PATH: string;
    DEFAULT_PATH: string;
    HOME_DIR: string;
    TMP_DIR: string;
    DEFAULT_CERTSTORE_PATH: string;
    LICENSE_PATH: string;
    PLATFORM: string;
    fs: any;
    os: any;
    archiver: any;
    async: any;
    path: any;
    sudo: any;
    logger: trusted.utils.Logger;
}

declare var window: Window;
