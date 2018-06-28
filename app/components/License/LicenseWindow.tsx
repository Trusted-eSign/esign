import PropTypes from "prop-types";
import React from "react";
import LicenseInfo from "./LicenseInfo";
import LicenseInfoCSP from "./LicenseInfoCSP";
import LicenseSetupModal from "./LicenseSetupModal";
import LicenseStatus from "./LicenseStatus";

// tslint:disable-next-line:max-classes-per-file
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

    return (
      <div className="main">
        <div className="license_background">
          <div className="row card">
            <LicenseInfo />
            <div className="row nobottom">
                <LicenseStatus />
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
