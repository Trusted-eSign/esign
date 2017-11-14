import PropTypes from "prop-types";
import * as React from "react";

class ProductInformation extends React.PureComponent {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  shouldComponentUpdate(nextProps: {}, nextState: {}, nextContext: {locale: string}) {
    return (this.context.locale !== nextContext.locale) ? true : false;
  }

  render() {
    const { localize, locale } = this.context;

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
}

export default ProductInformation;
