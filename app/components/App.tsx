import PropTypes from "prop-types";
import * as React from "react";
import { connect } from "react-redux";
import { HashRouter, Route } from "react-router-dom";
import {ConnectedRouter as Router, push} from "react-router-redux";
import history from "../history";
import localize from "../i18n/localize";
import store from "../store/index";
import AboutWindow from "./About/AboutWindow";
import CertWindow from "./CertWindow";
import ContainersWindow from "./ContainersWindow";
import EncryptWindow from "./EncryptWindow";
import HelpWindow from "./Help/HelpWindow";
import LicenseWindow from "./License/LicenseWindow";
import MainWindow from "./MainWindow";
import MenuBar from "./MenuBar";
import SignatureWindow from "./SignatureWindow";

interface IAppProps {
  locale: string;
}

class App extends React.Component<IAppProps, {}> {
  static childContextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  getChildContext() {
    const { locale } = this.props;
    return {
      locale,
      localize,
    };
  }

  componentDidMount() {
    store.dispatch(push("/"));
  }

  render() {
    return (
      <Router history={history}>
        <div>
          <Route path="/" component={MenuBar} />
          <Route exact path="/" component={MainWindow} />
          <Route path="/sign" component={SignatureWindow} />
          <Route path="/encrypt" component={EncryptWindow} />
          <Route path="/certificate" component={CertWindow} />
          <Route path="/containers" component={ContainersWindow} />
          <Route path="/license" component={LicenseWindow} />
          <Route path="/about" component={AboutWindow} />
          <Route path="/help" component={HelpWindow} />
        </div>
      </Router>
    );
  }
}

export default connect((state) => ({
  locale: state.settings.locale,
}))(App);
