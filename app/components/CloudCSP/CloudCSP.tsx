import PropTypes from "prop-types";
import React from "react";
import AuthWebView from "./AuthWebView";

interface ICloudCSPProps {
  onCancel?: () => void;
}

interface ICloudCSPState {
  activeSettingsTab: boolean;
  auth: string;
  rest: string;
}

interface ICloudCSPDispatch {
  getCertificatesFromDSS?: (rest: string, token: string) => void;
}

class CloudCSP extends React.Component<ICloudCSPProps & ICloudCSPDispatch, ICloudCSPState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };



  constructor(props: ICloudCSPProps & ICloudCSPDispatch) {
    super(props);

    this.state = ({
      activeSettingsTab: true,
      auth: "https://dss.cryptopro.ru/STS/oauth",
      rest: "https://dss.cryptopro.ru/SignServer/rest",
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
    const { activeSettingsTab, auth, rest } = this.state;

    return (
      <div className="filter_setting_modal">
        <div className="row halftop">
          <div className="col s12">
            <div className="content-wrapper tbody border_group">
              {
                activeSettingsTab ?
                  <div className="row">
                    <div className="row" />
                    <div className="row">
                      <div className="input-field input-field-csr col s12">
                        <input
                          id="auth"
                          type="text"
                          className={"validate"}
                          name="auth"
                          value={auth}
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
                          value={rest}
                          placeholder={localize("CloudCSP.rest", locale)}
                          onChange={this.handleRestChange}
                        />
                        <label htmlFor="rest">
                          {localize("CloudCSP.rest", locale)}
                        </label>
                      </div>
                    </div>
                  </div>
                  :
                  <AuthWebView onCancel={this.handelCancel} onTokenGet={this.onTokenGet} auth={auth} />
              }
            </div>
          </div>
        </div>

        <div className="row halbottom" />

        <div className="row">
          <div className="col s5 offset-s7">
            <div className="col s6">
              <a className={"waves-effect waves-light btn btn_modal modal-close"} onClick={this.handelCancel}>{localize("Common.cancel", locale)}</a>
            </div>
            <div className="col s6">
              <a className="waves-effect waves-light btn btn_modal" onClick={this.handleNext}>{localize("Common.next", locale)}</a>
            </div>
          </div>
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
    this.setState({ activeSettingsTab: false });
  }

  handleAuthChange = (ev: any) => {
    this.setState({ auth: ev.target.value });
  }

  handleRestChange = (ev: any) => {
    this.setState({ rest: ev.target.value });
  }

  onTokenGet = (token: string) => {
    const { localize, locale } = this.context;

    if (!token || !token.length) {
      return;
    }

    window.request.get(`${this.state.rest}/api/certificates`, {
      auth: {
        bearer: token,
      },
    }, (error: any, response: any, body: any) => {
      if (error) {
        Materialize.toast(localize("CloudCSP.request_error", locale), 2000, "toast-request_error");
      }
      const statusCode = response.statusCode;

      if (statusCode !== 200) {
        Materialize.toast(`${localize("CloudCSP.request_error", locale)} : ${statusCode}`, 2000, "toast-request_error");
      } else {
        if (body && body.length) {
          const certificates = JSON.parse(body);
          for (const certificate of certificates) {
            const hcert = this.createX509FromString(certificate.CertificateBase64);
            console.log("hcert:", hcert);
          }
        }
      }
    });
  }

  createX509FromString = (certificateBase64: string): trusted.pki.Certificate | undefined => {
    const raw = `-----BEGIN CERTIFICATE-----\n${certificateBase64}\n-----END CERTIFICATE-----\n`;
    const rawLength = raw.length * 2;
    const array = new Uint8Array(new ArrayBuffer(rawLength));
    let hcert;

    for (let j = 0; j < rawLength; j++) {
      array[j] = raw.charCodeAt(j);
    }

    try {
      hcert = trusted.pki.Certificate.import(array, trusted.DataFormat.PEM);
      return hcert;
    } catch (e) {
      // error
    }

    return undefined;
  }
}

export default CloudCSP;
