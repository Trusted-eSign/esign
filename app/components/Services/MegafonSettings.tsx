import PropTypes from "prop-types";
import React from "react";
import PhoneInput from "react-phone-number-input";
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

    const mobileNumber = settings && settings.mobileNumber ? settings.mobileNumber : "";
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
          <div className="col s12" style={{lineHeight: "normal"}}>
            <PhoneInput
              displayInitialValueAsLocalNumber
              country="RU"
              value={mobileNumber}
              onChange={(value) => mobileNumberChange(value)}
              placeholder={localize("Services.write_mobile_number", locale)} />
          </div>
        </div>
      </div>
    );
  }
}

export default MegafonSettings;
