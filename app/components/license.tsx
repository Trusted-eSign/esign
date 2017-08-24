import * as React from "react";
import { lang, LangApp } from "../module/global_app";
import { lic, License } from "../module/license";
import * as native from "../native";
import { LicenseKey } from "./components";
declare let $: any;

export class LicenseWindow extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.change = this.change.bind(this);
    }
    componentDidMount() {
        $(".add-licence-modal-btn").leanModal();
        lang.on(LangApp.SETTINGS, this.change);
    }
    componentWillUnmount() {
        lang.removeListener(LangApp.SETTINGS, this.change);
    }
    change() {
        this.setState({});
    }
    setKeyValue(key: any) {
        this.setState({ key_value: key });
    }
    render() {
        let self = this;
        return (
            <div className="main">
                <div className="desktoplic_area">

                    <div className="bmark_desktoplic">{lang.get_resource.License.About_License}</div>

                    <LicenseInfo />
                    <LicenseStatus />
                </div>
                <div className="onlinelic_area">
                </div>
                <LicenseKey text_info={lang.get_resource.License.entered_the_key} closeWindow={function () {
                    $("#add-licence-key").closeModal();
                } } icon="" />
            </div>
        );
    }
}
class LicenseStatus extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.change = this.change.bind(this);
    }
    componentDidMount() {
        lic.on(License.CHANGE, this.change);
    }
    componentWillUnmount() {
        lic.removeListener(License.CHANGE, this.change);
    }
    change() {
        this.setState({});
    }
    render() {
        let style: any;
        let style_row: any;
        if (lic.getStatus.type) {
            style = { color: "red" };
            style_row = { border: "2px solid red", padding: "5px" }
            if (lic.getStatus.type === "ok") {
                style = { color: "green" };
                style_row = { border: "2px solid green", padding: "5px" };
            }
        }
        let settings = {
            draggable: false,
        };
        return (
            <div className="row leftshifter">
                <LicenseInfoItems title={lang.get_resource.License.lic_status} info={lic.getStatus.message} style={style} style_row={style_row} />
                <div className="col s6">
                    <a className="waves-effect waves-light btn add-licence-modal-btn" href="#add-licence-key" {...settings}>{lang.get_resource.License.Enter_Key}</a>
                </div>
            </div>
        );
    }
}
class LicenseInfo extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.change = this.change.bind(this);
    }
    componentDidMount() {
        lic.on(License.CHANGE, this.change);
    }
    componentWillUnmount() {
        lic.removeListener(License.CHANGE, this.change);
    }
    change() {
        this.setState({});
    }
    render() {
        let notAfter: string;
        let notBefore: string;
        if (lic.getInfo.exp === "-") {
            notAfter = "-";
        } else {
            notAfter = new Date(lic.getInfo.exp * 1000).toLocaleDateString(lang.get_lang, {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
            });
        }
        if (lic.getInfo.iat === "-") {
            notBefore = "-";
        } else {
            notBefore = new Date(lic.getInfo.iat * 1000).toLocaleDateString(lang.get_lang, {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
            });
        }
        let style = { height: 39 + "px" };
        let product_name: string;
        if (lic.getInfo.sub === "Trusted eSign") {
            product_name = lang.get_resource.About.product_name;
        } else {
            product_name = "-";
        }
        return (
            <div>
                <div className="row leftshifter">
                    <LicenseInfoItems title={lang.get_resource.Certificate.issuer_name} info={lic.getInfo.iss} />
                    <LicenseInfoItems title={lang.get_resource.Common.subject} info={lic.getInfo.aud} />
                </div>
                <div className="row leftshifter">
                    <LicenseInfoItems title={lang.get_resource.Common.product} info={product_name} />
                    <LicenseInfoItems title={lang.get_resource.License.lic_notbefore} info={notBefore} />
                </div>
                <div className="row leftshifter">
                    <LicenseInfoItems title="" info="" style={style} />
                    <LicenseInfoItems title={lang.get_resource.License.lic_notafter} info={notAfter} />
                </div>
            </div>
        );
    }
}
interface ILicenseInfoItemsProps {
    title: string;
    info: string;
    style?: any;
    style_row?: any;
}
class LicenseInfoItems extends React.Component<ILicenseInfoItemsProps, any> {
    render() {
        return (
            <div className="col s6" style={this.props.style_row}>
                <div className="desktoplic_text_item topitem" style={this.props.style}>{this.props.info}</div>
                <div className="desktoplic_text_item bottomitem">{this.props.title}</div>
            </div>
        );
    }
}
