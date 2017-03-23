import * as React from "react";
import { Router, Route, hashHistory, IndexRoute } from "react-router";
import { SignWindow } from "./components/sign";
import { EncryptWindow } from "./components/encrypt";
import { CertWindow } from "./components/certificate";
import { SettWindow } from "./components/settings";
import { AboutWindow } from "./components/about";
import { HelpWindow } from "./components/help";
import { MainWindow, AppBar } from "./components/main_window";
import { RegSlide, MainSlideUnReg, RegLogin, RegSocial, RegCert } from "./components/slider";


export let router: JSX.Element = (
    <Router history={hashHistory}>
        <Route path="/" component={AppBar}>
            {
                /*<IndexRoute component={MainSlideUnReg}/>
                <Route path="reg_select" component={RegSlide}/>
                <Route path="reg_login" component={RegLogin}/>
                <Route path="reg_social" component={RegSocial}/>
                <Route path="reg_cert" component={RegCert}/>*/
            }
            <IndexRoute component={MainWindow} />
            <Route path="/sign" component={SignWindow} />
            <Route path="/encrypt" component={EncryptWindow} />
            <Route path="/certificate" component={CertWindow} />
            <Route path="/about" component={AboutWindow} />
            <Route path="/help" component={HelpWindow} />
            <Route path="/settings" component={SettWindow} />
        </Route>
    </Router>
);

