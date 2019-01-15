import PropTypes from "prop-types";
import React from "react";
import { IService } from "./types";

interface ICryptoProDssSettingsProps {
  authURLChange: (ev: any) => void;
  nameChange: (ev: any) => void;
  restURLChange: (ev: any) => void;
  service: IService;
}

class CryptoProDssSettings extends React.PureComponent<ICryptoProDssSettingsProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  componentDidMount() {
    Materialize.updateTextFields();
  }

  componentDidUpdate() {
    Materialize.updateTextFields();
  }

  render() {
    const { localize, locale } = this.context;
    const { authURLChange, nameChange, restURLChange, service } = this.props;

    if (!service) {
      return null;
    }

    const { settings } = service;
    const authURL = settings && settings.authURL ? settings.authURL : "";
    const restURL = settings && settings.restURL ? settings.restURL : "";
    const name = service.name;

    return (
      <div className="row">
        <div className="row" />
        <div className="row">
          <div className="input-field input-field-csr col s12">
            <input
              id="name"
              type="text"
              className={"validate"}
              name="name"
              value={name}
              placeholder={localize("Services.write_service_description", locale)}
              onChange={nameChange}
            />
            <label htmlFor="name">
              {localize("Services.description", locale)}
            </label>
          </div>
        </div>
        <div className="row">
          <div className="row" />
          <div className="row">
            <div className="input-field input-field-csr col s12">
              <input
                id="auth"
                type="text"
                className={"validate"}
                name="auth"
                value={authURL}
                placeholder={localize("CloudCSP.auth", locale)}
                onChange={authURLChange}
              />
              <label htmlFor="auth">
                {localize("CloudCSP.auth", locale)}
              </label>
            </div>
          </div>
          <div className="row">
            <div className="input-field input-field-csr col s12">
              <input
                id="rest"
                type="text"
                className={"validate"}
                name="rest"
                value={restURL}
                placeholder={localize("CloudCSP.rest", locale)}
                onChange={restURLChange}
              />
              <label htmlFor="rest">
                {localize("CloudCSP.rest", locale)}
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CryptoProDssSettings;
