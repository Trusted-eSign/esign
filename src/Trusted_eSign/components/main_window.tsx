import * as React from "react";
import { Link } from "react-router";
import { lang, LangApp } from "../module/global_app";
import * as native from "../native";
import { LicenseKey, MainToolBar } from "./components";
import { Slider } from "./slider";
//import { getLicenseStatus } from "../module/license";
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
        window.mainWindow.close();
    }
    toLinkSoc(address: string) {
        window.electron.shell.openExternal(address);
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
                                        <div className="white-text text-lighten-3">
                                            {lang.get_resource.About.company_name}<br />{lang.get_resource.About.copyright}
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
        let settings = {
            draggable: false,
        };
        return <div className="col l3 s4">
            <Link to={"/" + this.props.operation} className="r-iconbox-link iconpos_left">
                <div className="r-iconbox-link">
                    <div className="r-iconbox-icon">
                        <div className={this.props.operation + "_roundbutton_icon" }></div>
                    </div>
                    <h5 className="r-iconbox-title">{this.props.title_pre}<br />{this.props.title_post}</h5>
                </div>
                <div className="r-iconbox-text">
                    <p>{this.props.info}</p>
                </div>
           </Link>
        </div>;
    }
}
