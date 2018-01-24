import PropTypes from "prop-types";
import * as React from "react";
import { connect } from "react-redux";
import LicenseInfoFiled from "./LicenseInfoField";


interface ILicenseInfoCSPProps {
  // loaded: boolean;
  // loading: boolean;
}

class LicenseInfoCSP extends React.Component<ILicenseInfoCSPProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  componentDidMount() {
    // tslint:disable-next-line:no-shadowed-variable
  }
 

  render() {
    const { localize, locale } = this.context;
    // const { licenseCSP } = this.props;
    let licensePresent: string = '-';
    let licenseValid: string = '-';

    return (
      <div>
        <div className="bmark_desktoplic">{localize("License.About_License_CSP", locale)}</div>
        <div className="row leftshifter">
          <div className="col s6">
            <LicenseInfoFiled title={localize("Certificate.issuer_name", locale)} info={licensePresent} />
          </div>
          <div className="col s6">
            <LicenseInfoFiled title={localize("Common.subject", locale)} info={licenseValid} />
          </div>
        </div>
      </div>
    );
  }
}

export default connect((state) => {
  return {  };
}, {}, null, {pure: false})(LicenseInfoCSP);
