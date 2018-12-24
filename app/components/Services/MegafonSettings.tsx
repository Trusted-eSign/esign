import { Map } from "immutable";
import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { changeServiceName, changeServiceSettings } from "../../AC/servicesActions";
import { IService } from "./types";

interface IMegafonSettingsProps {
  changeServiceName: (id: string, name: string) => void;
  changeServiceSettings: (id: string, settings: {
    mobileNumber: string;
  }) => void;
  service: IService;
  serviceId: string;
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
              onChange={this.handleNameChange}
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
              onChange={this.handleMobileNumberChange}
            />
            <label htmlFor="mobileNumber">
              {localize("Services.mobile_number", locale)}
            </label>
          </div>
        </div>
      </div>
    );
  }

  handleNameChange = (ev: any) => {
    // tslint:disable-next-line:no-shadowed-variable
    const { changeServiceName, serviceId } = this.props;

    changeServiceName(serviceId, ev.target.value);
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

interface IOwnProps {
  serviceId: string;
}

export default connect((state, ownProps: IOwnProps) => ({
  service: state.services.getIn(["entities", ownProps.serviceId]),
}), { changeServiceName, changeServiceSettings })(MegafonSettings);
