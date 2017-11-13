import PropTypes from "prop-types";
import * as React from "react";

export default function ProductInformation({ children }, context) {
  const { localize, locale } = context;

  return (
    <div>
      <div className="card contact">
        <div className="card-content white-text">
          <div className="row">
            <span className="card-title">{localize("About.product_NAME", locale)}</span>
            <span className="card-infos">
              <p>{localize("About.version", locale)}</p>
            </span>
          </div>
          <div className="row">
            <span className="card-title">{localize("About.Info", locale)}</span>
          </div>
          <div className="row">
            <div className="contact-icon"></div>
            <h6 className="contact-text">{localize("About.about_programm", locale)}</h6>
          </div>
          <div className="row">
            <div className="contact-icon"><i className="mail_contact_icon"></i></div>
            <h6 className="contact-title">{localize("About.info", locale)}</h6>
          </div>
        </div>
      </div>
    </div>
  );
}

ProductInformation.contextTypes = {
  locale: PropTypes.string,
  localize: PropTypes.func,
};
