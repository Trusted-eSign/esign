import * as events from "events";
import * as React from "react";
import { CertificatesApp, certs_app } from "../module/certificates_app";
import { encrypt, EncryptApp } from "../module/encrypt_app";
import { get_Certificates, lang, LangApp } from "../module/global_app";
import { sign, SignApp } from "../module/sign_app";
import { MainToolBar, Password, SearchElement } from "./components";
import { ItemBar, ItemBarWithBtn } from "./elements";

declare const $: any;

const DIALOG = window.electron.remote.dialog;

class AppStore extends events.EventEmitter {

}

export let application = new AppStore();

export class CertWindow extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        certs_app.set_certificates = get_Certificates("certificates");
        this.certAdd = this.certAdd.bind(this);
        this.certChange = this.certChange.bind(this);
        this.state = ({ pass_value: "" });
    }

    componentDidMount() {
        $(".nav-small-btn, .cert-setting-btn, .cert-btn, .cert-set-btn").dropdown({
            alignment: "left",
            belowOrigin: false,
            constrainWidth: false,
            gutter: 0,
            inDuration: 300,
            outDuration: 225,
        });

        application.on("import_cert", this.certAdd);
        application.on("pass_value", this.setPass.bind(this));
        certs_app.on(CertificatesApp.SETTINGS, this.certChange);
        lang.on(LangApp.SETTINGS, this.certChange);
    }

    componentWillUnmount() {
        application.removeListener("import_cert", this.certAdd);
        application.removeListener("pass_value", this.setPass.bind(this));
        certs_app.removeListener(CertificatesApp.SETTINGS, this.certChange);
        lang.removeListener(LangApp.SETTINGS, this.certChange);
    }

    setPass(password: string) {
        this.setState({ pass_value: password });
    }

    certChange() {
        this.setState({});
    }

    certImport(event: any) {
        const CERT_PATH = event[0].path;
        let certCount;

        if (!window.PKISTORE.importCert(CERT_PATH)) {
            this.p12Import(event);
        } else {
            certCount = certs_app.get_certificates.length;
            this.certUpdate();
            if (certCount === certs_app.get_certificates.length) {
                $(".toast-cert_imported").remove();
                Materialize.toast(lang.get_resource.Certificate.cert_imported, 2000, "toast-cert_imported");
            } else {
                $(".toast-cert_import_ok").remove();
                Materialize.toast(lang.get_resource.Certificate.cert_import_ok, 2000, ".toast-cert_import_ok");
            }
        }
    }

    p12Import(event: any) {
        const P12_PATH = event[0].path;
        const SELF = this;
        let p12: trusted.pki.Pkcs12;
        let certCount;

        try {
            p12 = trusted.pki.Pkcs12.load(P12_PATH);
        } catch (e) {
            p12 = undefined;
        }

        if (!p12) {
            $(".toast-cert_load_failed").remove();
            Materialize.toast(lang.get_resource.Certificate.cert_load_failed, 2000, "toast-cert_load_failed");
            return;
        }

        $("#get-password").openModal({
            complete() {
                if (!window.PKISTORE.importPkcs12(P12_PATH, SELF.state.pass_value)) {
                    $(".toast-cert_import_failed").remove();
                    Materialize.toast(lang.get_resource.Certificate.cert_import_failed, 2000, "toast-cert_import_failed");
                } else {
                    certCount = certs_app.get_certificates.length;
                    SELF.certUpdate();
                    if (certCount === certs_app.get_certificates.length) {
                        $(".toast-cert_imported").remove();
                        Materialize.toast(lang.get_resource.Certificate.cert_imported, 2000, ".toast-cert_imported");
                    } else {
                        $(".toast-cert_import_ok").remove();
                        Materialize.toast(lang.get_resource.Certificate.cert_import_ok, 2000, "toast-cert_import_ok");
                    }

                }
            },
            dismissible: false,
        });
    }

    certAdd() {
        const CLICK_EVENT = document.createEvent("MouseEvents");

        CLICK_EVENT.initEvent("click", true, true);
        document.querySelector("#choose-cert").dispatchEvent(CLICK_EVENT);
    }

    certUpdate() {
        window.PKIITEMS = window.PKISTORE.items;
        certs_app.set_certificates = get_Certificates("certificates");
        certs_app.set_certificate_for_info = null;
    }

    activeCert(event: any, cert: any) {
        const CERTIFICATES = certs_app.get_certificates;

        for (const certificate of CERTIFICATES) {
            certificate.active = false;
        }

        CERTIFICATES[cert.key].active = true;
        certs_app.set_certificates = CERTIFICATES;
        certs_app.set_certificate_for_info = cert;
    }

    importCertKey(event: any) {
        const SELF = this;

        if (isEncryptedKey(event[0].path)) {
            $("#get-password").openModal({
                complete() {
                    SELF.importCertKeyHelper(event[0].path, SELF.state.pass_value);
                },
                dismissible: false,
            });
        } else {
            SELF.importCertKeyHelper(event[0].path, "");
        }
    }

    importCertKeyHelper(path: string, pass: string) {
        $("#cert-key-import").val("");
        const KEY_PATH = path;
        const CERTIFICATES = certs_app.get_certificates;
        const RES = window.PKISTORE.importKey(KEY_PATH, pass);
        let key = 0;

        if (RES) {
            for (let i: number = 0; i < CERTIFICATES.length; i++) {
                if (CERTIFICATES[i].active) {
                    CERTIFICATES[i].privateKey = true;
                    key = i;
                }
            }
            certs_app.set_certificates = CERTIFICATES;

            $(".toast-key_import_ok").remove();
            Materialize.toast(lang.get_resource.Certificate.key_import_ok, 2000, "toast-key_import_ok");
        } else {
            $(".toast-key_import_failed").remove();
            Materialize.toast(lang.get_resource.Certificate.key_import_failed, 2000, "toast-key_import_failed");
        }
    }

    exportDirectory() {
        if (window.framework_NW) {
            const CLICK_EVENT = document.createEvent("MouseEvents");

            CLICK_EVENT.initEvent("click", true, true);
            document.querySelector("#choose-folder-export").dispatchEvent(CLICK_EVENT);
        } else {
            const FILE = DIALOG.showSaveDialog({
                defaultPath: lang.get_resource.Certificate.certificate + ".pfx",
                filters: [{ name: lang.get_resource.Certificate.certs, extensions: ["pfx"] }],
                title: lang.get_resource.Certificate.export_cert});
            this.exportCert(FILE);
        }
    }

    exportCert(file: string) {
        const SELF = this;
        let p12: trusted.pki.Pkcs12;

        if (file) {
            $("#get-password").openModal({
                complete() {
                    const CERT_ITEM = certs_app.get_certificate_for_info;
                    const CERT = window.PKISTORE.getPkiObject(CERT_ITEM);
                    const KEY = window.PKISTORE.findKey(CERT_ITEM);

                    if (!CERT || !KEY) {
                        $(".toast-cert_export_failed").remove();
                        Materialize.toast(lang.get_resource.Certificate.cert_export_failed, 2000, "toast-cert_export_failed");
                    } else {
                        p12 = new trusted.pki.Pkcs12();
                        p12.create(CERT, KEY, null, SELF.state.pass_value, CERT_ITEM.name);
                        p12.save(file);
                        $(".toast-cert_export_ok").remove();
                        Materialize.toast(lang.get_resource.Certificate.cert_export_ok, 2000, "toast-cert_export_ok");
                    }
                },
                dismissible: false,
            });
        } else {
            $(".toast-cert_export_cancel").remove();
            Materialize.toast(lang.get_resource.Certificate.cert_export_cancel, 2000, "toast-cert_export_cancel");
        }
    }

    render() {
        const SELF = this;
        const CERTIFICATE_FOR_INFO = certs_app.get_certificate_for_info;
        const CURRENT = CERTIFICATE_FOR_INFO ? "not-active" : "active";
        let cert: any = null;
        let title: any = null;

        if (CERTIFICATE_FOR_INFO) {
            cert = <CertInfo name={CERTIFICATE_FOR_INFO.name}
                issuerName={CERTIFICATE_FOR_INFO.issuerName}
                organization={CERTIFICATE_FOR_INFO.organization}
                validityDate={new Date(CERTIFICATE_FOR_INFO.notAfter)}
                algSign={CERTIFICATE_FOR_INFO.algSign}
                privateKey={CERTIFICATE_FOR_INFO.privateKey} />;
            title = <div className="cert-title-main">
                <div className="collection-title cert-title">{CERTIFICATE_FOR_INFO.name}</div>
                <div className="collection-info cert-info cert-title">{CERTIFICATE_FOR_INFO.issuerName}</div>
            </div>;
        } else {
            cert = "";
            title = <span>{lang.get_resource.Certificate.cert_info}</span>;
        }

        const CERTIFICATES = certs_app.get_certificates;
        let certSearch = CERTIFICATES;
        let searchValue = certs_app.get_search_value;

        searchValue = searchValue.trim().toLowerCase();
        if (searchValue.length > 0) {
            certSearch = certSearch.filter(function(e: any) {
                return e.name.toLowerCase().match(searchValue);
            });
        }

        const NAME = certSearch.length < 1 ? "active" : "not-active";
        const VIEW = certSearch.length < 1 ? "not-active" : "";
        const DISABLED = CERTIFICATE_FOR_INFO ? "" : "disabled";

        return (
            <div className="main">
                <div className="content">
                    <div className="col s6 m6 l6 content-item-height" style={{ paddingRight: 0 }}>
                        <div className="cert-content-item">
                            <div className="content-wrapper z-depth-1">
                                <ToolBarWithSearch operation="certificate" disable="" import={
                                    function(event: any) {
                                        SELF.certImport(event.target.files);
                                    }
                                } />
                                <div className="add-certs">
                                    <div className="add-certs-item">
                                        <div className={"add-cert-collection collection " + VIEW}>
                                            <input type="file" className="input-file" id="cert-key-import" onChange={
                                                function(event: any) {
                                                    SELF.importCertKey(event.target.files);
                                                }
                                            } />
                                            {certSearch.map(function(l: any) {
                                                let status: string;
                                                if (l.status) {
                                                    status = "status_cert_ok_icon";
                                                } else {
                                                    status = "status_cert_fail_icon";
                                                }
                                                return <CertCollectionList name={l.name}
                                                    issuerName={l.issuerName}
                                                    status={status}
                                                    index={l.key}
                                                    chooseCert={function(event: any) { SELF.activeCert(event, CERTIFICATES[l.key]); } }
                                                    operation="certificate"
                                                    cert_key={l.privateKey}
                                                    provider={l.provider}
                                                    active_cert={l.active}
                                                    key={l.key} />;
                                            })}
                                        </div>
                                        <BlockNotElements name={NAME} title={lang.get_resource.Certificate.cert_not_found} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col s6 m6 l6 content-item-height">
                        <div className="cert-content-item-height">
                            <div className="content-wrapper z-depth-1">
                                <nav className="app-bar-cert">
                                    <ul className="app-bar-items">
                                        <li className="cert-bar-text">
                                            {title}
                                            <input type="file" ref={direct => direct && direct.setAttribute("nwsaveas", lang.get_resource.Certificate.certificate + ".pfx")} accept=".pfx" value="" id="choose-folder-export" onChange={function (event: any) {
                                                SELF.exportCert(event.target.value);
                                            } } />
                                        </li>
                                        <li className="right">
                                            <a className={"nav-small-btn waves-effect waves-light " + DISABLED} data-activates="dropdown-btn-for-cert">
                                                <i className="nav-small-icon material-icons cert-settings">more_vert</i>
                                            </a>
                                            <ul id="dropdown-btn-for-cert" className="dropdown-content">
                                                <li><a onClick={this.exportDirectory.bind(this)}>{lang.get_resource.Certificate.cert_export}</a></li>
                                            </ul>
                                        </li>
                                    </ul>
                                </nav>
                                <div className="add-certs">
                                    <div className="add-certs-item">
                                        {cert}
                                        <BlockNotElements name={CURRENT} title={lang.get_resource.Certificate.cert_not_select} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Password />
            </div>
        );
    }
}

