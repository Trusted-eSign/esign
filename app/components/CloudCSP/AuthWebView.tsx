import PropTypes from "prop-types";
import React from "react";
import ProgressBars from "../ProgressBars";

interface IAuthWebViewProps {
  auth: string;
  onCancel: () => void;
  onTokenGet: (token: string) => void;
}

interface IAuthWebViewState {
  isLoading: boolean;
  url: string;
}

class AuthWebView extends React.PureComponent<IAuthWebViewProps, IAuthWebViewState> {
  constructor(props: IAuthWebViewProps) {
    super(props);
    this.state = {
      isLoading: false,
      // tslint:disable-next-line:max-line-length
      url: `${this.props.auth}/authorize?client_id=digt&response_type=token&scope=dss&redirect_uri=https://net.trusted.ru/idp/sso/authorize?auth_type=dss&resource=https://dss.cryptopro.ru/SignServer/rest/api/certificates`,
    };
  }

  componentDidMount() {
    const webview = document.querySelector("webview");

    if (webview) {
      webview.addEventListener("did-start-loading", this.loadStart);
      webview.addEventListener("did-stop-loading", this.loadStop);
      webview.addEventListener("did-get-redirect-request", (details) => this.redirect(details));
    }
  }

  render() {
    const { isLoading } = this.state;

    return (
      <div>
        {
          isLoading ? <ProgressBars /> : null
        }
        <webview src={this.state.url} autosize={true} style={{ height: "400px" }}></webview>
      </div>
    );
  }

  loadStart = () => {
    this.setState({ isLoading: true });
  }

  loadStop = () => {
    this.setState({ isLoading: false });
  }

  redirect = (details) => {
    const regex = /^https:\/\/net.trusted.ru\/idp\/sso\/authorize\?auth_type=dss&access_token=([^&]*)/;
    const mathes = regex.exec(details.newURL);
    if (mathes) {
      const token = mathes[1];

      if (token && token.length) {
        this.props.onTokenGet(token);
      }

      this.props.onCancel();
    }
  }
}

export default AuthWebView;
