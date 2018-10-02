import PropTypes from "prop-types";
import React from "react";

class ProductInformation extends React.Component<{}, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  shouldComponentUpdate(nextContext: {locale: string}) {
    return (this.context.locale !== nextContext.locale) ? true : false;
  }

  getCPCSPVersionPKZI = () => {
    try {
      return trusted.utils.Csp.getCPCSPVersion() + "." + trusted.utils.Csp.getCPCSPVersionPKZI();
    } catch (e) {
      return "";
    }
  }

  getCPCSPVersionSKZI = () => {
    try {
      return trusted.utils.Csp.getCPCSPVersion() + "." + trusted.utils.Csp.getCPCSPVersionSKZI() + " " + trusted.utils.Csp.getCPCSPSecurityLvl();
    } catch (e) {
      return "";
    }
  }

  render() {
    const { localize, locale } = this.context;

    return (
      <React.Fragment>
        <div className="infoapp">
          <div className="card-content white-text">
            <div className="row">
              <span className="card-title">{localize("About.product_NAME", locale)}</span>
            </div>
            <div className="row">
              <div className="contact-icon"></div>
              <h6 className="contact-text">{localize("About.about_programm", locale)}</h6>
            </div>
            <div className="row">
              <span className="card-title sub">{localize("About.developer", locale)}</span>
              <span className="card-infos sub">
                <p>{localize("About.company_name", locale)},  {localize("About.address", locale)}</p>
              </span>
              <div className="row">
                <div className="mail-block">
                  <div className="contact-icon"><i className="mail_contact_icon"></i></div>
                  <div className="h6 text-center"><a href="mailto:info@trusted.ru">{localize("About.info", locale)}</a></div>
                </div>
            </div>
            </div>
            <div className="row">
              <span className="card-title sub">{localize("About.AppVersion", locale)}</span>
              <span className="card-infos sub">
                <p>{localize("About.AppCoreVersion", locale)}  {localize("About.version", locale)}</p>
              </span>
              <span className="card-infos min">
                <p>{localize("About.Compatible", locale)}</p>
              </span>
            </div>
            <div className="row">
              <span className="card-title sub">{localize("About.CspVersion", locale)}</span>
              <span className="card-infos sub">
                <p>{localize("Csp.cpcspPKZIVersion", locale)} {this.getCPCSPVersionPKZI()}</p>
                <p>{localize("Csp.cpcspSKZIVersion", locale)} {this.getCPCSPVersionSKZI()}</p>
              </span>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default ProductInformation;
