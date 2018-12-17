import PropTypes from "prop-types";
import React from "react";
import { IService } from "./types";

interface IMegafonSettingsState {
  mobileNumber: string;
}

const initialState = {
  mobileNumber: "+7",
};

class MegafonSettings extends React.PureComponent<{}, IMegafonSettingsState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: {}) {
    super(props);

    this.state = { ...initialState };
  }

  componentDidMount() {
    Materialize.updateTextFields();
  }

  componentDidUpdate() {
    Materialize.updateTextFields();
  }

  render() {
    const { localize, locale } = this.context;
    const { mobileNumber } = this.state;

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
    this.setState({ mobileNumber: ev.target.value });
  }
}

export default MegafonSettings;
