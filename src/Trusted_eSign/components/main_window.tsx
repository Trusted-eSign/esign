import * as React from "react";
import { MainToolBar, LicenseKey } from "./components";
import { Link } from "react-router";
import * as native from "../native";
import { lang, LangApp } from "../module/global_app";
import { Slider } from "./slider";
import { getLicenseStatus } from "../module/license";
declare let $: any;

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
        let status = getLicenseStatus();
        if (status.type === "error") {
            $(".toast-status.message").remove();
            Materialize.toast(status.message, 10000, "toast-status.message");
        }
    }
    componentWillUnmount() {
        lang.removeListener(LangApp.SETTINGS, this.setComponents);
    }
    setComponents() {
        this.setState({});
    }
    render() {
        let self = this;
        let route_path = this.props.children.props.route.path;
        let title: string;
        if (route_path === "/sign")
            title = lang.get_resource.Sign.sign_and_verify;
        else if (route_path === "/encrypt")
            title = lang.get_resource.Encrypt.encrypt_and_decrypt;
        else if (route_path === "/certificate")
            title = lang.get_resource.Certificate.certs;
        else if (route_path === "/about")
            title = lang.get_resource.About.about;
        else if (route_path === "/license")
            title = lang.get_resource.License.license;
        else if (route_path === "/help")
            title = lang.get_resource.Help.help;
        else
            title = lang.get_resource.About.product_NAME;
        return (
            <div className="main">
                <MainToolBar title={title} />
                {this.props.children}
            </div>
        );
    }
}

export class MainWindow extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = ({ text: "" });
        this.change = this.change.bind(this);
    }
    componentDidMount() {
        lang.on(LangApp.SETTINGS, this.change);
    }
    componentWillUnmount() {
        lang.removeListener(LangApp.SETTINGS, this.change);
    }
    change() {
        this.setState({});
    }
    checkLicenseFile() {
        let licFilePath = native.path.join(native.DEFAULT_PATH, lang.get_resource.License.key_file_name);
        if (!this.fileExists(licFilePath)) {
            return false;
        }

        let lic = native.fs.readFileSync(licFilePath, "utf8");
        if (lic.length !== 41) {
            return false;
        }

        return true;
    }
    fileExists(filePath: string) {
        try {
            return native.fs.statSync(filePath).isFile();
        } catch (err) {
            return false;
        }
    }
    closeWindow() {
        mainWindow.close();
    }
    toLinkSoc(address: string) {
        shell.openExternal(address);
    }
    render() {
        let self = this;
        return (
            <div className="main">
                <div className="main-window">
                    <Slider router={this.props.children} />
                    <div className="page-footer mainfooter">
                        <div className="footer-copyright">
                            <div className="row">
                                <div className="col l3 s1"><i className="ctlogo"></i></div>
                                <div className="col l3 s4">
                                    <div className="copyright">
                                        <a className="white-text text-lighten-3" target="_blank" onClick={function (event: any) { self.toLinkSoc(lang.get_resource.About.link_trusred) } }>
                                            {lang.get_resource.About.company_name}<br />{lang.get_resource.About.copyright}
                                        </a>
                                    </div>
                                </div>
                                <div className="col l3 s7">
                                    <div className="r-socials">
                                        <div className="r-socials-list">
                                            <Socials socialLink={lang.get_resource.About.link_facebook} social="facebook" />
                                            <Socials socialLink={lang.get_resource.About.link_vk} social="vk" />
                                            <Socials socialLink={lang.get_resource.About.link_twitter} social="twitter" />
                                        </div>
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

interface IMainWindowOperationsProps {
    info: string;
    title_pre: string;
    title_post: string;
    operation: string;
}
export class MainWindowOperations extends React.Component<IMainWindowOperationsProps, any> {
    constructor(props: IMainWindowOperationsProps) {
        super(props);
    }
    render() {
        return <div className="col l3 s4">
            <div className="r-iconbox iconpos_left">
                <div className="r-iconbox-link">
                    <div className="r-iconbox-icon">
                        <Link to={"/" + this.props.operation} draggable="false" className={this.props.operation + "_roundbutton_icon"} />
                    </div>
                    <h5 className="r-iconbox-title">{this.props.title_pre}<br />{this.props.title_post}</h5>
                </div>
                <div className="r-iconbox-text">
                    <p>{this.props.info}</p>
                </div>
            </div>
        </div>;
    }
}
interface ISocialsProps {
    socialLink: string;
    social: string;
}
class Socials extends React.Component<ISocialsProps, any> {
    constructor(props: ISocialsProps) {
        super(props);
    }
    toLinkSoc(address: string) {
        shell.openExternal(address);
    }
    render() {
        let self = this;
        return <div className="r-socials-item">
            <a className="w-socials-item-link" target="_blank" onClick={function (event: any) { self.toLinkSoc(self.props.socialLink) } }>
                <i className={self.props.social} />
            </a>
        </div>;
    }
}
