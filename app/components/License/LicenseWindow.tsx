import PropTypes from "prop-types";
import * as React from "react";
import LicenseInfo from "./LicenseInfo";
import LicenseInfoCSP from "./LicenseInfoCSP";
import LicenseInfoField from "./LicenseInfoField";
import LicenseSetupModal from "./LicenseSetupModal";
//import LicenseTemporaryModal from "./LicenseTemporaryModal";
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

    const settings = {
      draggable: false,
    };

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
        <LicenseSetupModal text_info={localize("License.entered_the_key", locale)} closeWindow={function () {
          $("#add-licence-key").closeModal();
        }} icon="" />
        {/* <LicenseTemporaryModal text_info={localize("License.license_request", locale)} closeWindow={function () {
          $("#licence-temporary-modal").closeModal();
        }} icon="" /> */}
      </div>
    );
  }
}

export default LicenseWindow;
