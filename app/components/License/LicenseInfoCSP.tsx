import PropTypes from "prop-types";
import * as React from "react";
import LicenseInfoFiled from "./LicenseInfoField";

class LicenseInfoCSP extends React.PureComponent {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  shouldComponentUpdate(nextProps: {}, nextState: {}, nextContext: {locale: string}) {
    return (this.context.locale !== nextContext.locale) ? true : false;
  }

  render() {
    const { localize, locale } = this.context;
    const license = this.getLicense();

    return (
      <div>
        <div className="bmark_desktoplic">
          {localize("License.About_License_CSP", locale)}
        </div>
        <div className="row leftshifter">
          <div className="col s6">
            <LicenseInfoFiled
              title={localize("License.license", locale)}
              info={license.substring(0, license.length - 5)}
            />
          </div>
          <div className="col s6">
            <LicenseInfoFiled
              title={localize("License.lic_status", locale)}
              info={this.getLicenseStatus() ? localize("License.license_correct", locale) : localize("License.license_incorrect", locale)}
            />
          </div>
        </div>
      </div>
    );
  }

  getLicense = () => {
    try {
      return trusted.utils.Csp.getCPCSPLicense();
    } catch (e) {
      return "-";
    }
  }

  getLicenseStatus = () => {
    const { localize, locale } = this.context;

    try {
      return trusted.utils.Csp.checkCPCSPLicense();
    } catch (e) {
      return false;
    }
  }
}

export default LicenseInfoCSP;
