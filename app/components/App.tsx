import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { Route } from "react-router-dom";
import { ConnectedRouter as Router, push } from "react-router-redux";
import {
  LOCATION_ABOUT, LOCATION_CERTIFICATES, LOCATION_CONTAINERS,
  LOCATION_DOCUMENTS, LOCATION_ENCRYPT, LOCATION_EVENTS,
  LOCATION_HELP, LOCATION_LICENSE, LOCATION_SIGN,
} from "../constants";
import history from "../history";
import localize from "../i18n/localize";
import store from "../store/index";
import AboutWindow from "./About/AboutWindow";
import CertWindow from "./CertWindow";
import ContainersWindow from "./Containers/ContainersWindow";
import DocumentsWindow from "./Documents/DocumentsWindow";
import EncryptWindow from "./Encrypt/EncryptWindow";
import EventsWindow from "./Events/EventsWindow";
import HelpWindow from "./Help/HelpWindow";
import LicenseWindow from "./License/LicenseWindow";
import MainWindow from "./MainWindow";
import MenuBar from "./MenuBar";
import SignatureWindow from "./Signature/SignatureWindow";

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

    window.locale = this.props.locale;
  }

  render() {
    return (
      <Router history={history}>
        <div>
          <Route path="/" component={MenuBar} />
          <Route exact path="/" component={MainWindow} />
          <Route path={LOCATION_SIGN} component={SignatureWindow} />
          <Route path={LOCATION_ENCRYPT} component={EncryptWindow} />
          <Route path={LOCATION_CERTIFICATES} component={CertWindow} />
          <Route path={LOCATION_CONTAINERS} component={ContainersWindow} />
          <Route path={LOCATION_LICENSE} component={LicenseWindow} />
          <Route path={LOCATION_ABOUT} component={AboutWindow} />
          <Route path={LOCATION_HELP} component={HelpWindow} />
          <Route path={LOCATION_DOCUMENTS} component={DocumentsWindow} />
          <Route path={LOCATION_EVENTS} component={EventsWindow} />
        </div>
      </Router>
    );
  }
}

export default connect((state) => ({
  locale: state.settings.locale,
}))(App);
