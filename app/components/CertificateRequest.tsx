import PropTypes from "prop-types";
import React from "react";
import ReactDOM from "react-dom";

class CertificateRequest extends React.Component<{}, any> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: any) {
    super(props);

    this.state = {
      cn: "",
      country: "RU",
      email: "",
      inn: "",
      locality: "",
      organization: "",
      province: "",
      snils: "",
      template: "default",
    };
  }

  componentDidMount() {
    const self = this;
    $(document).ready(function() {
      $("select").material_select();
    });

    /* https://github.com/facebook/react/issues/3667
    * fix onChange for < select >
    */
    $(document).ready(function() {
      $("select").material_select();
    });

    $(ReactDOM.findDOMNode(this.refs.templateSelect)).on("change", this.handleTemplateChange);
  }

  render() {
    const { localize, locale } = this.context;

    return (
      <div>
        <div className="cert-window-content">
          <div className="col s6 m6 l6 content-item-height">
            <div className="cert-content-item">
              <div className="content-wrapper z-depth-1">
                <br />
                <div className="row">
                  <div className="input-field col s12">
                    <select className="select" ref="templateSelect" value={this.state.template} name="template" onChange={this.handleTemplateChange} >
                      <option value="default">{localize("CSR.template_default", locale)}</option>
                      <option value="kepIp">{localize("CSR.template_kep_ip", locale)}</option>
                      <option value="kepFiz">{localize("CSR.template_kep_fiz", locale)}</option>
                      <option value="additional">{localize("CSR.template_additional_fields", locale)}</option>
                    </select>
                    <label>{localize("CSR.template_label", locale)}</label>
                  </div>
                </div>
                {this.getAditionalField()}
                <div className="row">
                  <div className="input-field col s12">
                    <input
                      id="commonName"
                      type="text"
                      className="validate"
                      name="cn"
                      value={this.state.cn}
                      onChange={this.handleInputChange}
                    />
                    <label htmlFor="commonName">{localize("CSR.common_name", locale)}</label>
                  </div>
                </div>
                <div className="row">
                  <div className="input-field col s12">
                    <input
                      id="emailAddress"
                      type="email"
                      className="validate"
                      name="email"
                      value={this.state.email}
                      onChange={this.handleInputChange}
                    />
                    <label htmlFor="emailAddress">{localize("CSR.email_address", locale)}</label>
                  </div>
                </div>
                <div className="row">
                  <div className="input-field col s12">
                    <input
                      id="organizationName"
                      type="text"
                      className="validate"
                      name="organization"
                      value={this.state.organization}
                      onChange={this.handleInputChange}
                    />
                    <label htmlFor="organizationName">{localize("CSR.organization_name", locale)}</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col s6 m6 l6 content-item-height">
            <div className={"file-content-height active"}>
              <div className="content-wrapper z-depth-1">
                <br />
                <div className="row">
                  <div className="input-field col s12">
                    <input
                      id="localityName"
                      type="text"
                      className="validate"
                      name="locality"
                      value={this.state.locality}
                      onChange={this.handleInputChange}
                    />
                    <label htmlFor="localityName">{localize("CSR.locality_name", locale)}</label>
                  </div>
                </div>
                <div className="row">
                  <div className="input-field col s12">
                    <input
                      id="stateOrProvinceName"
                      type="text"
                      className="validate"
                      name="province"
                      value={this.state.province}
                      onChange={this.handleInputChange}
                    />
                    <label htmlFor="stateOrProvinceName">{localize("CSR.province_name", locale)}</label>
                  </div>
                </div>
                <br />
                <div className="row">
                  <div className="input-field col s12">
                    <select className="select" value={this.state.country} onChange={this.handleCountryChange} >>
                      <option value="RU">Российская Федерация (RU)</option>
                      <option value="AU">Австралия (AU)</option>
                    </select>
                    <label>{localize("CSR.country", locale)}</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  getAditionalField = () => {
    const { template } = this.state;
    const { localize, locale } = this.context;

    if (template === "kepFiz") {
      return (
        <div>
          <div className="row">
            <div className="input-field col s12">
              <input
                id="snils"
                type="text"
                className="validate"
                name="snils"
                value={this.state.snils}
                onChange={this.handleInputChange}
              />
              <label htmlFor="snils">{localize("CSR.snils", locale)}</label>
            </div>
          </div>
          <div className="row">
            <div className="input-field col s12">
              <input
                id="inn"
                type="text"
                className="validate"
                name="inn"
                value={this.state.inn}
                onChange={this.handleInputChange}
              />
              <label htmlFor="snils">{localize("CSR.inn", locale)}</label>
            </div>
          </div>
        </div>
      );
    }
  }

  handleTemplateChange = (ev: any) => {
    this.setState({ template: ev.target.value });
  }

  handleInputChange = (ev: any) => {
    const target = ev.target;
    const name = target.name;

    this.setState({ [name]: ev.target.value });
  }

  handleCountryChange = (ev: any) => {
    this.setState({ country: ev.target.value });
  }
}

export default CertificateRequest;
