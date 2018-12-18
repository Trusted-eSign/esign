import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { changeServiceSettings } from "../../AC/servicesActions";
import { IService } from "./types";

interface IMegafonSettingsProps {
  changeServiceSettings: (id: string, settings: {
    mobileNumber: string;
  }) => void;
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
    const { service } = this.props;
    const {settings} = service;

    const mobileNumber = settings && settings.mobileNumber ? settings.mobileNumber : "7";

    return (
      <div className="row">
        <div className="row" />
        <div className="input-field input-field-csr col s12">
          <input
            id="mobileNumber"
            type="text"
            className={"validate"}
            name="mobileNumber"
            value={mobileNumber}
            placeholder={localize("Services.write_mobile_number", locale)}
            onChange={this.handleMobileNumberChange}
          />
          <label htmlFor="mobileNumber">
            {localize("Services.mobile_number", locale)}
          </label>
        </div>
      </div>
    );
  }

  handleMobileNumberChange = (ev: any) => {
    // tslint:disable-next-line:no-shadowed-variable
    const { changeServiceSettings, service } = this.props;
    changeServiceSettings(service.id, { mobileNumber: ev.target.value });
  }
}

export default connect(() => ({}), { changeServiceSettings })(MegafonSettings);
