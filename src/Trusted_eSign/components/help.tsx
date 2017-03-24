import * as React from "react";
import { lang } from "../module/global_app";
import { MainToolBar } from "./components";
declare let $: any;

export class HelpWindow extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
    }
    render() {
        return (
            <div className="tmain">
                <div className="content">
                    <webview src="help/help.html" style={{ width: 100 + "%" }}></webview>
                </div>
            </div>
        );
    }
}
