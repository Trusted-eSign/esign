import PropTypes from "prop-types";
import React from "react";
import { IService } from "./types";

interface IMegafonSettingsProps {
  nameChange: (ev: any) => void;
  mobileNumberChange: (ev: any) => void;
  service: IService;
}

class MegafonSettings extends React.PureComponent<IMegafonSettingsProps, {}> {
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
    const { mobileNumberChange, nameChange, service } = this.props;

    if (!service) {
      return null;
    }

    const { settings } = service;

    const mobileNumber = settings && settings.mobileNumber ? settings.mobileNumber : "+7";
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
          <div className="input-field input-field-csr col s12">
            <input
              id="mobileNumber"
              type="text"
              className={"validate"}
              name="mobileNumber"
              value={mobileNumber}
              placeholder={localize("Services.write_mobile_number", locale)}
              onChange={mobileNumberChange}
            />
            <label htmlFor="mobileNumber">
              {localize("Services.mobile_number", locale)}
            </label>
          </div>
        </div>
      </div>
    );
  }
}

export default MegafonSettings;
