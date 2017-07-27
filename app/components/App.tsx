import * as React from "react";
import { hashHistory, IndexRoute, Route, Router} from "react-router";
import history from "../history";
import { AboutWindow } from "./AboutWindow";
import CertWindow from "./CertWindow";
import { EncryptWindow } from "./encrypt";
import HelpWindow from "./HelpWindow";
import MainWindow from "./MainWindow";
import MenuBar from "./MenuBar";
import { SignWindow } from "./sign";

class App extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <Router history={hashHistory}>
        <Route path="/" component={MenuBar}>
          <IndexRoute component={MainWindow} />
          <Route path="/sign" component={SignWindow} />
          <Route path="/encrypt" component={EncryptWindow} />
          <Route path="/certificate" component={CertWindow} />
          <Route path="/about" component={AboutWindow} />
          <Route path="/help" component={HelpWindow} />
        </Route>
      </Router>
    );
  }
}

export default App;