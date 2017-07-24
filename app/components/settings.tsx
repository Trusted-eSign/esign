import * as React from "react";
import { lang } from "../module/global_app";
import MenuBar from "./MenuBar";
//declare let $: any;

export class SettWindow extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
    }
    render() {
        return (
            <div className="main">
                <MenuBar title={lang.get_resource.Settings.settings} />
                <div className="content">
                </div>
            </div>
        );
    }
}
