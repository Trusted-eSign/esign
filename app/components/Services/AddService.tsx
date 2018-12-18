import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { addService } from "../../AC/servicesActions";
import { MEGAFON } from "../../service/megafon/constants";

const CRYPTOPRO_DSS = "CRYPTOPRO_DSS";

interface IAddServiceState {
  serviceName: string;
  serviceType: string;
}

const initialState = {
  serviceName: "",
  serviceType: MEGAFON,
};

interface IAddServiceProps {
  addService: (name: string, type: string) => void;
  onCancel?: () => void;
}

class AddService extends React.Component<IAddServiceProps, IAddServiceState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: IAddServiceProps) {
    super(props);

    this.state = { ...initialState };
  }

  componentDidMount() {
    Materialize.updateTextFields();
  }

  componentDidUpdate() {
    Materialize.updateTextFields();
  }

  componentWillUnmount() {
    this.handelCancel();
  }

  render() {
    const { localize, locale } = this.context;
    const { serviceName } = this.state;

    return (
      <div className="add_new_service_modal">
        <div className="row halftop">
          <div className="col s12">
            <div className="content-wrapper tbody border_group" style={{
              boxshadow: "0 0 0 1px rgb(227, 227, 228)",
              height: "250px",
              overflow: "auto",
            }}>
              <div className="row">
                <div className="col s12">
                  <form action="#">
                    <p>
                      <input name="serviceType" type="radio"
                        checked={true}
                        id={MEGAFON}
                        onClick={() => this.handleChangeServiceType(MEGAFON)}
                      />
                      <label htmlFor={MEGAFON} >
                        {localize("Services.megafon", locale)}
                      </label>
                    </p>
                    <p>
                      <input name="serviceType" type="radio" id={CRYPTOPRO_DSS} disabled={true}
                        onClick={() => this.handleChangeServiceType(CRYPTOPRO_DSS)} />
                      <label htmlFor={CRYPTOPRO_DSS}>
                        {localize("Services.cryptopro_dss", locale)}
                      </label>
                    </p>
                  </form>
                </div>
              </div>
              <div className="input-field input-field-csr col s12">
                <input
                  id="serviceName"
                  type="text"
                  className={"validate"}
                  name="serviceName"
                  value={serviceName}
                  placeholder={localize("Services.write_service_name", locale)}
                  onChange={this.handleServiceNameChange}
                />
                <label htmlFor="serviceName">
                  {localize("Services.name", locale)}
                </label>
              </div>
            </div>

          </div>
        </div>

        <div className="row halfbottom" />

        <div className="row">
          <div className="col s3">
            <a className={"waves-effect waves-light btn btn_modal"} onClick={this.handleReset}>{localize("Common.reset", locale)}</a>
          </div>
          <div className="col s6 offset-s3">
            <div className="col s6">
              <a className={"waves-effect waves-light btn modal-close btn_modal"} onClick={this.handleAdd}>{localize("Common.apply", locale)}</a>
            </div>
            <div className="col s6">
              <a className={"waves-effect waves-light btn modal-close btn_modal"} onClick={this.handelCancel}>{localize("Common.close", locale)}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  handleServiceNameChange = (ev: any) => {
    this.setState({ serviceName: ev.target.value });
  }

  handleChangeServiceType = (type: string) => {
    this.setState({ serviceType: type });
  }

  handleAdd = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { addService } = this.props;
    const {serviceName, serviceType} = this.state;

    addService(serviceName, serviceType);

    this.handelCancel();
  }

  handelCancel = () => {
    const { onCancel } = this.props;

    if (onCancel) {
      onCancel();
    }
  }

  handleReset = () => {
    this.handelCancel();
  }
}

export default connect(() => ({}), { addService })(AddService);
