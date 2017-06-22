import * as React from "react";
import { hashHistory, IndexRoute, Route, Router} from "react-router";
import history from "../history";
import { AboutWindow } from "./AboutWindow";
import CertWindow from "./CertWindow";
import { EncryptWindow } from "./encrypt";
import { HelpWindow } from "./help";
import { AppBar, MainWindow } from "./main_window";
import { SettWindow } from "./settings";
import { SignWindow } from "./sign";
import { MainSlideUnReg, RegCert, RegLogin, RegSlide, RegSocial } from "./slider";

class App extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <Router history={hashHistory}>
        <Route path="/" component={AppBar}>
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
  }
}

export default App;
