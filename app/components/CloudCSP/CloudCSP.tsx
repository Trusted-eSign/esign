import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import {
  changeAuthURL, changeRestURL,
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
                      <div className="col s12">
                        <span className="card-infos sub">
                          Для установки сертификатов из КриптоПро DSS укажите используемые адреса и нажмите кнопку "Далее".

                          В открывшемся окне аутентификации потребуется ввести логин и пароль пользователя DSS
                        </span>
                      </div>
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
    this.setState({ activeSettingsTab: false });
  }

  handleAuthChange = (ev: any) => {
    this.props.changeAuthURL(ev.target.value);
  }

  handleRestChange = (ev: any) => {
    this.props.changeRestURL(ev.target.value);
  }

  onTokenGet = (token: string) => {
    const { localize, locale } = this.context;
    const { settings } = this.props;

    if (!token || !token.length) {
      return;
    }

    window.request.get(`${settings.restURL}/api/certificates`, {
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
          const certificates: any[] = JSON.parse(body);
          const countOfCertificates = certificates.length;
          let testCount = 0;

          for (const certificate of certificates) {
            const hcert = this.createX509FromString(certificate.CertificateBase64);

            if (hcert) {
              try {
                trusted.utils.Csp.installCertificateFromCloud(hcert, settings.authURL, settings.restURL, certificate.ID);

                testCount++;

                logger.log({
                  certificate: hcert.subjectName,
                  level: "info",
                  message: "",
                  operation: "Импорт сертификата",
                  operationObject: {
                    in: "CN=" + hcert.subjectFriendlyName + " (DSS)",
                    out: "Null",
                  },
                  userName: USER_NAME,
                });
              } catch (err) {
                logger.log({
                  certificate: hcert.subjectName,
                  level: "error",
                  message: err.message ? err.message : err,
                  operation: "Импорт сертификата",
                  operationObject: {
                    in: "CN=" + hcert.subjectFriendlyName + " (DSS)",
                    out: "Null",
                  },
                  userName: USER_NAME,
                });
              }
            }
          }

          if (countOfCertificates && countOfCertificates === testCount) {
            Materialize.toast(localize("CloudCSP.certificates_import_success", locale), 2000, "toast-certificates_import_success");
          } else {
            Materialize.toast(localize("CloudCSP.certificates_import_fail", locale), 2000, "toast-certificates_import_fail");
          }
        }
      }
    });
  }

  /**
   * Create x509 certificate (trusted-crypto implementation) from string
   *
   * @param {string} certificateBase64 certificate content in base64 without headers
   * @returns {(trusted.pki.Certificate | undefined)} trusted.pki.Certificate or undefined if cannot create
   * @memberof CloudCSP
   */
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

export default connect((state) => ({
  settings: state.settings.cloudCSP,
}), { changeAuthURL, changeRestURL })(CloudCSP);
