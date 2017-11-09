import * as React from "react";
import LicenseInfo from "./LicenseInfo";
import LicenseInfoField from "./LicenseInfoField";
import LicenseSetupModal from "./LicenseSetupModal";
import LicenseStatus from "./LicenseStatus";

class LicenseWindow extends React.Component<any, any> {
  static contextTypes = {
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

  constructor(props: any) {
    super(props);
  }

  componentDidMount() {
    $(".add-licence-modal-btn").leanModal();
  }

  render() {
    const { localize, locale } = this.context;

    return (
      <div className="main">
        <div className="desktoplic_area">
          <LicenseInfo />
          <LicenseStatus />
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
