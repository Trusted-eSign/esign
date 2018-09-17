import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import {
  changeAuthURL, changeRestURL, getCertificates,
} from "../../AC/cloudCspActions";
import { USER_NAME } from "../../constants";
import logger from "../../winstonLogger";
import AuthWebView from "./AuthWebView";

interface ICloudCSPProps {
  changeAuthURL: (authURL: string) => void;
  changeRestURL: (restURL: string) => void;
  onCancel?: () => void;
  settings: {
    authURL: string,
    restURL: string,
  };
}

interface ICloudCSPState {
  activeSettingsTab: boolean;
}

class CloudCSP extends React.Component<ICloudCSPProps, ICloudCSPState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: ICloudCSPProps) {
    super(props);

    this.state = ({
      activeSettingsTab: true,
    });
  }

  componentDidMount() {
    Materialize.updateTextFields();
  }

  componentDidUpdate() {
    Materialize.updateTextFields();
  }

  componentWillUnmount() {
    this.handelCancel();
  }

  render() {
    const { localize, locale } = this.context;
    const { activeSettingsTab } = this.state;
    const { settings } = this.props;

    return (
      <div className="cloudCSP_modal">
        <div className="row halftop">
          <div className="col s12">
            <div className="content-wrapper tbody border_group_cloud">
              {
                activeSettingsTab ?
                  <div className="row">
                    <div className="row">
                      <div className="row" />
                      <div className="input-field input-field-csr col s12">
                        <input
                          id="auth"
                          type="text"
                          className={"validate"}
                          name="auth"
                          value={settings.authURL}
                          placeholder={localize("CloudCSP.auth", locale)}
                          onChange={this.handleAuthChange}
                        />
                        <label htmlFor="auth">
                          {localize("CloudCSP.auth", locale)}
                        </label>
                      </div>
                    </div>
                    <div className="row">
                      <div className="input-field input-field-csr col s12">
                        <input
                          id="rest"
                          type="text"
                          className={"validate"}
                          name="rest"
                          value={settings.restURL}
                          placeholder={localize("CloudCSP.rest", locale)}
                          onChange={this.handleRestChange}
                        />
                        <label htmlFor="rest">
                          {localize("CloudCSP.rest", locale)}
                        </label>
                      </div>
                    </div>

                    <div className="col s12">
                      <span className="card-infos sub">
                        1. Укажите адреса сервера авторизации и сервера подписи DSS. Для получения правильных адресов обратитесь в службу поддержки сервиса DSS.
                        </span>
                    </div>
                    <div className="col s12">
                      <span className="card-infos sub">
                        2. Нажмите кнопку «Далее»
                        </span>
                    </div>
                    <div className="col s12">
                      <span className="card-infos sub">
                        3. В появившемся окне введите логин и пароль от сервиса DSS
                        </span>
                    </div>
                    <div className="col s12">
                      <span className="card-infos sub">
                        4. Нажмите кнопку «Войти»
                        </span>
                    </div>

                  </div>
                  :
                  <AuthWebView onCancel={this.handelCancel} onTokenGet={this.onTokenGet} auth={settings.authURL} />
              }
            </div>
          </div>
        </div>

        <div className="row halbottom" />

        <div className="row">
          {
            activeSettingsTab ?
              <div className="col s5 offset-s7">
                <div className="col s6">
                  <a className={"waves-effect waves-light btn btn_modal modal-close"} onClick={this.handelCancel}>{localize("Common.cancel", locale)}</a>
                </div>
                <div className="col s6">
                  <a className="waves-effect waves-light btn btn_modal" onClick={this.handleNext}>{localize("Common.next", locale)}</a>
                </div>
              </div>
              :
              <div className="col s3 offset-s9">
                <a className={"waves-effect waves-light btn btn_modal modal-close"} onClick={this.handelCancel}>{localize("Common.cancel", locale)}</a>
              </div>
          }
        </div>
      </div >
    );
  }

  handelCancel = () => {
    const { onCancel } = this.props;

    if (onCancel) {
      onCancel();
    }
  }

  handleNext = () => {
    const { localize, locale } = this.context;

    if (Number(this.getCPCSPVersion().charAt(0)) < 5) {
      Materialize.toast(localize("CloudCSP.no_installed_csp5", locale), 2000, "toast-no_installed_csp5");
    } else {
      this.setState({ activeSettingsTab: false });
    }
  }

  handleAuthChange = (ev: any) => {
    this.props.changeAuthURL(ev.target.value);
  }

  handleRestChange = (ev: any) => {
    this.props.changeRestURL(ev.target.value);
  }

  onTokenGet = (token: string) => {
    const { localize, locale } = this.context;
    // tslint:disable-next-line:no-shadowed-variable
    const { getCertificates, settings } = this.props;

    if (!token || !token.length) {
      return;
    }

    getCertificates(settings.authURL, settings.restURL, token);
  }

  getCPCSPVersion = () => {
    try {
      return trusted.utils.Csp.getCPCSPVersion();
    } catch (e) {
      return "";
    }
  }
}

export default connect((state) => ({
  settings: state.settings.cloudCSP,
}), { changeAuthURL, changeRestURL, getCertificates })(CloudCSP);
