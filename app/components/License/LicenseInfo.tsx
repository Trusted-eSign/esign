import PropTypes from "prop-types";
import * as React from "react";
import { connect } from "react-redux";
import { loadLicense } from "../../AC";
import LicenseInfoFiled from "./LicenseInfoField";

interface ILicenseModel {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  jti: string;
  sub: string;
}

interface ILicenseInfoProps {
  license: ILicenseModel;
  loaded: boolean;
  loading: boolean;
  lic_format: string;
  loadLicense: () => void;
}

class LicenseInfo extends React.Component<ILicenseInfoProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  componentDidMount() {
    // tslint:disable-next-line:no-shadowed-variable
    const { loadLicense } = this.props;
    const { loaded, loading } = this.props;
    const { lic_format } = this.props;
   if(lic_format == 'TRIAL'){

   }else{
      if (!loaded && !loading) {
      loadLicense();
    }
  }
  }

  getLocaleDate = (time: number) => {
    const { localize, locale } = this.context;

    return new Date(time).toLocaleDateString(locale, {
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      month: "long",
      second: "numeric",
      year: "numeric",
    });
  }

  render() {
    const { localize, locale } = this.context;
    const { license } = this.props;
    const { lic_format } = this.props;

    const style = { height: 39 + "px" };

    let notAfter: string;
    let notBefore: string;
    let productName: string;

   
    if (!license.exp && license.exp != 0) {
      notAfter = "-";
    } else {
      const exp = new Date(license.exp * 1000);
      notAfter = ((exp.getFullYear() === 2038)||((lic_format == 'MTX') && (license.exp == 0))) ? localize("License.lic_unlimited", locale) : this.getLocaleDate(license.exp * 1000);
      if(lic_format == 'NONE') notAfter = '-';
    }

    if (!license.iat) {
      notBefore = "-";
    } else {
      notBefore = this.getLocaleDate(license.iat * 1000);
    }

    if (license.sub === "CryptoARM GOST") {
      productName = localize("About.product_name", locale);
    } else {
      productName = "-";
    }

    if(lic_format == 'TRIAL'){
      return (
        <div>
          <div className="bmark_desktoplic">{localize("License.About_License", locale)}</div>
          <div className="row leftshifter">
            <div className="col s6">
              <LicenseInfoFiled title={localize("Certificate.issuer_name", locale)} info={license.iss} />
            </div>
            <div className="col s6">
              <LicenseInfoFiled title={localize("License.lic_notbefore", locale)} info={notBefore} />
            </div>
          </div>
          <div className="row leftshifter">
            <div className="col s6">
              <LicenseInfoFiled title={localize("Common.product", locale)} info={productName} />
            </div>
            <div className="col s6">
              <LicenseInfoFiled title={localize("License.lic_notafter", locale)} info={notAfter} />
            </div>
          </div>
          <div className="row leftshifter">
          </div>
        </div>
      );
    }else if(lic_format == 'MTX'){
      return (
        <div>
          <div className="bmark_desktoplic">{localize("License.About_License", locale)}</div>
          <div className="row leftshifter">
            <div className="col s6">
              <LicenseInfoFiled title={localize("Certificate.issuer_name", locale)} info={license.iss} />
            </div>
            <div className="col s6">
              <LicenseInfoFiled title={localize("License.lic_notafter", locale)} info={notAfter} />
            </div>
          </div>
          <div className="row leftshifter">
            <div className="col s6">
              <LicenseInfoFiled title={localize("Common.product", locale)} info={productName} />
            </div>
            <div className="col s6">

            </div>
          </div>
          <div className="row leftshifter">
          </div>
        </div>
      );
    }else{
      return (
        <div>
          <div className="bmark_desktoplic">{localize("License.About_License", locale)}</div>
          <div className="row leftshifter">
            <div className="col s6">
              <LicenseInfoFiled title={localize("Certificate.issuer_name", locale)} info={license.iss} />
            </div>
            <div className="col s6">
              <LicenseInfoFiled title={localize("Common.subject", locale)} info={license.aud} />
            </div>
          </div>
          <div className="row leftshifter">
            <div className="col s6">
              <LicenseInfoFiled title={localize("Common.product", locale)} info={productName} />
            </div>
            <div className="col s6">
              <LicenseInfoFiled title={localize("License.lic_notbefore", locale)} info={notBefore} />
            </div>
          </div>
          <div className="row leftshifter">
            <div className="col s6">
              <LicenseInfoFiled title="" info="" style={style} />
            </div>
            <div className="col s6">
              <LicenseInfoFiled title={localize("License.lic_notafter", locale)} info={notAfter} />
            </div>
          </div>
        </div>
      );
    }
  }
}

export default connect((state) => {
  return {
    license: state.license.info,
    loaded: state.license.loaded,
    loading: state.license.loading,
    lic_format: state.license.lic_format,
  };
}, {loadLicense}, null, {pure: false})(LicenseInfo);
