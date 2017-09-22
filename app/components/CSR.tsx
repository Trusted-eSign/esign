import * as noUiSlider from "nouislider";
import * as React from "react";
import ReactDOM from "react-dom";

class CSR extends React.Component<any, any> {
  static contextTypes = {
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

  constructor(props: any) {
    super(props);

    this.state = {
      cn: "",
      country: "RU",
      csp: "openssl",
      email: "",
      generateNewKey: false,
      keyLength: "1024",
      locality: "",
      organization: "",
      province: "",
      template: "default",
    };
  }

  componentDidMount() {
    const self = this;
    $(document).ready(function () {
      $("select").material_select();
    });

    const slider = document.getElementById("key-length-slider");
    if (slider) {
      noUiSlider.create(slider, {
        format: wNumb({
          decimals: 0,
        }),
        range: {
          "min": 512,
          "25%": 1024,
          "50%": 2048,
          "75%": 3072,
          "max": 4096,
        },
        snap: true,
        start: 1024,
      });

      slider.noUiSlider.on("update", (values, handle) => {
        self.setState({ keyLength: values[handle] });
      });
    }

    /* https://github.com/facebook/react/issues/3667
    * fix onChange for < select >
    */
    $(document).ready(function () {
      $("select").material_select();
    });

    $(ReactDOM.findDOMNode(this.refs.countrySelect)).on("change", this.handleCountryChange);
    $(ReactDOM.findDOMNode(this.refs.cspSelect)).on("change", this.handleCSPChange);
    $(ReactDOM.findDOMNode(this.refs.templateSelect)).on("change", this.handleTemplateChange);
  }

  handleInitDatePicker = () => {
    $(".datepicker").pickadate({
      selectMonths: false, // Creates a dropdown to control month
      selectYears: 5, // Creates a dropdown of 15 years to control year,
      today: "Today",
      clear: "Clear",
      close: "Ok",
      closeOnSelect: false, // Close upon selecting a date,
      min: true, // Using `true` for “today”
    });
  }

  handleTemplateChange = (ev) => {
    this.setState({ template: ev.target.value });
  }

  handleCSPChange = (ev) => {
    this.setState({ csp: ev.target.value });
  }

  handleCountryChange = (ev) => {
    this.setState({ country: ev.target.value });
  }

  handleInputChange = (ev) => {
    const target = ev.target;
    const name = target.name;

    this.setState({ [name]: ev.target.value });
  }

  handleGenerateNewKeyChange = () => {
    this.setState({ generateNewKey: !this.state.generateNewKey });
  }

  render() {
    const { localize, locale } = this.context;

    return (
      <div className="csr-window__workspace">
        <div className="row">
          <form className="col s12">
            <div className="col s12 m6">
              <div className="row">
                <div className="input-field col s12">
                  <select value={this.state.template} name="template" onChange={this.handleTemplateChange} ref="templateSelect">
                    <option value="default">{localize("CSR.template_default", locale)}</option>
                    <option value="kepIp">{localize("CSR.template_kep_ip", locale)}</option>
                    <option value="kepFiz">{localize("CSR.template_kep_fiz", locale)}</option>
                    <option value="additional">{localize("CSR.template_additional_fields", locale)}</option>
                  </select>
                  <label>{localize("CSR.template_label", locale)}</label>
                </div>
              </div>
              <div className="row">
                <div className="input-field col s12">
                  <select value={this.state.csp} name="csp" onChange={this.handleCSPChange} ref="cspSelect">
                    <option value="openssl">{localize("CSR.csp_openssl", locale)}</option>
                    <option value="microsoftBase">{localize("CSR.csp_microsoft_base", locale)}</option>
                  </select>
                  <label>{localize("CSR.csp_label", locale)}</label>
                </div>
              </div>
              <div className="row">
                <div className="input-field col s12">
                  <input id="validTo" type="text" className="datepicker" onClick={this.handleInitDatePicker} />
                  <label htmlFor="validTo">{localize("CSR.not_after", locale)}</label>
                </div>
              </div>
              <div className="row">
                <div className="input-field col s12">
                  <div>
                    <input
                      name="groupKeyGeneration"
                      className="with-gap" type="radio"
                      id="newKey"
                      checked={this.state.generateNewKey}
                      onClick={this.handleGenerateNewKeyChange}
                    />
                    <label htmlFor="newKey">{localize("CSR.generate_new_key", locale)}</label>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="row">
                  <p>{localize("CSR.key_length", locale)}</p>
                </div>
                <div className="row">
                  <div className="col s9">
                    <div id="key-length-slider"></div>
                  </div>
                  <div className="col s3">
                    <div id="key-length-value">{this.state.keyLength}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col s12 m6">
              <div className="row">
                <div className="input-field col s12">
                  <select value={this.state.country} onChange={this.handleCountryChange} ref="countrySelect">>
                    <option value="RU">Российская Федерация (RU)</option>
                    <option value="AU">Австралия (AU)</option>
                  </select>
                  <label>{localize("CSR.country", locale)}</label>
                </div>
              </div>
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
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default CSR;
