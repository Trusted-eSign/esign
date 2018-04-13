import PropTypes from "prop-types";
import * as React from "react";
import { connect } from "react-redux";
import { loadLicense, verifyLicense } from "../../AC";
import * as jwt from "../../trusted/jwt";
import LicenseInfoField from "./LicenseInfoField";

interface IButtonWithExternalLinkProps {
  externalLink: string;
  externalName: string;
}

class ButtonWithExternalLink extends React.Component<IButtonWithExternalLinkProps, {}> {
  render() {
    const { externalName, externalLink } = this.props;
    return (
      <span>
        <a className="waves-effect waves-light btn" target="_blank" onClick={(event: any) => this.gotoLink(externalLink)}>
          {externalName}
        </a>
      </span>
    );
  }

  gotoLink = (address: string) => {
    window.electron.shell.openExternal(address);
  }
}

interface ILicenseModel {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  jti: string;
  sub: string;
}

interface ILicenseStatusProps {
  data: string;
  license: ILicenseModel;
  loaded: boolean;
  loading: boolean;
  status: number;
  lic_format: string;
  loadLicense: () => void;
  verifyLicense: (key: string) => void;
}

class LicenseStatus extends React.Component<ILicenseStatusProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: ILicenseStatusProps) {
    super(props);
  }

  componentDidMount() {
    // tslint:disable-next-line:no-shadowed-variable
    const { loadLicense, verifyLicense } = this.props;
    const { data, loaded, loading, lic_format } = this.props;
    if(lic_format == 'TRIAL'){
            loadLicense();
            verifyLicense(data);
    }else{
        //$(".licence-temporary-modal-btn").leanModal();
        if (!loaded && !loading) {
            loadLicense();
        }
         verifyLicense(data);
    }
  }

  getInfoText(): string {
    const { localize, locale } = this.context;
    const { data, license, loaded, status, lic_format } = this.props;

    const dateExp = new Date(license.exp * 1000).getTime();
    const dateNow = new Date().getTime();
    const dateDif = dateExp - dateNow;
    const fullDays = Math.round(dateDif / (24 * 3600 * 1000));
    let unlimited: boolean = (new Date(dateExp)).getFullYear() === 2038;
    if((lic_format == 'MTX') && (license.exp == 0)) unlimited = true;

    let message = '';

    if(lic_format == 'TRIAL'){
      message =  localize("License.lic_key_correct", locale) + fullDays + ")";
      return message;
    }else{
        if (loaded && !data) {
          return localize("License.jwtErrorLoad", locale);
        }

        switch (status) {
          case 0:
            message =  localize("License.lic_key_correct", locale) + fullDays + ")";
            break;

          default:
            message =  localize(jwt.getErrorMessage(status), locale);
        }

        return unlimited ? localize("License.lic_unlimited", locale) : message;
    }

  }

  getTrialText():string{
    const { localize, locale } = this.context;
    const { status, lic_format } = this.props;
    let message = '';
    if((status ==0) && (lic_format == 'TRIAL')){
      message = localize("License.License_overtimes", locale);
    }
    return message;
  }

  render() {
    const { localize, locale } = this.context;
    const { license, status, lic_format } = this.props;

    const settings = {
      draggable: false,
    };

    let style: any;
    let styleRow: any;
   
    if (status !== 0) {
      style = { color: "red" };
      styleRow = { border: "2px solid red", padding: "5px" };
      return (
        <div>
          <div className="row">
            <div className="col s6">
                <LicenseInfoField title={localize("License.lic_status", locale)} info={this.getInfoText()} style={style} styleRow={styleRow} />
            </div>
            <div className="col s6">
                <div className="row">
                  <div className="col s5">
                    <a className="waves-effect waves-light btn add-licence-modal-btn" href="#add-licence-key" {...settings}>
                      {localize("License.Enter_Key", locale)}
                    </a>
                  </div>
                  <div className="col s6">
                    <ButtonWithExternalLink externalLink={localize("License.link_buy_license", locale)} externalName={localize("License.Buy_license", locale)} />
                  </div>
                </div>
              </div>
          </div>
          {/* <div className="row">
              <div className="col s6">
                <p className="desctoplic_text">{localize("License.overtimes_license", locale)}</p>
              </div>
              <div className="col s6">
                <a className="waves-effect waves-light btn licence-temporary-modal-btn left" href="#licence-temporary-modal" {...settings}>
                  {localize("License.License_request", locale)}
                </a>
              </div>
          </div> */}
        </div>
      );
    } else {
      style = { color: "green" };
      styleRow = { border: "2px solid green", padding: "5px" };
      return (
        <div>
         <div className="row">
            <div className="col s6">
              
              <div style={styleRow}>
              <div className="desktoplic_text_item topitem" style={style}>{this.getTrialText()}</div>
              <LicenseInfoField title={localize("License.lic_status", locale)} info={this.getInfoText()} style={style}  />
              </div>
            </div>
            <div className="col s6">
                <div className="row">
                  <div className="col s5">
                    <a className="waves-effect waves-light btn add-licence-modal-btn" href="#add-licence-key" {...settings}>
                      {localize("License.Enter_Key", locale)}
                    </a>
                  </div>
                  <div className="col s6">
                    <ButtonWithExternalLink externalLink={localize("License.link_buy_license", locale)} externalName={localize("License.Buy_license", locale)} />
                  </div>
                </div>
            </div>
          </div>
        </div>
      );
    }


  }
}

export default connect((state) => {
  return {
    data: state.license.data,
    license: state.license.info,
    loaded: state.license.loaded,
    loading: state.license.loading,
    status: state.license.status,
    lic_format: state.license.lic_format,
  };
}, {loadLicense, verifyLicense}, null, {pure: false})(LicenseStatus);
