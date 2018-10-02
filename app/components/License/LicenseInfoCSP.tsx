import PropTypes from "prop-types";
import React from "react";
import Modal from "../Modal";
import ButtonWithExternalLink from "./ButtonWithExternalLink";
import LicenseCSPSetup from "./LicenseCSPSetup";
import LicenseInfoFiled from "./LicenseInfoField";

interface ILicenseInfoCSPState {
  showModalLicenseCSPSetup: boolean;
}

class LicenseInfoCSP extends React.Component<{}, ILicenseInfoCSPState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: {}) {
    super(props);

    this.state = ({
      showModalLicenseCSPSetup: false,
    });
  }

  shouldComponentUpdate(nextContext: { locale: string }) {
    return (this.context.locale !== nextContext.locale) ? true : false;
  }

  render() {
    const { localize, locale } = this.context;
    const license = this.getLicense();

    return (
      <React.Fragment>
        <div className="bmark_desktoplic">
          {localize("License.About_License_CSP", locale)}
        </div>
        <div className="row">
          <div className="col s4">
            <LicenseInfoFiled
              title={localize("License.serial_number", locale)}
              info={license.substring(0, license.length - 5)}
            />
          </div>
          <div className="col s2">
            <LicenseInfoFiled
              title={localize("License.lic_status", locale)}
              info={this.getLicenseStatus() ? localize("License.license_correct", locale) : localize("License.license_incorrect", locale)}
            />
          </div>
          <div className="col s3">
            <a className="waves-effect waves-light btn" onClick={this.showModalLicenseCSPSetup}>
              {localize("License.Enter_Key", locale)}
            </a>
          </div>
          <div className="col s3">
            <ButtonWithExternalLink externalLink={localize("License.link_buy_license_csp", locale)} externalName={localize("License.Buy_license", locale)} />
          </div>
        </div>
        {this.getModalLicenseCSPSetup()}
      </React.Fragment>
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
    try {
      return trusted.utils.Csp.checkCPCSPLicense();
    } catch (e) {
      return false;
    }
  }

  getModalLicenseCSPSetup = () => {
    const { localize, locale } = this.context;
    const { showModalLicenseCSPSetup } = this.state;

    if (!showModalLicenseCSPSetup) {
      return;
    }

    return (
      <Modal
        isOpen={showModalLicenseCSPSetup}
        header={localize("License.enter_key_csp", locale)}
        onClose={() => {
          this.closeModalLicenseCSPSetup();
          this.forceUpdate();
        }}
        style={{ height: "200px" }}
      >

        <LicenseCSPSetup onCancel={this.closeModalLicenseCSPSetup} />
      </Modal>
    );
  }

  showModalLicenseCSPSetup = () => {
    this.setState({ showModalLicenseCSPSetup: true });
  }

  closeModalLicenseCSPSetup = () => {
    this.setState({ showModalLicenseCSPSetup: false });
  }
}

export default LicenseInfoCSP;
