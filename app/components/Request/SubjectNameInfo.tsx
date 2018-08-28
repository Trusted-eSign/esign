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
              {/* <option value={REQUEST_TEMPLATE_KEP_IP}>{localize("CSR.template_kep_ip", locale)}</option>
              <option value={REQUEST_TEMPLATE_KEP_FIZ}>{localize("CSR.template_kep_fiz", locale)}</option>
              <option value={REQUEST_TEMPLATE_ADDITIONAL}>{localize("CSR.template_additional_fields", locale)}</option> */}
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
            <option value="AB">{localize("CSR.AB", locale)}</option>
            <option value="AU">{localize("CSR.AU", locale)}</option>     
            <option value="AT">{localize("CSR.AT", locale)}</option>
            <option value="AZ">{localize("CSR.AZ", locale)}</option>
            <option value="AL">{localize("CSR.AL", locale)}</option>
            <option value="DZ">{localize("CSR.DZ", locale)}</option>
            <option value="AS">{localize("CSR.AS", locale)}</option>
            <option value="AI">{localize("CSR.AI", locale)}</option>
            <option value="AO">{localize("CSR.AO", locale)}</option>
            <option value="AD">{localize("CSR.AD", locale)}</option>
            <option value="AQ">{localize("CSR.AQ", locale)}</option>
            <option value="AG">{localize("CSR.AG", locale)}</option>
            <option value="AR">{localize("CSR.AR", locale)}</option>
            <option value="AM">{localize("CSR.AM", locale)}</option>
            <option value="AW">{localize("CSR.AW", locale)}</option>
            <option value="AF">{localize("CSR.AF", locale)}</option>
            <option value="BS">{localize("CSR.BS", locale)}</option>
            <option value="BD">{localize("CSR.BD", locale)}</option>
            <option value="BB">{localize("CSR.BB", locale)}</option>
            <option value="BH">{localize("CSR.BH", locale)}</option>
            <option value="BY">{localize("CSR.BY", locale)}</option>
            <option value="BZ">{localize("CSR.BZ", locale)}</option>
            <option value="BE">{localize("CSR.BE", locale)}</option>
            <option value="BJ">{localize("CSR.BJ", locale)}</option>
            <option value="BM">{localize("CSR.BM", locale)}</option>
            <option value="BG">{localize("CSR.BG", locale)}</option>
            <option value="BO">{localize("CSR.BO", locale)}</option>
            <option value="BQ">{localize("CSR.BQ", locale)}</option>
            <option value="BA">{localize("CSR.BA", locale)}</option>
            <option value="BW">{localize("CSR.BW", locale)}</option>
            <option value="BR">{localize("CSR.BR", locale)}</option>
            <option value="IO">{localize("CSR.IO", locale)}</option>
            <option value="BN">{localize("CSR.BN", locale)}</option>
            <option value="BF">{localize("CSR.BF", locale)}</option>
            <option value="BI">{localize("CSR.BI", locale)}</option>
            <option value="BT">{localize("CSR.BT", locale)}</option>
            <option value="VU">{localize("CSR.VU", locale)}</option>
            <option value="HU">{localize("CSR.HU", locale)}</option>
            <option value="VE">{localize("CSR.VE", locale)}</option>
            <option value="VG">{localize("CSR.VG", locale)}</option>
            <option value="VI">{localize("CSR.VI", locale)}</option>
            <option value="VN">{localize("CSR.VN", locale)}</option>
            <option value="GA">{localize("CSR.GA", locale)}</option>
            <option value="HT">{localize("CSR.HT", locale)}</option>
            <option value="GY">{localize("CSR.GY", locale)}</option>
            <option value="GM">{localize("CSR.GM", locale)}</option>
            <option value="GH">{localize("CSR.GH", locale)}</option>
            <option value="GP">{localize("CSR.GP", locale)}</option>
            <option value="GT">{localize("CSR.GT", locale)}</option>
            <option value="GN">{localize("CSR.GN", locale)}</option>
            <option value="GW">{localize("CSR.GW", locale)}</option>
            <option value="DE">{localize("CSR.DE", locale)}</option>
            <option value="GG">{localize("CSR.GG", locale)}</option>
            <option value="GI">{localize("CSR.GI", locale)}</option>
            <option value="HN">{localize("CSR.HN", locale)}</option>
            <option value="HK">{localize("CSR.HK", locale)}</option>
            <option value="GD">{localize("CSR.GD", locale)}</option>
            <option value="GL">{localize("CSR.GL", locale)}</option>
            <option value="GR">{localize("CSR.GR", locale)}</option>
            <option value="GE">{localize("CSR.GE", locale)}</option>
            <option value="GU">{localize("CSR.GU", locale)}</option>
            <option value="DK">{localize("CSR.DK", locale)}</option>
            <option value="JE">{localize("CSR.JE", locale)}</option>
            <option value="DJ">{localize("CSR.DJ", locale)}</option>
            <option value="DM">{localize("CSR.DM", locale)}</option>
            <option value="DO">{localize("CSR.DO", locale)}</option>
            <option value="EG">{localize("CSR.EG", locale)}</option>
            <option value="ZM">{localize("CSR.ZM", locale)}</option>
            <option value="EH">{localize("CSR.EH", locale)}</option>
            <option value="ZW">{localize("CSR.ZW", locale)}</option>
            <option value="IL">{localize("CSR.IL", locale)}</option>
            <option value="IN">{localize("CSR.IN", locale)}</option>
            <option value="ID">{localize("CSR.ID", locale)}</option>
            <option value="JO">{localize("CSR.JO", locale)}</option>
            <option value="IQ">{localize("CSR.IQ", locale)}</option>
            <option value="IR">{localize("CSR.IR", locale)}</option>
            <option value="IE">{localize("CSR.IE", locale)}</option>
            <option value="IS">{localize("CSR.IS", locale)}</option>
            <option value="ES">{localize("CSR.ES", locale)}</option>
            <option value="IT">{localize("CSR.IT", locale)}</option>
            <option value="YE">{localize("CSR.YE", locale)}</option>
            <option value="CV">{localize("CSR.CV", locale)}</option>
            <option value="KZ">{localize("CSR.KZ", locale)}</option>
            <option value="KH">{localize("CSR.KH", locale)}</option>
            <option value="CM">{localize("CSR.CM", locale)}</option>
            <option value="CA">{localize("CSR.CA", locale)}</option>
            <option value="QA">{localize("CSR.QA", locale)}</option>
            <option value="KE">{localize("CSR.KE", locale)}</option>
            <option value="CY">{localize("CSR.CY", locale)}</option>
            <option value="KZ">{localize("CSR.KZ", locale)}</option>
            <option value="KI">{localize("CSR.KI", locale)}</option>
            <option value="CN">{localize("CSR.CN", locale)}</option>
            <option value="CC">{localize("CSR.CC", locale)}</option>
            <option value="CO">{localize("CSR.CO", locale)}</option>
            <option value="KM">{localize("CSR.KM", locale)}</option>
            <option value="CG">{localize("CSR.CG", locale)}</option>
            <option value="CD">{localize("CSR.CD", locale)}</option>
            <option value="KP">{localize("CSR.KP", locale)}</option>
            <option value="KR">{localize("CSR.KR", locale)}</option>
            <option value="CR">{localize("CSR.CR", locale)}</option>
            <option value="CI">{localize("CSR.CI", locale)}</option>
            <option value="CU">{localize("CSR.CU", locale)}</option>
            <option value="KW">{localize("CSR.KW", locale)}</option>
            <option value="CW">{localize("CSR.CW", locale)}</option>
            <option value="LA">{localize("CSR.LA", locale)}</option>
            <option value="LV">{localize("CSR.LV", locale)}</option>
            <option value="LS">{localize("CSR.LS", locale)}</option>
            <option value="LB">{localize("CSR.LB", locale)}</option>
            <option value="LY">{localize("CSR.LY", locale)}</option>
            <option value="LR">{localize("CSR.LR", locale)}</option>
            <option value="LI">{localize("CSR.LI", locale)}</option>
            <option value="LT">{localize("CSR.LT", locale)}</option>
            <option value="LU">{localize("CSR.LU", locale)}</option>
            <option value="MU">{localize("CSR.MU", locale)}</option>
            <option value="MR">{localize("CSR.MR", locale)}</option>
            <option value="MG">{localize("CSR.MG", locale)}</option>
            <option value="YT">{localize("CSR.YT", locale)}</option>
            <option value="MO">{localize("CSR.MO", locale)}</option>
            <option value="MW">{localize("CSR.MW", locale)}</option>
            <option value="MY">{localize("CSR.MY", locale)}</option>
            <option value="ML">{localize("CSR.ML", locale)}</option>           
            <option value="UM">{localize("CSR.UM", locale)}</option>
            <option value="MV">{localize("CSR.MV", locale)}</option>
            <option value="MT">{localize("CSR.MT", locale)}</option>
            <option value="MA">{localize("CSR.MA", locale)}</option>
            <option value="MQ">{localize("CSR.MQ", locale)}</option>
            <option value="MH">{localize("CSR.MH", locale)}</option>
            <option value="MX">{localize("CSR.MX", locale)}</option>
            <option value="FM">{localize("CSR.FM", locale)}</option>
            <option value="MZ">{localize("CSR.MZ", locale)}</option>
            <option value="MD">{localize("CSR.MD", locale)}</option>
            <option value="MC">{localize("CSR.MC", locale)}</option>
            <option value="MN">{localize("CSR.MN", locale)}</option>
            <option value="MS">{localize("CSR.MS", locale)}</option>
            <option value="MM">{localize("CSR.MM", locale)}</option>
            <option value="NA">{localize("CSR.NA", locale)}</option>
            <option value="NR">{localize("CSR.NR", locale)}</option>
            <option value="NP">{localize("CSR.NP", locale)}</option>
            <option value="NE">{localize("CSR.NE", locale)}</option>
            <option value="NG">{localize("CSR.NG", locale)}</option>
            <option value="NL">{localize("CSR.NL", locale)}</option>            
            <option value="NI">{localize("CSR.NI", locale)}</option>
            <option value="NU">{localize("CSR.NU", locale)}</option>
            <option value="NZ">{localize("CSR.NZ", locale)}</option>
            <option value="NC">{localize("CSR.NC", locale)}</option> 
            <option value="NO">{localize("CSR.NO", locale)}</option>
            <option value="AE">{localize("CSR.AE", locale)}</option>
            <option value="OM">{localize("CSR.OM", locale)}</option>
            <option value="BV">{localize("CSR.BV", locale)}</option>
            <option value="IM">{localize("CSR.IM", locale)}</option>
            <option value="NF">{localize("CSR.NF", locale)}</option>
            <option value="CX">{localize("CSR.CX", locale)}</option>  
            <option value="NM">{localize("CSR.NM", locale)}</option>
            <option value="KY">{localize("CSR.KY", locale)}</option>
            <option value="CK">{localize("CSR.CK", locale)}</option>
            <option value="TC">{localize("CSR.TC", locale)}</option>
            <option value="PK">{localize("CSR.PK", locale)}</option>
            <option value="PW">{localize("CSR.PW", locale)}</option>
            <option value="PS">{localize("CSR.PS", locale)}</option>
            <option value="PA">{localize("CSR.PA", locale)}</option>  
            <option value="VA">{localize("CSR.VA", locale)}</option>
            <option value="PG">{localize("CSR.PG", locale)}</option>
            <option value="PY">{localize("CSR.PY", locale)}</option>
            <option value="PE">{localize("CSR.PE", locale)}</option>
            <option value="PN">{localize("CSR.PN", locale)}</option>
            <option value="PL">{localize("CSR.PL", locale)}</option>
            <option value="PT">{localize("CSR.PT", locale)}</option>
            <option value="PR">{localize("CSR.PR", locale)}</option>
            <option value="MK">{localize("CSR.MK", locale)}</option>
            <option value="RE">{localize("CSR.RE", locale)}</option>
            <option value="RU">{localize("CSR.RU", locale)}</option>
            <option value="RW">{localize("CSR.RW", locale)}</option>
            <option value="RO">{localize("CSR.RO", locale)}</option>
            <option value="WS">{localize("CSR.WS", locale)}</option>
            <option value="SM">{localize("CSR.SM", locale)}</option>
            <option value="ST">{localize("CSR.ST", locale)}</option>
            <option value="SA">{localize("CSR.SA", locale)}</option>
            <option value="SZ">{localize("CSR.WS", locale)}</option>
            <option value="SH">{localize("CSR.SH", locale)}</option>
            <option value="MP">{localize("CSR.MP", locale)}</option>
            <option value="BL">{localize("CSR.BL", locale)}</option>
            <option value="MF">{localize("CSR.MF", locale)}</option>
            <option value="SN">{localize("CSR.SN", locale)}</option>
            <option value="VC">{localize("CSR.VC", locale)}</option>
            <option value="KN">{localize("CSR.KN", locale)}</option>
            <option value="LC">{localize("CSR.LC", locale)}</option>
            <option value="PM">{localize("CSR.PM", locale)}</option>
            <option value="RS">{localize("CSR.RS", locale)}</option>
            <option value="SC">{localize("CSR.SC", locale)}</option>
            <option value="SG">{localize("CSR.SG", locale)}</option>
            <option value="SX">{localize("CSR.SX", locale)}</option>
            <option value="SY">{localize("CSR.SY", locale)}</option>
            <option value="SK">{localize("CSR.SK", locale)}</option>
            <option value="SI">{localize("CSR.SI", locale)}</option>
            <option value="GB">{localize("CSR.GB", locale)}</option>
            <option value="US">{localize("CSR.US", locale)}</option>
            <option value="SB">{localize("CSR.SB", locale)}</option>
            <option value="SO">{localize("CSR.SO", locale)}</option>
            <option value="SD">{localize("CSR.SD", locale)}</option>
            <option value="SR">{localize("CSR.SR", locale)}</option>
            <option value="SL">{localize("CSR.SL", locale)}</option>
            <option value="TJ">{localize("CSR.TJ", locale)}</option>
            <option value="TH">{localize("CSR.TH", locale)}</option>
            <option value="TW">{localize("CSR.TW", locale)}</option>
            <option value="TZ">{localize("CSR.TZ", locale)}</option>
            <option value="TL">{localize("CSR.TL", locale)}</option>
            <option value="TG">{localize("CSR.TG", locale)}</option>
            <option value="TK">{localize("CSR.TK", locale)}</option>
            <option value="TO">{localize("CSR.TO", locale)}</option>
            <option value="TT">{localize("CSR.TT", locale)}</option>
            <option value="TV">{localize("CSR.TV", locale)}</option>
            <option value="TN">{localize("CSR.TN", locale)}</option>
            <option value="TM">{localize("CSR.TM", locale)}</option>
            <option value="TR">{localize("CSR.TR", locale)}</option>
            <option value="UG">{localize("CSR.UG", locale)}</option>
            <option value="UZ">{localize("CSR.UZ", locale)}</option>
            <option value="UA">{localize("CSR.UA", locale)}</option>
            <option value="WF">{localize("CSR.WF", locale)}</option>
            <option value="UY">{localize("CSR.UY", locale)}</option>
            <option value="FO">{localize("CSR.FO", locale)}</option>
            <option value="FJ">{localize("CSR.FJ", locale)}</option>
            <option value="PH">{localize("CSR.PH", locale)}</option>
            <option value="FI">{localize("CSR.FI", locale)}</option>
            <option value="FK">{localize("CSR.FK", locale)}</option>
            <option value="FR">{localize("CSR.FR", locale)}</option>
            <option value="GF">{localize("CSR.GF", locale)}</option>
            <option value="PF">{localize("CSR.PF", locale)}</option>
            <option value="TF">{localize("CSR.TF", locale)}</option>
            <option value="HR">{localize("CSR.HR", locale)}</option>
            <option value="CF">{localize("CSR.CF", locale)}</option>
            <option value="TD">{localize("CSR.TD", locale)}</option>
            <option value="ME">{localize("CSR.ME", locale)}</option>
            <option value="CZ">{localize("CSR.CZ", locale)}</option>
            <option value="CL">{localize("CSR.CL", locale)}</option>
            <option value="CH">{localize("CSR.CH", locale)}</option>
            <option value="SE">{localize("CSR.SE", locale)}</option>
            <option value="SJ">{localize("CSR.SJ", locale)}</option>
            <option value="LK">{localize("CSR.LK", locale)}</option>
            <option value="EC">{localize("CSR.EC", locale)}</option>
            <option value="GQ">{localize("CSR.GQ", locale)}</option>
            <option value="AX">{localize("CSR.AX", locale)}</option>
            <option value="SV">{localize("CSR.SV", locale)}</option>
            <option value="ER">{localize("CSR.ER", locale)}</option>
            <option value="EE">{localize("CSR.EE", locale)}</option>
            <option value="ET">{localize("CSR.ET", locale)}</option>
            <option value="ZA">{localize("CSR.ZA", locale)}</option>
            <option value="GS">{localize("CSR.GS", locale)}</option>
            <option value="OS">{localize("CSR.OS", locale)}</option>
            <option value="SS">{localize("CSR.SS", locale)}</option>
            <option value="JM">{localize("CSR.JM", locale)}</option>
            <option value="JP">{localize("CSR.JP", locale)}</option>
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
        <div>
          {
            template === REQUEST_TEMPLATE_KEP_IP || template === REQUEST_TEMPLATE_ADDITIONAL ?
              (
                <div className="row">
                  <div className="input-field input-field-csr col s12">
                    <input
                      id="ogrnip"
                      type="text"
                      className={!this.props.formVerified || template === REQUEST_TEMPLATE_ADDITIONAL ?
                        "validate" : ogrnip && ogrnip.length > 0 && validateOgrnip(ogrnip) ? "valid" : "invalid"}
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
                className={!this.props.formVerified || template === REQUEST_TEMPLATE_ADDITIONAL ?
                  "validate" : snils && snils.length > 0 && validateSnils(snils) ? "valid" : "invalid"}
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
              <div>
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
              </div> :
              null
          }
        </div>
      );
    }
  }
}

export default CertificateRequest;
