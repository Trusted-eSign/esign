import PropTypes from "prop-types";
import React from "react";
import ReactDOM from "react-dom";
import {
  REQUEST_TEMPLATE_ADDITIONAL, REQUEST_TEMPLATE_DEFAULT, REQUEST_TEMPLATE_KEP_FIZ, REQUEST_TEMPLATE_KEP_IP,
} from "../../constants";
import { validateInn, validateOgrnip, validateSnils } from "../../utils";

const REQULAR_EXPRESSION = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

interface ISubjectNameInfoProps {
  template: string;
  cn: string;
  email: string;
  organization: string;
  organizationUnitName?: string;
  locality: string;
  province: string;
  country: string;
  formVerified: boolean;
  inn?: string;
  ogrnip?: string;
  snils?: string;
  title?: string;
  handleCountryChange: (ev: any) => void;
  handleTemplateChange: (ev: any) => void;
  handleInputChange: (ev: any) => void;
}

class CertificateRequest extends React.Component<ISubjectNameInfoProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  componentDidMount() {
    /* https://github.com/facebook/react/issues/3667
    * fix onChange for < select >
    */
    $(document).ready(() => {
      $("select").material_select();
    });

    $(ReactDOM.findDOMNode(this.refs.templateSelect)).on("change", this.props.handleTemplateChange);
    $(ReactDOM.findDOMNode(this.refs.countrySelect)).on("change", this.props.handleCountryChange);

