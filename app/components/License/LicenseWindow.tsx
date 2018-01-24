import PropTypes from "prop-types";
import * as React from "react";
import LicenseInfo from "./LicenseInfo";
import LicenseInfoCSP from "./LicenseInfoCSP";
import LicenseInfoField from "./LicenseInfoField";
import LicenseSetupModal from "./LicenseSetupModal";
import LicenseStatus from "./LicenseStatus";

class LicenseWindow extends React.Component<{}, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  componentDidMount() {
    $(".add-licence-modal-btn").leanModal();
  }

  render() {
    const { localize, locale } = this.context;

    const settings = {
      draggable: false,
    };

    return (
      <div className="main">
        <div className="license_background">
          <div className="row card">
          <LicenseInfo />
          <div className="row">
            <div className="col s6">
              <LicenseStatus />
            </div>
            <div className="col s2">
              <a className="waves-effect waves-light btn add-licence-modal-btn" href="#add-licence-key" {...settings}>
                {localize("License.Enter_Key", locale)}
              </a>
              <p></p>
              <a className="waves-effect waves-light btn add-licence-modal-btn" href="#add-licence-key" {...settings}>
                {localize("License.License_request", locale)}
              </a>
            </div>
          </div>
          <LicenseInfoCSP />
          </div>
        </div>
        <div className="onlinelic_area">
        </div>
        <LicenseSetupModal text_info={localize("License.entered_the_key", locale)} closeWindow={function() {
          $("#add-licence-key").closeModal();
        }} icon="" />
       
      </div>
    );
  }
}

export default LicenseWindow;
