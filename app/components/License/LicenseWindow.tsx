import PropTypes from "prop-types";
import * as React from "react";
import LicenseInfo from "./LicenseInfo";
import LicenseInfoCSP from "./LicenseInfoCSP";
import LicenseInfoField from "./LicenseInfoField";
import LicenseSetupModal from "./LicenseSetupModal";
import LicenseStatus from "./LicenseStatus";

interface IButtonWithExternalLinkProps {
  externalLink: string;
  externalName: string;
}

class ButtonWithExternalLink extends React.Component<IButtonWithExternalLinkProps, {}> {
  render() {
    const { externalName, externalLink } = this.props;
    return (
      <span>
        <a className="waves-effect waves-light btn" target="_blank" onClick={(event: any) => this.gotoLink(externalLink)}>
          {externalName}
        </a>
      </span>
    );
  }

  gotoLink = (address: string) => {
    window.electron.shell.openExternal(address);
  }
}

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
            <div className="row">
              <div className="col s6">
                <LicenseStatus />
              </div>
              <div className="col s6">
                <div className="row">
                  <div className="col s5">
                    <a className="waves-effect waves-light btn add-licence-modal-btn" href="#add-licence-key" {...settings}>
                      {localize("License.Enter_Key", locale)}
                    </a>
                  </div>
                  <div className="col s6">
                    <ButtonWithExternalLink externalLink={localize("License.link_buy_license", locale)} externalName={localize("License.Buy_license", locale)} />
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col s6">
                <p className="desctoplic_text">{localize("License.overtimes_license", locale)}</p>
              </div>
              <div className="col s6">
                <a className="waves-effect waves-light btn add-licence-modal-btn left" href="#add-licence-key" {...settings}>
                  {localize("License.License_request", locale)}
                </a>
              </div>
            </div>
            <LicenseInfoCSP />
          </div>
        </div>
        <div className="onlinelic_area">
        </div>
        <LicenseSetupModal text_info={localize("License.entered_the_key", locale)} closeWindow={function () {
          $("#add-licence-key").closeModal();
        }} icon="" />

      </div>
    );
  }
}

export default LicenseWindow;
