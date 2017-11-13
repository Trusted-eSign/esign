import PropTypes from "prop-types";
import * as React from "react";
import LicenseInfo from "./LicenseInfo";
import LicenseInfoField from "./LicenseInfoField";
import LicenseSetupModal from "./LicenseSetupModal";
import LicenseStatus from "./LicenseStatus";

class LicenseWindow extends React.Component<any, any> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: any) {
    super(props);
  }

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
        <div className="desktoplic_area">
          <LicenseInfo />
          <div className="row">
            <div className="col s6">
              <LicenseStatus />
            </div>
            <div className="col s2">
              <a className="waves-effect waves-light btn add-licence-modal-btn" href="#add-licence-key" {...settings}>
                {localize("License.Enter_Key", locale)}
              </a>
            </div>
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
