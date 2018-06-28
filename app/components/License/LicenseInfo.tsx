import PropTypes from "prop-types";
import React from "react";
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
  lic_status: number;
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

    loadLicense();
  }

  getLocaleDate = (time: number) => {
    const { locale } = this.context;

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
    const { lic_format, lic_status } = this.props;

    const style = { height: 39 + "px" };

    let notAfter: string;
    let notBefore: string;
    let productName: string;
    let productAutor: string;
    let productIssue: string;

    if (lic_format === "NONE" || lic_format == null ) {
      notAfter = "-";
      notBefore = "-";
      productAutor = "-";
      productName = "-";
      productIssue = "-";
      return (
        <div>
          <div className="bmark_desktoplic">{localize("License.About_License", locale)}</div>
          <div className="row leftshifter">
            <div className="col s6">
              <LicenseInfoFiled title={localize("Certificate.issuer_name", locale)} info={productIssue} />
            </div>
            <div className="col s6">
              <LicenseInfoFiled title={localize("Common.subject", locale)} info={productAutor} />
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

    if (lic_format === "TRIAL") {
      const exp = new Date(license.exp * 1000);
      notAfter = (license.exp === 0) ? localize("License.lic_unlimited", locale) : this.getLocaleDate(license.exp * 1000);
      notBefore = this.getLocaleDate(license.iat * 1000);
      productName = localize("About.product_name", locale);
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
    } else if (lic_format === "MTX") {
      if (lic_status === 0) {
        notAfter = "-";
        notBefore = "-";
        productName = localize("About.product_name", locale);
      } else {
        const exp = new Date(license.exp * 1000);
        notAfter = (license.exp === 0) ? localize("License.lic_unlimited", locale) : this.getLocaleDate(license.exp * 1000);
        notBefore = this.getLocaleDate(license.iat * 1000);
        productName = localize("About.product_name", locale);
      }
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
    } else if (lic_format === "JWT") {
      if (lic_status === 0) {
        var date = new Date(license.exp * 1000);
        let year = date.getFullYear();
        if ((year === 1970) || (year >= 2037)) notAfter = localize("License.lic_unlimited", locale);
        else notAfter = this.getLocaleDate(license.exp * 1000);
        notBefore = this.getLocaleDate(license.iat * 1000);
        productName = localize("About.product_name", locale);
      } else {
        var date = new Date(license.exp * 1000);
        let year = date.getFullYear();
        if ((year === 1970) || (year >= 2037)) notAfter = localize("License.lic_unlimited", locale);
        else notAfter = this.getLocaleDate(license.exp * 1000);
        notBefore = this.getLocaleDate(license.iat * 1000);
        productName = localize("About.product_name", locale);
      }
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
    lic_format: state.license.lic_format,
    lic_status: state.license.status,
    license: state.license.info,
    loaded: state.license.loaded,
    loading: state.license.loading,

  };
}, { loadLicense }, null, { pure: false })(LicenseInfo);