    Materialize.updateTextFields();
  }

  render() {
    const { localize, locale } = this.context;
    const { cn, email, organization, locality, province, country, template, handleCountryChange, handleInputChange, handleTemplateChange } = this.props;

    return (
      <div className="row">
        <div className="row">
          <div className="input-field input-field-csr col s12">
            <select className="select" ref="templateSelect" value={template} name="template" onChange={handleTemplateChange} >
              <option value={REQUEST_TEMPLATE_DEFAULT}>{localize("CSR.template_default", locale)}</option>
              <option value={REQUEST_TEMPLATE_KEP_IP}>{localize("CSR.template_kep_ip", locale)}</option>
              <option value={REQUEST_TEMPLATE_KEP_FIZ}>{localize("CSR.template_kep_fiz", locale)}</option>
              <option value={REQUEST_TEMPLATE_ADDITIONAL}>{localize("CSR.template_additional_fields", locale)}</option>
            </select>
            <label>{localize("CSR.template_label", locale)}</label>
          </div>
        </div>
        <div className="row">
          <div className="input-field input-field-csr col s12">
            <input
              id="commonName"
              type="text"
              className={!this.props.formVerified ? "validate" : cn.length > 0 ? "valid" : "invalid"}
              name="cn"
              value={cn}
              onChange={handleInputChange}
              placeholder={localize("CSR.common_name", locale)}
            />
            <label htmlFor="commonName">{localize("CSR.common_name", locale)} *</label>
          </div>
        </div>
        <div className="row">
          <div className="input-field input-field-csr col s12">
            <input
              id="organizationName"
              type="text"
              className="validate"
              name="organization"
              value={organization}
              onChange={handleInputChange}
              placeholder={localize("CSR.organization_name", locale)}
            />
            <label htmlFor="organizationName">{localize("CSR.organization_name", locale)}</label>
          </div>
        </div>
        {this.getAditionalField()}
        <div className="row">
          <div className="input-field input-field-csr col s6">
            <input
              id="localityName"
              type="text"
              className={!this.props.formVerified || template === REQUEST_TEMPLATE_DEFAULT ||
                template === REQUEST_TEMPLATE_ADDITIONAL ? "validate" : locality.length > 0 ? "valid" : "invalid"}
              name="locality"
              value={locality}
              onChange={handleInputChange}
              placeholder={localize("CSR.locality_name", locale)}
            />
            <label htmlFor="localityName">
              {localize("CSR.locality_name", locale)}
              {template === REQUEST_TEMPLATE_KEP_IP || template === REQUEST_TEMPLATE_KEP_FIZ ? " *" : ""}</label>
          </div>
          <div className="input-field input-field-csr col s6">
            <input
              id="stateOrProvinceName"
              type="text"
              className={!this.props.formVerified || template === REQUEST_TEMPLATE_DEFAULT ||
                template === REQUEST_TEMPLATE_ADDITIONAL ? "validate" : province.length > 0 ? "valid" : "invalid"}
              name="province"
              value={province}
              onChange={handleInputChange}
              placeholder={localize("CSR.province_name", locale)}
            />
            <label htmlFor="stateOrProvinceName">
              {localize("CSR.province_name", locale)}
              {template === REQUEST_TEMPLATE_KEP_IP || template === REQUEST_TEMPLATE_KEP_FIZ ? " *" : ""}
            </label>
          </div>
        </div>
        <div className="row">
        <div className="input-field input-field-csr col s6">
          <input
            id="emailAddress"
            type="email"
            className={!email || !email.length ? "validate" : REQULAR_EXPRESSION.test(email) ? "valid" : "invalid"}
            name="email"
            value={email}
            onChange={handleInputChange}
            placeholder={localize("CSR.email_address", locale)}
          />
          <label htmlFor="emailAddress">{localize("CSR.email_address", locale)}</label>
        </div>
        <div className="input-field input-field-csr col s6">
          <select className="select" ref="countrySelect" value={country} onChange={handleCountryChange} >
            <option value="RU">Российская Федерация (RU)</option>
            <option value="AU">Австралия (AU)</option>
          </select>

          <label>{localize("CSR.country", locale)}</label>
        </div>
        </div>
      </div>
    );
  }

  getAditionalField = () => {
    const { template, handleInputChange, inn, ogrnip, organizationUnitName, snils, title } = this.props;
    const { localize, locale } = this.context;

    if (template === REQUEST_TEMPLATE_KEP_FIZ || template === REQUEST_TEMPLATE_KEP_IP || template === REQUEST_TEMPLATE_ADDITIONAL) {
      return (
        <React.Fragment>
          {
            template === REQUEST_TEMPLATE_KEP_IP || template === REQUEST_TEMPLATE_ADDITIONAL ?
              (
                <div className="row">
                  <div className="input-field input-field-csr col s12">
                    <input
                      id="ogrnip"
                      type="text"
                      className={!ogrnip || !ogrnip.length ? "validate" : validateOgrnip(ogrnip) ? "valid" : "invalid"}
                      name="ogrnip"
                      value={ogrnip}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="ogrnip">
                      {localize("CSR.ogrnip", locale)}
                      {template === REQUEST_TEMPLATE_KEP_IP ? " *" : ""}
                    </label>
                  </div>
                </div>) :
              null
          }
          <div className="row">
            <div className="input-field input-field-csr col s6">
              <input
                id="snils"
                type="text"
                className={!snils || !snils.length ? "validate" : validateSnils(snils) ? "valid" : "invalid"}
                name="snils"
                value={snils}
                onChange={handleInputChange}
              />
              <label htmlFor="snils">
                {localize("CSR.snils", locale)}
                {template === REQUEST_TEMPLATE_KEP_IP || template === REQUEST_TEMPLATE_KEP_FIZ ? " *" : ""}
              </label>
            </div>
            <div className="input-field input-field-csr col s6">
              <input
                id="inn"
                type="text"
                className={!inn || !inn.length ? "validate" : validateInn(inn) ? "valid" : "invalid"}
                name="inn"
                value={inn}
                onChange={handleInputChange}
              />
              <label htmlFor="inn">{localize("CSR.inn", locale)}</label>
            </div>
          </div>
          {
            template === REQUEST_TEMPLATE_ADDITIONAL ?
              <React.Fragment>
                <div className="row">
                  <div className="input-field input-field-csr col s6">
                    <input
                      id="organizationUnitName"
                      type="text"
                      className="validate"
                      name="organizationUnitName"
                      value={organizationUnitName}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="organizationUnitName">{localize("CSR.organizational_unit_name", locale)}</label>
                  </div>
                  <div className="input-field input-field-csr col s6">
                    <input
                      id="title"
                      type="text"
                      className="validate"
                      name="title"
                      value={title}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="title">{localize("CSR.title", locale)}</label>
                  </div>
                </div>
              </React.Fragment> :
              null
          }
        </React.Fragment>
      );
    }
  }
}

export default CertificateRequest;
