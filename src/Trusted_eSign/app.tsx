import * as React from "react";
import { hashHistory, IndexRoute, Route, Router } from "react-router";
import { AboutWindow } from "./components/AboutWindow";
import { CertWindow } from "./components/certificate";
import { EncryptWindow } from "./components/encrypt";
import { HelpWindow } from "./components/help";
import { AppBar, MainWindow } from "./components/main_window";
import { SettWindow } from "./components/settings";
import { SignWindow } from "./components/sign";
import { MainSlideUnReg, RegCert, RegLogin, RegSlide, RegSocial } from "./components/slider";

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
