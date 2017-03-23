import * as React from "react";
import { MainToolBar, SearchElement, Password } from "./components";
import { ItemBar, ItemBarWithBtn } from "./elements";
import { sign, SignApp } from "../module/sign_app";
import { encrypt, EncryptApp } from "../module/encrypt_app";
import { certs_app, CertificatesApp } from "../module/certificates_app";
import { get_Certificates, lang, LangApp } from "../module/global_app";
import * as events from "events";
import * as keys from "../trusted/keys";
import * as pkcs12 from "../trusted/pkcs12";
declare let $: any;

const dialog = window.electron.remote.dialog;

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
            inDuration: 300,
            outDuration: 225,
            constrain_width: false,
            gutter: 0,
            belowOrigin: false,
            alignment: "left"
        }
        );
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
        let cert_path = event[0].path;
        if (!window.PKISTORE.importCert(cert_path)) {
            this.p12Import(event);
        } else {
            let cert_count = certs_app.get_certificates.length;
            this.certUpdate();
            if (cert_count === certs_app.get_certificates.length) {
                $(".toast-cert_imported").remove();
                Materialize.toast(lang.get_resource.Certificate.cert_imported, 2000, "toast-cert_imported");
            }
            else {
                $(".toast-cert_import_ok").remove();
                Materialize.toast(lang.get_resource.Certificate.cert_import_ok, 2000, ".toast-cert_import_ok");
            }
        }
    }
    p12Import(event: any) {
        let p12Path = event[0].path;
        let self = this;
        let p12: any = pkcs12.loadPkcs12(p12Path);

        if (!p12) {
            $(".toast-cert_load_failed").remove();
            Materialize.toast(lang.get_resource.Certificate.cert_load_failed, 2000, "toast-cert_load_failed");
            return;
        }

        $("#get-password").openModal({
            complete: function () {
                //let p12_path = event[0].path;
                if (!window.PKISTORE.importPkcs12(p12Path, self.state.pass_value)) {
                    $(".toast-cert_import_failed").remove();
                    Materialize.toast(lang.get_resource.Certificate.cert_import_failed, 2000, "toast-cert_import_failed");
                } else {
                    let cert_count = certs_app.get_certificates.length;
                    self.certUpdate();
                    if (cert_count === certs_app.get_certificates.length) {
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
        let clickEvent = document.createEvent("MouseEvents");
        clickEvent.initEvent("click", true, true);
        document.querySelector("#choose-cert").dispatchEvent(clickEvent);
    }
    certUpdate() {
        certs_app.set_certificates = get_Certificates("certificates");
        certs_app.set_certificate_for_info = null;
    }
    activeCert(event: any, cert: any) {
        let certificates = certs_app.get_certificates;
        for (let i = 0; i < certificates.length; i++) {
            certificates[i].active = false;
        }
        certificates[cert.key].active = true;
        certs_app.set_certificates = certificates;
        certs_app.set_certificate_for_info = cert;
    }
    importCertKey(event: any) {
        let self = this;

        if (isEncryptedKey(event[0].path)) {
            $("#get-password").openModal({
                complete: function () {
                    self.importCertKeyHelper(event[0].path, self.state.pass_value);
                },
                dismissible: false,
            });
        } else {
            self.importCertKeyHelper(event[0].path, "");
        }
    }
    importCertKeyHelper(path: string, pass: string) {
        let key_path = path;
        $("#cert-key-import").val("");
        let certificates = certs_app.get_certificates;
        let res = window.PKISTORE.importKey(key_path, pass);
        let key = 0;
        if (res) {
            for (let i: number = 0; i < certificates.length; i++) {
                if (certificates[i].active) {
                    certificates[i].privateKey = true;
                    key = i;
                }
            }
            certs_app.set_certificates = certificates;

            $(".toast-key_import_ok").remove();
            Materialize.toast(lang.get_resource.Certificate.key_import_ok, 2000, "toast-key_import_ok");
        } else {
            $(".toast-key_import_failed").remove();
            Materialize.toast(lang.get_resource.Certificate.key_import_failed, 2000, "toast-key_import_failed");
        }
    }
    exportDirectory() {
        if (window.framework_NW) {
            let clickEvent = document.createEvent("MouseEvents");
            clickEvent.initEvent("click", true, true);
            document.querySelector("#choose-folder-export").dispatchEvent(clickEvent);
        } else {
            let file = dialog.showSaveDialog({
                title: lang.get_resource.Certificate.export_cert,
                defaultPath: lang.get_resource.Certificate.certificate + ".pfx",
                filters: [{ name: lang.get_resource.Certificate.certs, extensions: ['pfx'] }]
            });
            this.exportCert(file);
        };
    }
    exportCert(file: string) {
        let self = this;
        if (file) {
            $("#get-password").openModal({
                complete: function () {
                    let certItem = certs_app.get_certificate_for_info;
                    let cert = window.PKISTORE.getPkiObject(certItem);
                    let key = window.PKISTORE.findKey(certItem);

                    if (!cert || !key) {
                        $(".toast-cert_export_failed").remove();
                        Materialize.toast(lang.get_resource.Certificate.cert_export_failed, 2000, "toast-cert_export_failed");
                    } else {
                        let p12 = pkcs12.createPkcs12(cert, key, null, self.state.pass_value, certItem.name);
                        pkcs12.save(p12, file);
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
        let self = this;
        let cert: any = null;
        let title: any = null;
        let certificate_for_info = certs_app.get_certificate_for_info;
        let current = certificate_for_info ? "not-active" : "active";
        if (certificate_for_info) {
            cert = <CertInfo name={certificate_for_info.name}
                issuerName={certificate_for_info.issuerName}
                organization={certificate_for_info.organization}
                validityDate={new Date(certificate_for_info.notAfter)}
                algSign={certificate_for_info.algSign}
                privateKey={certificate_for_info.privateKey} />;
            title = <div className="cert-title-main">
                <div className="collection-title cert-title">{certificate_for_info.name}</div>
                <div className="collection-info cert-info cert-title">{certificate_for_info.issuerName}</div>
            </div>;
        } else {
            cert = "";
            title = <span>{lang.get_resource.Certificate.cert_info}</span>;
        }
        let certificates = certs_app.get_certificates;
        let cert_search = certificates;
        let search_value = certs_app.get_search_value;
        search_value = search_value.trim().toLowerCase();
        if (search_value.length > 0) {
            cert_search = cert_search.filter(function (e: any) {
                return e.name.toLowerCase().match(search_value);
            })
        }
        let name = cert_search.length < 1 ? "active" : "not-active";
        let view = cert_search.length < 1 ? "not-active" : "";
        let disabled = certificate_for_info ? "" : "disabled";
        return (
            <div className="main">
                <div className="content">
                    <div className="col s6 m6 l6 content-item-height" style={{ paddingRight: 0 }}>
                        <div className="cert-content-item">
                            <div className="content-wrapper z-depth-1">
                                <ToolBarWithSearch operation="certificate" disable="" import={
                                    function (event: any) {
                                        self.certImport(event.target.files);
                                    }
                                } />
                                <div className="add-certs">
                                    <div className="add-certs-item">
                                        <div className={"add-cert-collection collection " + view}>
                                            <input type="file" className="input-file" id="cert-key-import" onChange={
                                                function (event: any) {
                                                    self.importCertKey(event.target.files);
                                                }
                                            } />
                                            {cert_search.map(function (l: any) {
                                                let status: string;
                                                if (l.status) {
                                                    status = "status_cert_ok_icon";
                                                }
                                                else {
                                                    status = "status_cert_fail_icon";
                                                }
                                                return <CertCollectionList name={l.name}
                                                    issuerName={l.issuerName}
                                                    status={status}
                                                    index={l.key}
                                                    chooseCert={function (event: any) { self.activeCert(event, certificates[l.key]); } }
                                                    operation="certificate"
                                                    cert_key={l.privateKey}
                                                    active_cert={l.active}
                                                    key={l.key} />;
                                            })}
                                        </div>
                                        <BlockNotElements name={name} title={lang.get_resource.Certificate.cert_not_found} />
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
                                                self.exportCert(event.target.value);
                                            } } />
                                        </li>
                                        <li className="right">
                                            <a className={"nav-small-btn waves-effect waves-light " + disabled} data-activates="dropdown-btn-for-cert">
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
                                        <BlockNotElements name={current} title={lang.get_resource.Certificate.cert_not_select} />
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
            inDuration: 300,
            outDuration: 225,
            constrain_width: false,
            gutter: 0,
            belowOrigin: false,
            alignment: "left"
        }
        );
        sign.on(SignApp.SETTINGS, this.changeCertificate);
    }
    componentWillUnmount() {
        sign.removeListener(SignApp.SETTINGS, this.changeCertificate);
    }
    changeCertificate() {
        this.setState({});
    }
    chooseCert() {
        let cert: any;
        let certificates = sign.get_certificates;
        for (let i = 0; i < certificates.length; i++) {
            if (certificates[i].active) {
                cert = certificates[i];
            }
        }
        sign.set_sign_certificate = cert;
    }
    activeCert(event: any, cert: any) {
        let certificates = sign.get_certificates;
        for (let i = 0; i < certificates.length; i++) {
            certificates[i].active = false;
        }
        certificates[cert.key].active = true;
        sign.set_certificates = certificates;
        sign.set_certificate_for_info = cert;
    }
    selectedCert(cert: any) {
        let certificates = sign.get_certificates;
        for (let i = 0; i < certificates.length; i++) {
            certificates[i].active = false;
        }
        certificates[cert.key].active = true;
        sign.set_certificates = certificates;
        sign.set_certificate_for_info = cert;
        sign.set_sign_certificate = cert;
        $("#add-cert").closeModal();
    }
    render() {
        let certificates = sign.get_certificates;
        let cert_search = sign.get_certificates;
        let search_value = sign.get_search_value;
        search_value = search_value.trim().toLowerCase();
        if (search_value.length > 0) {
            cert_search = cert_search.filter(function (e: any) {
                return e.name.toLowerCase().match(search_value);
            })
        }
        let name = cert_search.length < 1 ? "active" : "not-active";
        let view = cert_search.length < 1 ? "not-active" : "";
        let self = this;
        let cert: any = null;
        let item_bar: any = null;
        let certificate_for_info = sign.get_certificate_for_info;
        let current = certificate_for_info ? "not-active" : "active";
        if (certificate_for_info) {
            cert = <CertInfo name={certificate_for_info.name}
                issuerName={certificate_for_info.issuerName}
                organization={certificate_for_info.organization}
                validityDate={new Date(certificate_for_info.notAfter)}
                algSign={certificate_for_info.algSign}
                privateKey={certificate_for_info.privateKey} />;
            item_bar = <ItemBar text={certificate_for_info.name} second_text={certificate_for_info.issuerName} />
        } else {
            cert = "";
            item_bar = <ItemBar text={lang.get_resource.Certificate.cert_info} />;
        }
        let not_active = sign.get_sign_certificate ? "not-active" : "";
        let active = sign.get_sign_certificate ? "active" : "not-active";
        let active_elem = sign.get_certificate_for_info ? "active" : "";
        let settings = {
            draggable: false,
        };
        return (
            <div id="cert-content" className="content-wrapper z-depth-1">
                <CertContentToolBarForSign btn_active={active} />
                <div className={"cert-contents " + not_active}>
                    <a className="waves-effect waves-light btn-large add-cert-btn" {...settings} href="#add-cert">{lang.get_resource.Certificate.Select_Cert_Sign}</a>
                </div>
                <CertificateView />
                <div id="add-cert" className="modal cert-window">
                    <div className="add-cert-content">
                        <ItemBarWithBtn text={lang.get_resource.Certificate.certs} new_class="modal-bar" icon="close" on_btn_click={function () {
                            $("#add-cert").closeModal();
                        } } />
                        <div className="cert-window-content">
                            <div className="col s6 m6 l6 content-item-height" style={{ paddingRight: 0 }}>
                                <div className="cert-content-item">
                                    <div className="content-wrapper z-depth-1">
                                        <ToolBarWithSearch disable="disabled" import={function (event: any) { } } operation="sign" />
                                        <div className="add-certs">
                                            <div className="add-certs-item">
                                                <div className={"add-cert-collection collection " + view}>
                                                    {cert_search.map(function (l: any, i: number) {
                                                        let status: string;
                                                        if (l.status) {
                                                            status = "status_cert_ok_icon";
                                                        }
                                                        else {
                                                            status = "status_cert_fail_icon";
                                                        }
                                                        return <CertCollectionList name={l.name}
                                                            issuerName={l.issuerName}
                                                            status={status}
                                                            index={l.key}
                                                            chooseCert={function (event: any) { self.activeCert(event, certificates[l.key]); } }
                                                            operation="sign"
                                                            cert_key={l.privateKey}
                                                            active_cert={l.active}
                                                            key={i}
                                                            selectedCert={function () { self.selectedCert(certificates[l.key]) } } />;
                                                    })}
                                                </div>
                                                <BlockNotElements name={name} title={lang.get_resource.Certificate.cert_not_found} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col s6 m6 l6 content-item-height">
                                <div className={"cert-content-item-height " + active_elem}>
                                    <div className="content-wrapper z-depth-1">
                                        {item_bar}
                                        <div className="add-certs">
                                            <div className="add-certs-item">
                                                {cert}
                                                <BlockNotElements name={current} title={lang.get_resource.Certificate.cert_not_select} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={"choose-cert " + active_elem}>
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
    active_cert: boolean;
}
class CertCollectionList extends React.Component<ICertCollectionListProps, any> {
    constructor(props: ICertCollectionListProps) {
        super(props);
    }
    componentDidMount() {
        $(".cert-setting-item").dropdown({
            inDuration: 300,
            outDuration: 225,
            constrain_width: false,
            gutter: 0,
            belowOrigin: false,
            alignment: "right"
        });
    }
    stopEvent(event: any) {
        event.stopPropagation();
    }
    addCertKey() {
        let clickEvent = document.createEvent("MouseEvents");
        clickEvent.initEvent("click", true, true);
        document.querySelector("#cert-key-import").dispatchEvent(clickEvent);
    }
    render() {
        let self = this;
        let cert_key_menu: any = null;
        let active = "";
        let style = {};
        if (this.props.active_cert) {
            active = "active";
        }
        if (this.props.operation === "certificate" && !this.props.cert_key) {
            cert_key_menu = <div>
                <i className="cert-setting-item waves-effect material-icons secondary-content"
                    data-activates={"cert-key-set-file-" + this.props.index} onClick={self.stopEvent}>more_vert</i>
                <ul id={"cert-key-set-file-" + this.props.index} className="dropdown-content">
                    <li><a onClick={this.addCertKey.bind(this)}>{lang.get_resource.Certificate.import_key}</a></li>
                </ul>
            </div>;
        }
        else {
            cert_key_menu = "";
        }
        let double_click: any = null;
        if (this.props.operation === "sign") {
            double_click = this.props.selectedCert.bind(this);
        } else {
            double_click = function () { };
        }
        return <div className={"collection-item avatar certs-collection " + active} id={"cert-" + this.props.index}
            onClick={this.props.chooseCert.bind(this)}
            onDoubleClick={double_click}
            style={style}>
            <div className="r-iconbox-link">
                <div className="r-iconbox-cert-icon"><i className={this.props.status} id="cert-status"></i></div>
                <p className="collection-title">{this.props.name}</p>
                <p className="collection-info cert-info">{this.props.issuerName}</p>
            </div>
            {cert_key_menu}
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
        let privKey = this.props.privateKey ? lang.get_resource.Certificate.present : lang.get_resource.Certificate.absent;
        let text_white = this.props.classForReg ? this.props.classForReg[0] : "";
        let text_gray = this.props.classForReg ? this.props.classForReg[1] : "";
        let organization = "-";
        if (this.props.organization) {
            organization = this.props.organization;
        }
        return <div className="add-cert-collection collection cert-info-list">
            <div className="collection-item certs-collection certificate-info">
                <div className={"collection-title " + text_white}>{this.props.name}</div>
                <div className={"collection-info cert-info " + text_gray}>{lang.get_resource.Certificate.subject}</div>
            </div>
            <div className="collection-item certs-collection certificate-info">
                <div className={"collection-title " + text_white}>{organization}</div>
                <div className={"collection-info cert-info " + text_gray}>{lang.get_resource.Certificate.organization}</div>
            </div>
            <div className="collection-item certs-collection certificate-info">
                <div className={"collection-title " + text_white}>{this.props.issuerName}</div>
                <div className={"collection-info cert-info " + text_gray}>{lang.get_resource.Certificate.issuer_name}</div>
            </div>
            <div className="collection-item certs-collection certificate-info">
                <div className={"collection-title " + text_white}>{this.props.validityDate.toLocaleDateString(lang.get_lang, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric'
                })}</div>
                <div className={"collection-info cert-info " + text_gray}>{lang.get_resource.Certificate.cert_valid}</div>
            </div>
            <div className="collection-item certs-collection certificate-info">
                <div className={"collection-title " + text_white}>{this.props.algSign}</div>
                <div className={"collection-info cert-info " + text_gray}>{lang.get_resource.Sign.alg}</div>
            </div>
            <div className="collection-item certs-collection certificate-info">
                <div className={"collection-title " + text_white}>{privKey}</div>
                <div className={"collection-info cert-info " + text_gray}>{lang.get_resource.Certificate.priv_key}</div>
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
        let sign_certificate = sign.get_sign_certificate;
        if (sign_certificate) {
            let privKey = sign_certificate.privateKey ? lang.get_resource.Certificate.present : lang.get_resource.Certificate.absent;
            return <div className="cert-view-main">
                <div className="cert-main-item">
                    <div className="add-cert-collection collection cert-info-list">
                        <div className="collection-item certs-collection certificate-info">
                            <div className="collection-title">{sign_certificate.name}</div>
                            <div className="collection-info cert-info">{lang.get_resource.Certificate.subject}</div>
                        </div>
                        <div className="collection-item certs-collection certificate-info">
                            <div className="collection-title">{sign_certificate.organization}</div>
                            <div className="collection-info cert-info">{lang.get_resource.Certificate.organization}</div>
                        </div>
                        <div className="collection-item certs-collection certificate-info">
                            <div className="collection-title">{sign_certificate.algSign}</div>
                            <div className="collection-info cert-info">{lang.get_resource.Sign.alg}</div>
                        </div>
                    </div>
                </div>
                <div className="cert-main-item">
                    <div className="add-cert-collection collection cert-info-list">
                        <div className="collection-item certs-collection certificate-info">
                            <div className="collection-title">{sign_certificate.issuerName}</div>
                            <div className="collection-info cert-info">{lang.get_resource.Certificate.issuer}</div>
                        </div>
                        <div className="collection-item certs-collection certificate-info">
                            <div className="collection-title">{new Date(sign_certificate.notAfter).toLocaleDateString(lang.get_lang, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                                second: 'numeric'
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
        }
        else {
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
                    <a className={"nav-small-btn waves-effect waves-light " + this.props.btn_active} onClick={function () { $("#add-cert").openModal() } }>
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
            inDuration: 300,
            outDuration: 225,
            constrain_width: false,
            gutter: 0,
            belowOrigin: false,
            alignment: "right"
        }
        );
    }
    componentDidMount() {
        $(".add-cert-btn").leanModal();
        $(".nav-small-btn, .cert-btn, .cert-set-btn").dropdown({
            inDuration: 300,
            outDuration: 225,
            constrain_width: false,
            gutter: 0,
            belowOrigin: false,
            alignment: "left"
        }
        );
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
        let Array: any = [];
        let certificates = encrypt.get_certificates;
        certificates[certs.key].active = !certificates[certs.key].active;
        encrypt.set_certificates = certificates;
        for (let i = 0; i < certificates.length; i++) {
            if (certificates[i].active) {
                Array.push(certificates[i]);
            }
        }
        encrypt.set_certificates_is_active = Array;
    }
    viewCertInfo(event: any, cert: any) {
        encrypt.set_certificate_for_info = cert;
    }
    backViewChooseCerts() {
        encrypt.set_certificate_for_info = null;
    }
    removeChooseCerts() {
        encrypt.set_certificates_is_active = [];
        let certificates = encrypt.get_certificates;
        for (let i = 0; i < certificates.length; i++) {
            certificates[i].active = false;
        }
        encrypt.set_certificates = certificates;
    }
    render() {
        let self = this;
        let activeButton: any = null;
        let cert: any = null;
        let title: any = null;
        let certificates_for_encrypt = encrypt.get_certificates_for_encrypt;
        let certificates = encrypt.get_certificates;
        let certificates_is_active = encrypt.get_certificates_is_active;
        let certificate_for_info = encrypt.get_certificate_for_info;
        let choose = certificates_is_active.length < 1 || certificate_for_info ? "not-active" : "active";
        let chooseView = certificates_is_active.length < 1 ? "active" : "not-active";
        let disable = certificates_is_active.length < 1 ? "disabled" : "";
        let not_active = certificates_for_encrypt.length > 0 ? "not-active" : "";
        if (certificate_for_info) {
            cert = <CertInfo name={certificate_for_info.name}
                issuerName={certificate_for_info.issuerName}
                organization={certificate_for_info.organization}
                validityDate={new Date(certificate_for_info.notAfter)}
                algSign={certificate_for_info.algSign}
                privateKey={certificate_for_info.privateKey} />;
            title = <div className="cert-title-main">
                <div className="collection-title cert-title">{certificate_for_info.name}</div>
                <div className="collection-info cert-info cert-title">{certificate_for_info.issuerName}</div>
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
                <a className={"nav-small-btn waves-effect waves-light " + disable} data-activates="dropdown-btn-certlist">
                    <i className="nav-small-icon material-icons">more_vert</i>
                </a>
                <ul id="dropdown-btn-certlist" className="dropdown-content">
                    <li><a onClick={this.removeChooseCerts.bind(this)}>{lang.get_resource.Settings.remove_list}</a></li>
                </ul>
            </li>;
        }
        let cert_search = encrypt.get_certificates;
        let search_value = encrypt.get_search_value;
        search_value = search_value.trim().toLowerCase();
        if (search_value.length > 0) {
            cert_search = cert_search.filter(function (e: any) {
                return e.name.toLowerCase().match(search_value);
            })
        }
        let name = cert_search.length < 1 ? "active" : "not-active";
        let view = cert_search.length < 1 ? "not-active" : "";
        let settings = {
            draggable: false,
        };
        return (
            <div id="cert-content" className="content-wrapper z-depth-1">
                <CertContentToolBarForEncrypt />
                <div className={"cert-contents " + not_active}>
                    <a className="waves-effect waves-light btn-large add-cert-btn" {...settings}  href="#add-cert">{lang.get_resource.Certificate.Select_Cert_Encrypt}</a>
                </div>
                <ChooseCertsView />
                <div id="add-cert" className="modal cert-window">
                    <div className="add-cert-content">
                        <ItemBarWithBtn text={lang.get_resource.Certificate.certs} new_class="modal-bar" icon="close" on_btn_click={function () {
                            $("#add-cert").closeModal();
                        } } />
                        <div className="cert-window-content">
                            <div className="col s6 m6 l6 content-item-height" style={{ paddingRight: 0 }}>
                                <div className="cert-content-item">
                                    <div className="content-wrapper z-depth-1">
                                        <ToolBarWithSearch disable="disabled" import={function (event: any) { } } operation="encrypt" />
                                        <div className="add-certs">
                                            <div className="add-certs-item">
                                                <div className={"add-cert-collection collection " + view}>
                                                    {cert_search.map(function (l: any, i: number) {
                                                        let status: string;
                                                        if (l.status) {
                                                            status = "status_cert_ok_icon";
                                                        }
                                                        else {
                                                            status = "status_cert_fail_icon";
                                                        }
                                                        return <CertCollectionList name={l.name}
                                                            issuerName={l.issuerName}
                                                            status={status}
                                                            index={l.key}
                                                            chooseCert={function (event: any) { self.activeCert(event, certificates[l.key]); } }
                                                            operation="encrypt"
                                                            cert_key={l.privateKey}
                                                            active_cert={l.active}
                                                            key={i} />;
                                                    })}
                                                </div>
                                                <BlockNotElements name={name} title={lang.get_resource.Certificate.cert_not_found} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col s6 m6 l6 content-item-height">
                                <div className={"cert-content-item-height " + choose}>
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
                                                <div className={"add-cert-collection choose-cert-collection collection " + choose}>
                                                    {certificates_is_active.map(function (l: any, i: number) {
                                                        let status: string;
                                                        if (l.status) {
                                                            status = "status_cert_ok_icon";
                                                        }
                                                        else {
                                                            status = "status_cert_fail_icon";
                                                        }
                                                        return <CertCollectionList name={l.name}
                                                            issuerName={l.issuerName}
                                                            status={status}
                                                            index={l.key}
                                                            chooseCert={function (event: any) { self.viewCertInfo(event, certificates[l.key]); } }
                                                            operation="encrypt"
                                                            cert_key={l.privateKey}
                                                            active_cert={false}
                                                            key={i} />;
                                                    })}
                                                </div>
                                                {cert}
                                                <BlockNotElements name={chooseView} title={lang.get_resource.Certificate.cert_not_select} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={"choose-cert " + choose}>
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
        let certificates_for_encrypt = encrypt.get_certificates_for_encrypt;
        if (certificates_for_encrypt.length > 0) {
            return <div className="cert-view-main choose-certs-view">
                <div className={"add-cert-collection collection "}>
                    {certificates_for_encrypt.map(function (l: any, i: number) {
                        let status: string;
                        if (l.status) {
                            status = "status_cert_ok_icon";
                        }
                        else {
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
        }
        else {
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
        let certificates = encrypt.get_certificates;
        for (let i = 0; i < certificates.length; i++) {
            certificates[i].active = false;
        }
        encrypt.set_certificates = certificates;
    }
    render() {
        let certificates_for_encrypt = encrypt.get_certificates_for_encrypt;
        let disabled = certificates_for_encrypt.length > 0 ? "" : "disabled"
        let active = certificates_for_encrypt.length > 0 ? "active" : "not-active";
        return <nav className="app-bar-content">
            <ul className="app-bar-items">
                <li className="app-bar-item" style={{ width: "calc(100% - 85px)" }}><span>{lang.get_resource.Certificate.certs_encrypt}</span></li>
                <li className="right">
                    <a className={"nav-small-btn waves-effect waves-light " + active} onClick={function () { $("#add-cert").openModal() } }>
                        <i className="material-icons nav-small-icon">add</i>
                    </a>
                    <a className={"nav-small-btn waves-effect waves-light " + disabled} data-activates="dropdown-btn-set-cert">
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
