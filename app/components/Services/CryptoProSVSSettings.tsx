import PropTypes from "prop-types";
import React from "react";
import { IService } from "./types";

interface ICryptoProSVSSettingsProps {
  hostNameChange: (ev: any) => void;
  nameChange: (ev: any) => void;
  applicationNameChange: (ev: any) => void;
  service: IService;
}

class CryptoProSVSSettings extends React.PureComponent<ICryptoProSVSSettingsProps, {}> {
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
    const { applicationNameChange, nameChange, hostNameChange, service } = this.props;

    if (!service) {
      return null;
    }

    const { settings } = service;
    const applicationName = settings && settings.applicationName ? settings.applicationName : "";
    const hostName = settings && settings.hostName ? settings.hostName : "";
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
                id="hostname"
                type="text"
                className={"validate"}
                name="hostname"
                value={hostName}
                placeholder={localize("SVS.hostname", locale)}
                onChange={hostNameChange}
              />
              <label htmlFor="hostname">
                {localize("SVS.hostname", locale)}
              </label>
            </div>
          </div>
          <div className="row">
            <div className="input-field input-field-csr col s12">
              <input
                id="application_name"
                type="text"
                className={"validate"}
                name="application_name"
                value={applicationName}
                placeholder={localize("SVS.application_name", locale)}
                onChange={applicationNameChange}
              />
              <label htmlFor="application_name">
                {localize("SVS.application_name", locale)}
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CryptoProSVSSettings;
