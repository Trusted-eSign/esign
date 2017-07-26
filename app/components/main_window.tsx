import * as React from "react";
import { Link } from "react-router";
import { lang, LangApp } from "../module/global_app";
import * as native from "../native";
import { LicenseKey } from "./components";
import MenuBar from "./MenuBar";

//import { getLicenseStatus } from "../module/license";
//declare let $: any;

export class AppBar extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.setComponents = this.setComponents.bind(this);
    }
    componentDidMount() {
        $(".menu-btn").sideNav({
            closeOnClick: true,
        });
        lang.on(LangApp.SETTINGS, this.setComponents);
        //let status = getLicenseStatus();
        //if (status.type === "error") {
        //    $(".toast-status.message").remove();
        //    Materialize.toast(status.message, 10000, "toast-status.message");
        //}
    }
    componentWillUnmount() {
        lang.removeListener(LangApp.SETTINGS, this.setComponents);
    }
    setComponents() {
        this.setState({});
    }
    render() {
        let self = this;
        let route_path = this.props.location.pathname;
        let title: string;
        if (route_path === "/sign")
            title = lang.get_resource.Sign.sign_and_verify;
        else if (route_path === "/encrypt")
            title = lang.get_resource.Encrypt.encrypt_and_decrypt;
        else if (route_path === "/certificate")
            title = lang.get_resource.Certificate.certs;
        else if (route_path === "/about")
            title = lang.get_resource.About.about;
        //else if (route_path === "/license")
        //    title = lang.get_resource.License.license;
        else if (route_path === "/help")
            title = lang.get_resource.Help.help;
        else
            title = lang.get_resource.About.product_NAME;
        return (
            <div className="main">
                <MenuBar title={title} />
                {this.props.children}
            </div>
        );
    }
}
