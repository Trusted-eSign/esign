import { Map } from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { changeServiceSettings } from "../../AC/servicesActions";

interface IMegafonSettingsProps {
  changeServiceSettings: (id: string, settings: {
    mobileNumber: string;
  }) => void;
  serviceId: string;
  services: Map<any, any>;
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
    const { serviceId, services } = this.props;
    const {settings} = services.getIn(["entities", serviceId]);

    const mobileNumber = settings && settings.mobileNumber ? settings.mobileNumber : "+7";

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
    const { changeServiceSettings, serviceId } = this.props;
    const { localize, locale } = this.context;

    const value = ev.target.value;
    const pattern = /^(\+7)(\d){0,10}$/g;

    if (pattern.test(value)) {
      changeServiceSettings(serviceId, { mobileNumber: value });
    } else {
      $(".toast-invalid_character").remove();
      Materialize.toast(localize("Services.invalid_character", locale), 2000, "toast-invalid_character");
    }
  }
}

export default connect((state) => ({
  services: state.services,
}), { changeServiceSettings })(MegafonSettings);
