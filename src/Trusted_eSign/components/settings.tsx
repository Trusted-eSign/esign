import * as React from "react";
import { MainToolBar } from "./components";
import { lang } from "../module/global_app";
declare let $: any;

export class SettWindow extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
    }
    render() {
        return (
            <div className="main">
                <MainToolBar title={lang.get_resource.Settings.settings} />
                <div className="content">
                </div>
            </div>
        );
    }
}