export class CertComponents extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        sign.set_certificates = get_Certificates("sign");
        this.state = ({
            search_value: "",
        });
        this.changeCertificate = this.changeCertificate.bind(this);
    }

    componentDidMount() {
        $(".add-cert-btn").leanModal();
        $(".cert-setting-btn").dropdown({
            alignment: "left",
            belowOrigin: false,
            constrainWidth: false,
            gutter: 0,
            inDuration: 300,
            outDuration: 225,
        });
        sign.on(SignApp.SETTINGS, this.changeCertificate);
    }

    componentWillUnmount() {
        sign.removeListener(SignApp.SETTINGS, this.changeCertificate);
    }

    changeCertificate() {
        this.setState({});
    }

    chooseCert() {
        const CERTIFICATES = sign.get_certificates;
        let cert: any;

        for (let i = 0; i < CERTIFICATES.length; i++) {
            if (CERTIFICATES[i].active) {
                cert = CERTIFICATES[i];
            }
        }
        sign.set_sign_certificate = cert;
    }

    activeCert(event: any, cert: any) {
        const CERTIFICATES = sign.get_certificates;

        for (const certificate of CERTIFICATES) {
            certificate.active = false;
        }

        CERTIFICATES[cert.key].active = true;
        sign.set_certificates = CERTIFICATES;
        sign.set_certificate_for_info = cert;
    }

    selectedCert(cert: any) {
        const CERTIFICATES = sign.get_certificates;

        for (const certificate of CERTIFICATES) {
            certificate.active = false;
        }

        CERTIFICATES[cert.key].active = true;
        sign.set_certificates = CERTIFICATES;
        sign.set_certificate_for_info = cert;
        sign.set_sign_certificate = cert;
        $("#add-cert").closeModal();
    }

    render() {
        const CERTIFICATES = sign.get_certificates;
        let certSearch = sign.get_certificates;
        let searchValue = sign.get_search_value;

        searchValue = searchValue.trim().toLowerCase();
        if (searchValue.length > 0) {
            certSearch = certSearch.filter(function(e: any) {
                return e.name.toLowerCase().match(searchValue);
            });
        }

        const NAME = certSearch.length < 1 ? "active" : "not-active";
        const VIEW = certSearch.length < 1 ? "not-active" : "";
        const SELF = this;
        const CERTIFICATE_FOR_INFO = sign.get_certificate_for_info;
        const CURRENT = CERTIFICATE_FOR_INFO ? "not-active" : "active";
        let cert: any = null;
        let itemBar: any = null;

        if (CERTIFICATE_FOR_INFO) {
            cert = <CertInfo name={CERTIFICATE_FOR_INFO.name}
                issuerName={CERTIFICATE_FOR_INFO.issuerName}
                organization={CERTIFICATE_FOR_INFO.organization}
                validityDate={new Date(CERTIFICATE_FOR_INFO.notAfter)}
                algSign={CERTIFICATE_FOR_INFO.algSign}
                privateKey={CERTIFICATE_FOR_INFO.privateKey} />;
            itemBar = <ItemBar text={CERTIFICATE_FOR_INFO.name} second_text={CERTIFICATE_FOR_INFO.issuerName} />;
        } else {
            cert = "";
            itemBar = <ItemBar text={lang.get_resource.Certificate.cert_info} />;
        }

        const NOT_ACTIVE = sign.get_sign_certificate ? "not-active" : "";
        const ACTIVE = sign.get_sign_certificate ? "active" : "not-active";
        const ACTIVE_ELEM = sign.get_certificate_for_info ? "active" : "";
        const SETTINGS = {
            draggable: false,
        };

        return (
            <div id="cert-content" className="content-wrapper z-depth-1">
                <CertContentToolBarForSign btn_active={ACTIVE} />
                <div className={"cert-contents " + NOT_ACTIVE}>
                    <a className="waves-effect waves-light btn-large add-cert-btn" {...SETTINGS} href="#add-cert">{lang.get_resource.Certificate.Select_Cert_Sign}</a>
                </div>
                <CertificateView />
                <div id="add-cert" className="modal cert-window">
                    <div className="add-cert-content">
                        <ItemBarWithBtn text={lang.get_resource.Certificate.certs} new_class="modal-bar" icon="close" on_btn_click={function() {
                            $("#add-cert").closeModal();
                        } } />
                        <div className="cert-window-content">
                            <div className="col s6 m6 l6 content-item-height" style={{ paddingRight: 0 }}>
                                <div className="cert-content-item">
                                    <div className="content-wrapper z-depth-1">
                                        <ToolBarWithSearch disable="disabled" import={function(event: any) { } } operation="sign" />
                                        <div className="add-certs">
                                            <div className="add-certs-item">
                                                <div className={"add-cert-collection collection " + VIEW}>
                                                    {certSearch.map(function(l: any, i: number) {
                                                        let status: string;
                                                        if (l.status) {
                                                            status = "status_cert_ok_icon";
                                                        } else {
                                                            status = "status_cert_fail_icon";
                                                        }
                                                        return <CertCollectionList name={l.name}
                                                            issuerName={l.issuerName}
                                                            status={status}
                                                            index={l.key}
                                                            chooseCert={function(event: any) { SELF.activeCert(event, CERTIFICATES[l.key]); } }
                                                            operation="sign"
                                                            cert_key={l.privateKey}
                                                            provider={l.provider}
                                                            active_cert={l.active}
                                                            key={i}
                                                            selectedCert={function() { SELF.selectedCert(CERTIFICATES[l.key]); } } />;
                                                    })}
                                                </div>
                                                <BlockNotElements name={NAME} title={lang.get_resource.Certificate.cert_not_found} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col s6 m6 l6 content-item-height">
                                <div className={"cert-content-item-height " + ACTIVE_ELEM}>
                                    <div className="content-wrapper z-depth-1">
                                        {itemBar}
                                        <div className="add-certs">
                                            <div className="add-certs-item">
                                                {cert}
                                                <BlockNotElements name={CURRENT} title={lang.get_resource.Certificate.cert_not_select} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={"choose-cert " + ACTIVE_ELEM}>
                                        <a className="waves-effect waves-light btn-large choose-btn modal-close" onClick={this.chooseCert.bind(this)}>{lang.get_resource.Settings.choose}</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

interface ICertCollectionListProps {
    name: string;
    issuerName: string;
    status: string;
    index: number;
    chooseCert: (event: any) => void;
    selectedCert?: () => void;
    operation: string;
    cert_key: boolean;
    provider: string;
    active_cert: boolean;
}

class CertCollectionList extends React.Component<ICertCollectionListProps, any> {
    constructor(props: ICertCollectionListProps) {
        super(props);
    }

    componentDidMount() {
        $(".cert-setting-item").dropdown({
            alignment: "right",
            belowOrigin: false,
            constrainWidth: false,
            gutter: 0,
            inDuration: 300,
            outDuration: 225,
        });
    }

    stopEvent(event: any) {
        event.stopPropagation();
    }

    addCertKey() {
        const CLICK_EVENT = document.createEvent("MouseEvents");

        CLICK_EVENT.initEvent("click", true, true);
        document.querySelector("#cert-key-import").dispatchEvent(CLICK_EVENT);
    }

    render() {
        const SELF = this;
        const STYLE = {};
        let certKeyMenu: any = null;
        let active = "";
        let doubleClick: () => void;

        if (this.props.active_cert) {
            active = "active";
        }
        if (this.props.operation === "certificate" && !this.props.cert_key && this.props.provider === "SYSTEM") {
            certKeyMenu = <div>
                <i className="cert-setting-item waves-effect material-icons secondary-content"
                    data-activates={"cert-key-set-file-" + this.props.index} onClick={SELF.stopEvent}>more_vert</i>
                <ul id={"cert-key-set-file-" + this.props.index} className="dropdown-content">
                    <li><a onClick={this.addCertKey.bind(this)}>{lang.get_resource.Certificate.import_key}</a></li>
                </ul>
            </div>;
        } else {
            certKeyMenu = "";
        }

        if (this.props.operation === "sign") {
            doubleClick = this.props.selectedCert.bind(this);
        }

        return <div className={"collection-item avatar certs-collection " + active} id={"cert-" + this.props.index}
            onClick={this.props.chooseCert.bind(this)}
            onDoubleClick={doubleClick}
            style={STYLE}>
            <div className="r-iconbox-link">
                <div className="r-iconbox-cert-icon"><i className={this.props.status} id="cert-status"></i></div>
                <p className="collection-title">{this.props.name}</p>
                <p className="collection-info cert-info">{this.props.issuerName}</p>
            </div>
            {certKeyMenu}
        </div>;
    }
}

interface ICertInfoProps {
    name: string;
    issuerName: string;
    organization: string;
    validityDate: Date;
    algSign: string;
    privateKey: boolean;
    classForReg?: string[];
}

export class CertInfo extends React.Component<ICertInfoProps, any> {
    constructor(props: ICertInfoProps) {
        super(props);
    }

    render() {
        const PRIV_KEY = this.props.privateKey ? lang.get_resource.Certificate.present : lang.get_resource.Certificate.absent;
        const TEXT_WHITE = this.props.classForReg ? this.props.classForReg[0] : "";
        const TEXT_GRAY = this.props.classForReg ? this.props.classForReg[1] : "";
        let organization = "-";

        if (this.props.organization) {
            organization = this.props.organization;
        }

        return <div className="add-cert-collection collection cert-info-list">
            <div className="collection-item certs-collection certificate-info">
                <div className={"collection-title " + TEXT_WHITE}>{this.props.name}</div>
                <div className={"collection-info cert-info " + TEXT_GRAY}>{lang.get_resource.Certificate.subject}</div>
            </div>
            <div className="collection-item certs-collection certificate-info">
                <div className={"collection-title " + TEXT_WHITE}>{organization}</div>
                <div className={"collection-info cert-info " + TEXT_GRAY}>{lang.get_resource.Certificate.organization}</div>
            </div>
            <div className="collection-item certs-collection certificate-info">
                <div className={"collection-title " + TEXT_WHITE}>{this.props.issuerName}</div>
                <div className={"collection-info cert-info " + TEXT_GRAY}>{lang.get_resource.Certificate.issuer_name}</div>
            </div>
            <div className="collection-item certs-collection certificate-info">
                <div className={"collection-title " + TEXT_WHITE}>{this.props.validityDate.toLocaleDateString(lang.get_lang, {
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    month: "long",
                    second: "numeric",
                    year: "numeric",
                })}</div>
                <div className={"collection-info cert-info " + TEXT_GRAY}>{lang.get_resource.Certificate.cert_valid}</div>
            </div>
            <div className="collection-item certs-collection certificate-info">
                <div className={"collection-title " + TEXT_WHITE}>{this.props.algSign}</div>
                <div className={"collection-info cert-info " + TEXT_GRAY}>{lang.get_resource.Sign.alg}</div>
            </div>
            <div className="collection-item certs-collection certificate-info">
                <div className={"collection-title " + TEXT_WHITE}>{PRIV_KEY}</div>
                <div className={"collection-info cert-info " + TEXT_GRAY}>{lang.get_resource.Certificate.priv_key}</div>
            </div>
        </div>;
    }
}

interface ICertItemProps {
    first_text: string;
    second_text: string;
    first_color: string;
    second_color: string;
}

class CertItem extends React.Component<ICertItemProps, any> {
    render() {
        return (
            <div className="collection-item certs-collection certificate-info">
                <div className={"collection-title " + this.props.first_color}>{this.props.first_text}</div>
                <div className={"collection-info cert-info " + this.props.second_color}>{this.props.second_text}</div>
            </div>
        );
    }
}

interface IBlockNotElementsProps {
    name: string;
    title: string;
}

export class BlockNotElements extends React.Component<IBlockNotElementsProps, any> {
    constructor(props: IBlockNotElementsProps) {
        super(props);
    }

    render() {
        return <div className={"cert-item " + this.props.name}>
            <div className="add-file-item-text">{this.props.title}</div>
            <i className="material-icons large fullscreen">block</i>
        </div>;
    }
}

class CertificateView extends React.Component<any, any> {
    constructor() {
        super();
        this.changeCertificate = this.changeCertificate.bind(this);
    }

    componentDidMount() {
        sign.on(SignApp.SETTINGS, this.changeCertificate);
    }

    componentWillUnmount() {
        sign.removeListener(SignApp.SETTINGS, this.changeCertificate);
    }

    changeCertificate() {
        this.setState({});
    }

    render() {
        const SIGN_CERTIFICATE = sign.get_sign_certificate;

        if (SIGN_CERTIFICATE) {
            const privKey = SIGN_CERTIFICATE.privateKey ? lang.get_resource.Certificate.present : lang.get_resource.Certificate.absent;
            return <div className="cert-view-main">
                <div className="cert-main-item">
                    <div className="add-cert-collection collection cert-info-list">
                        <div className="collection-item certs-collection certificate-info">
                            <div className="collection-title">{SIGN_CERTIFICATE.name}</div>
                            <div className="collection-info cert-info">{lang.get_resource.Certificate.subject}</div>
                        </div>
                        <div className="collection-item certs-collection certificate-info">
                            <div className="collection-title">{SIGN_CERTIFICATE.organization}</div>
                            <div className="collection-info cert-info">{lang.get_resource.Certificate.organization}</div>
                        </div>
                        <div className="collection-item certs-collection certificate-info">
                            <div className="collection-title">{SIGN_CERTIFICATE.algSign}</div>
                            <div className="collection-info cert-info">{lang.get_resource.Sign.alg}</div>
                        </div>
                    </div>
                </div>
                <div className="cert-main-item">
                    <div className="add-cert-collection collection cert-info-list">
                        <div className="collection-item certs-collection certificate-info">
                            <div className="collection-title">{SIGN_CERTIFICATE.issuerName}</div>
                            <div className="collection-info cert-info">{lang.get_resource.Certificate.issuer}</div>
                        </div>
                        <div className="collection-item certs-collection certificate-info">
                            <div className="collection-title">{new Date(SIGN_CERTIFICATE.notAfter).toLocaleDateString(lang.get_lang, {
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                                month: "long",
                                second: "numeric",
                                year: "numeric",
                            })}</div>
                            <div className="collection-info cert-info">{lang.get_resource.Certificate.cert_valid}</div>
                        </div>
                        <div className="collection-item certs-collection certificate-info">
                            <div className="collection-title">{privKey}</div>
                            <div className="collection-info cert-info">{lang.get_resource.Certificate.priv_key}</div>
                        </div>
                    </div>
                </div>
            </div>;
        } else {
            return <div></div>;
        }
    }
}

interface ICertContentToolBarForSignProps {
    btn_active: string;
}

class CertContentToolBarForSign extends React.Component<ICertContentToolBarForSignProps, any> {
    constructor(props: ICertContentToolBarForSignProps) {
        super(props);
    }

    render() {
        return <nav className="app-bar-content">
            <ul className="app-bar-items">
                <li className="app-bar-item" style={{ width: "calc(100% - 45px)" }}><span>{lang.get_resource.Certificate.certificate}</span></li>
                <li className="right">
                    <a className={"nav-small-btn waves-effect waves-light " + this.props.btn_active} onClick={function() { $("#add-cert").openModal(); } }>
                        <i className="material-icons nav-small-icon">add</i>
                    </a>
                </li>
            </ul>
        </nav>;
    }
}

interface IToolBarWithSearchProps {
    disable: string;
    import: (event: any) => void;
    operation: string;
}

class ToolBarWithSearch extends React.Component<IToolBarWithSearchProps, any> {
    constructor(props: IToolBarWithSearchProps) {
        super(props);
    }

    certImport() {
        application.emit("import_cert", "");
    }

    render() {
        let btn: any = null;
        let style = {};

        if (this.props.operation === "certificate") {
            btn = <li className="right import-col">
                <input type="file" className="input-file" id="choose-cert" value="" onChange={this.props.import.bind(this)} />
                <a className={"nav-small-btn waves-effect waves-light " + this.props.disable} data-activates="dropdown-btn-import">
                    <i className="nav-small-icon material-icons cert-settings">more_vert</i>
                </a>
                <ul id="dropdown-btn-import" className="dropdown-content">
                    <li><a onClick={this.certImport.bind(this)}>{lang.get_resource.Certificate.cert_import}</a></li>
                </ul>
            </li>;
        } else {
            style = { width: 100 + "%", paddingRight: 0.75 + "rem" };
        }

        return <nav className="app-bar-cert">
            <ul className="app-bar-items">
                <li className="cert-bar-text" style={style}>
                    <SearchElement operation={this.props.operation} />
                </li>
                {btn}
            </ul>
        </nav>;
    }
}

export class CertComponentsForEncrypt extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        encrypt.set_certificates = get_Certificates("encrypt");
        this.encryptChange = this.encryptChange.bind(this);
    }

    componentDidUpdate() {
        $(".nav-small-btn").dropdown({
            alignment: "right",
            belowOrigin: false,
            constrainWidth: false,
            gutter: 0,
            inDuration: 300,
            outDuration: 225,
        });
    }

    componentDidMount() {
        $(".add-cert-btn").leanModal();
        $(".nav-small-btn, .cert-btn, .cert-set-btn").dropdown({
            alignment: "left",
            belowOrigin: false,
            constrainWidth: false,
            gutter: 0,
            inDuration: 300,
            outDuration: 225,
        });
        encrypt.on(EncryptApp.SETTINGS, this.encryptChange);
    }

    componentWillUnmount() {
        encrypt.removeListener(EncryptApp.SETTINGS, this.encryptChange);
    }

    encryptChange() {
        this.setState({});
    }

    chooseCert() {
        encrypt.set_certificates_for_encrypt = encrypt.get_certificates_is_active;
    }

    activeCert(event: any, certs: any) {
        const ARRAY = [];
        const CERTIFICATES = encrypt.get_certificates;

        CERTIFICATES[certs.key].active = !CERTIFICATES[certs.key].active;
        encrypt.set_certificates = CERTIFICATES;
        for (const certificate of CERTIFICATES) {
            if (certificate.active) {
                ARRAY.push(certificate);
            }
        }
        encrypt.set_certificates_is_active = ARRAY;
    }

    viewCertInfo(event: any, cert: any) {
        encrypt.set_certificate_for_info = cert;
    }

    backViewChooseCerts() {
        encrypt.set_certificate_for_info = null;
    }

    removeChooseCerts() {
        encrypt.set_certificates_is_active = [];
        const CERTIFICATES = encrypt.get_certificates;
        for (const certificate of CERTIFICATES) {
            certificate.active = false;
        }
        encrypt.set_certificates = CERTIFICATES;
    }

    render() {
        const SELF = this;
        const CERTIFICATES_FOR_ENCRYPT = encrypt.get_certificates_for_encrypt;
        const CERTIFICATES = encrypt.get_certificates;
        const CERTIFICATES_IS_ACTIVE = encrypt.get_certificates_is_active;
        const CERTIFICATE_FOR_INFO = encrypt.get_certificate_for_info;
        const CHOOSE = CERTIFICATES_IS_ACTIVE.length < 1 || CERTIFICATE_FOR_INFO ? "not-active" : "active";
        const CHOOSE_VIEW = CERTIFICATES_IS_ACTIVE.length < 1 ? "active" : "not-active";
        const DISABLE = CERTIFICATES_IS_ACTIVE.length < 1 ? "disabled" : "";
        const NOT_ACTIVE = CERTIFICATES_FOR_ENCRYPT.length > 0 ? "not-active" : "";
        let activeButton: any = null;
        let cert: any = null;
        let title: any = null;

        if (CERTIFICATE_FOR_INFO) {
            cert = <CertInfo name={CERTIFICATE_FOR_INFO.name}
                issuerName={CERTIFICATE_FOR_INFO.issuerName}
                organization={CERTIFICATE_FOR_INFO.organization}
                validityDate={new Date(CERTIFICATE_FOR_INFO.notAfter)}
                algSign={CERTIFICATE_FOR_INFO.algSign}
                privateKey={CERTIFICATE_FOR_INFO.privateKey} />;
            title = <div className="cert-title-main">
                <div className="collection-title cert-title">{CERTIFICATE_FOR_INFO.name}</div>
                <div className="collection-info cert-info cert-title">{CERTIFICATE_FOR_INFO.issuerName}</div>
            </div>;
            activeButton = <li className="right">
                <a className="nav-small-btn waves-effect waves-light" onClick={this.backViewChooseCerts.bind(this)}>
                    <i className="nav-small-icon material-icons">arrow_back</i>
                </a>
            </li>;
        } else {
            cert = "";
            title = <span>{lang.get_resource.Certificate.certs_getters}</span>;
            activeButton = <li className="right">
                <a className={"nav-small-btn waves-effect waves-light " + DISABLE} data-activates="dropdown-btn-certlist">
                    <i className="nav-small-icon material-icons">more_vert</i>
                </a>
                <ul id="dropdown-btn-certlist" className="dropdown-content">
                    <li><a onClick={this.removeChooseCerts.bind(this)}>{lang.get_resource.Settings.remove_list}</a></li>
                </ul>
            </li>;
        }

        let certSearch = encrypt.get_certificates;
        let searchValue = encrypt.get_search_value;
        searchValue = searchValue.trim().toLowerCase();

        if (searchValue.length > 0) {
            certSearch = certSearch.filter(function(e: any) {
                return e.name.toLowerCase().match(searchValue);
            });
        }

        const NAME = certSearch.length < 1 ? "active" : "not-active";
        const VIEW = certSearch.length < 1 ? "not-active" : "";
        const SETTINGS = {
            draggable: false,
        };

        return (
            <div id="cert-content" className="content-wrapper z-depth-1">
                <CertContentToolBarForEncrypt />
                <div className={"cert-contents " + NOT_ACTIVE}>
                    <a className="waves-effect waves-light btn-large add-cert-btn" {...SETTINGS}  href="#add-cert">{lang.get_resource.Certificate.Select_Cert_Encrypt}</a>
                </div>
                <ChooseCertsView />
                <div id="add-cert" className="modal cert-window">
                    <div className="add-cert-content">
                        <ItemBarWithBtn text={lang.get_resource.Certificate.certs} new_class="modal-bar" icon="close" on_btn_click={function() {
                            $("#add-cert").closeModal();
                        } } />
                        <div className="cert-window-content">
                            <div className="col s6 m6 l6 content-item-height" style={{ paddingRight: 0 }}>
                                <div className="cert-content-item">
                                    <div className="content-wrapper z-depth-1">
                                        <ToolBarWithSearch disable="disabled" import={function(event: any) { } } operation="encrypt" />
                                        <div className="add-certs">
                                            <div className="add-certs-item">
                                                <div className={"add-cert-collection collection " + VIEW}>
                                                    {certSearch.map(function(l: any, i: number) {
                                                        let status: string;
                                                        if (l.status) {
                                                            status = "status_cert_ok_icon";
                                                        } else {
                                                            status = "status_cert_fail_icon";
                                                        }
                                                        return <CertCollectionList name={l.name}
                                                            issuerName={l.issuerName}
                                                            status={status}
                                                            index={l.key}
                                                            chooseCert={function(event: any) { SELF.activeCert(event, CERTIFICATES[l.key]); } }
                                                            operation="encrypt"
                                                            cert_key={l.privateKey}
                                                            provider={l.provider}
                                                            active_cert={l.active}
                                                            key={i} />;
                                                    })}
                                                </div>
                                                <BlockNotElements name={NAME} title={lang.get_resource.Certificate.cert_not_found} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col s6 m6 l6 content-item-height">
                                <div className={"cert-content-item-height " + CHOOSE}>
                                    <div className="content-wrapper z-depth-1">
                                        <nav className="app-bar-cert">
                                            <ul className="app-bar-items">
                                                <li className="cert-bar-text">
                                                    {title}
                                                </li>
                                                {activeButton}
                                            </ul>
                                        </nav>
                                        <div className="add-certs">
                                            <div className="add-certs-item">
                                                <div className={"add-cert-collection choose-cert-collection collection " + CHOOSE}>
                                                    {CERTIFICATES_IS_ACTIVE.map(function(l: any, i: number) {
                                                        let status: string;
                                                        if (l.status) {
                                                            status = "status_cert_ok_icon";
                                                        } else {
                                                            status = "status_cert_fail_icon";
                                                        }
                                                        return <CertCollectionList name={l.name}
                                                            issuerName={l.issuerName}
                                                            status={status}
                                                            index={l.key}
                                                            chooseCert={function(event: any) { SELF.viewCertInfo(event, CERTIFICATES[l.key]); } }
                                                            operation="encrypt"
                                                            cert_key={l.privateKey}
                                                            provider={l.provider}
                                                            active_cert={false}
                                                            key={i} />;
                                                    })}
                                                </div>
                                                {cert}
                                                <BlockNotElements name={CHOOSE_VIEW} title={lang.get_resource.Certificate.cert_not_select} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={"choose-cert " + CHOOSE}>
                                        <a className="waves-effect waves-light btn choose-cert-btn modal-close" onClick={this.chooseCert.bind(this)}>{lang.get_resource.Settings.choose}</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class ChooseCertsView extends React.Component<any, any> {
    constructor() {
        super();
        this.encryptChange = this.encryptChange.bind(this);
    }

    componentDidMount() {
        encrypt.on(EncryptApp.SETTINGS, this.encryptChange);
    }

    componentWillUnmount() {
        encrypt.removeListener(EncryptApp.SETTINGS, this.encryptChange);
    }

    encryptChange() {
        this.setState({});
    }

    render() {
        const CERTIFICATES_FOR_ENCRYPT = encrypt.get_certificates_for_encrypt;

        if (CERTIFICATES_FOR_ENCRYPT.length > 0) {
            return <div className="cert-view-main choose-certs-view">
                <div className={"add-cert-collection collection "}>
                    {CERTIFICATES_FOR_ENCRYPT.map(function(l: any, i: number) {
                        let status: string;
                        if (l.status) {
                            status = "status_cert_ok_icon";
                        } else {
                            status = "status_cert_fail_icon";
                        }
                        return <div className="collection-item avatar certs-collection" key={i}>
                            <div className="r-iconbox-link">
                                <div className="r-iconbox-cert-icon"><i className={status} id="cert-status"></i></div>
                                <p className="collection-title">{l.name}</p>
                                <p className="collection-info cert-info">{l.issuerName}</p>
                            </div>
                        </div>;
                    })}
                </div>
            </div>;
        } else {
            return <div></div>;
        }
    }
}

class CertContentToolBarForEncrypt extends React.Component<any, any> {
    constructor() {
        super();
        this.encryptChange = this.encryptChange.bind(this);
    }

    componentDidMount() {
        encrypt.on(EncryptApp.SETTINGS, this.encryptChange);
    }

    componentWillUnmount() {
        encrypt.removeListener(EncryptApp.SETTINGS, this.encryptChange);
    }

    encryptChange() {
        this.setState({});
    }

    removeAllChooseCerts() {
        encrypt.set_certificates_for_encrypt = [];
        encrypt.set_certificates_is_active = [];
        const CERTIFICATES = encrypt.get_certificates;

        for (const certificate of CERTIFICATES) {
            certificate.active = false;
        }
        encrypt.set_certificates = CERTIFICATES;
    }

    render() {
        const CERTIFICATES_FOR_ENCRYPT = encrypt.get_certificates_for_encrypt;
        const DISABLED = CERTIFICATES_FOR_ENCRYPT.length > 0 ? "" : "disabled";
        const ACTIVE = CERTIFICATES_FOR_ENCRYPT.length > 0 ? "active" : "not-active";

        return <nav className="app-bar-content">
            <ul className="app-bar-items">
                <li className="app-bar-item" style={{ width: "calc(100% - 85px)" }}><span>{lang.get_resource.Certificate.certs_encrypt}</span></li>
                <li className="right">
                    <a className={"nav-small-btn waves-effect waves-light " + ACTIVE} onClick={function() { $("#add-cert").openModal(); } }>
                        <i className="material-icons nav-small-icon">add</i>
                    </a>
                    <a className={"nav-small-btn waves-effect waves-light " + DISABLED} data-activates="dropdown-btn-set-cert">
                        <i className="nav-small-icon material-icons">more_vert</i>
                    </a>
                    <ul id="dropdown-btn-set-cert" className="dropdown-content">
                        <li><a onClick={this.removeAllChooseCerts.bind(this)}>{lang.get_resource.Settings.remove_list}</a></li>
                    </ul>
                </li>
            </ul>
        </nav>;
    }
}
