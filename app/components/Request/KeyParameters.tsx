import noUiSlider from "nouislider";
import PropTypes from "prop-types";
import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import { loadAllContainers, removeAllContainers } from "../../AC";
import { filteredContainersSelector } from "../../selectors";
import BlockNotElements from "../BlockNotElements";
import ContainersList from "../ContainersList";
import HeaderWorkspaceBlock from "../HeaderWorkspaceBlock";
import ProgressBars from "../ProgressBars";
import { ToolBarWithSearch } from "../ToolBarWithSearch";

interface IKeyUsage {
  cRLSign: boolean;
  dataEncipherment: boolean;
  decipherOnly: boolean;
  digitalSignature: boolean;
  encipherOnly: boolean;
  keyAgreement: boolean;
  keyEncipherment: boolean;
  keyCertSign: boolean;
  nonRepudiation: boolean;
  [key: string]: boolean;
}

interface IExtendedKeyUsage {
  "1.3.6.1.5.5.7.3.1": boolean;
  "1.3.6.1.5.5.7.3.2": boolean;
  "1.3.6.1.5.5.7.3.3": boolean;
  "1.3.6.1.5.5.7.3.4": boolean;
  [key: string]: boolean;
}

interface IKeyParametersProps {
  algorithm: string;
  containerName: string;
  extKeyUsage: IExtendedKeyUsage;
  generateNewKey: boolean;
  keyLength: number;
  keyUsage: IKeyUsage;
  handleAlgorithmChange: (ev: any) => void;
  handleGenerateNewKeyChange: (ev: any) => void;
  handleInputChange: (ev: any) => void;
  handleKeyUsageChange: (ev: any) => void;
  handleExtendedKeyUsageChange: (ev: any) => void;
}

class KeyParameters extends React.Component<IKeyParametersProps, {}> {
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

    $(document).ready(function () {
      $(".tooltipped").tooltip();
    });

    $(ReactDOM.findDOMNode(this.refs.algorithmSelect)).on("change", this.props.handleAlgorithmChange);

    Materialize.updateTextFields();

    const self = this;
    const slider = document.getElementById("key-length-slider");

    if (slider) {
      if (slider.noUiSlider) {
        slider.noUiSlider.destroy();
      }
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
        start: self.props.keyLength,
      });

      slider.noUiSlider.on("update", (values, handle) => {
        self.setState({ keyLength: values[handle] });
      });
    }
  }

  componentDidUpdate() {
    Materialize.updateTextFields();
  }

  render() {
    const { localize, locale } = this.context;
    const { algorithm, containerName, extKeyUsage, generateNewKey, keyLength, keyUsage,
      handleAlgorithmChange, handleExtendedKeyUsageChange, handleGenerateNewKeyChange, handleInputChange, handleKeyUsageChange } = this.props;

    return (
      <div className="row">
        <HeaderWorkspaceBlock text={localize("CSR.keys_params", locale)} />
        <br />
        <div className="row">
          <div className="input-field col s12">
            <select className="select" ref="algorithmSelect" value={algorithm} onChange={handleAlgorithmChange} >>
              <option value="RSA">RSA</option>
              <option value="GOST2001">{localize("Algorithm.id_GostR3410_2001", locale)}</option>
              <option value="GOST2012-256">{localize("Algorithm.id_tc26_gost3410_12_256", locale)}</option>
              <option value="GOST2012-512">{localize("Algorithm.id_tc26_gost3410_12_512", locale)}</option>
            </select>
            <label>{localize("CSR.algorithm", locale)}</label>
          </div>
        </div>
        <div className="row">
          <div className="col s12">
            <input
              name="groupKeyGeneration"
              className="with-gap" type="radio"
              id="newKey"
              checked={generateNewKey}
              onClick={handleGenerateNewKeyChange}
            />
            <label htmlFor="newKey">{localize("CSR.generate_new_key", locale)}</label>
          </div>
        </div>
        {generateNewKey ?
          <div className="row">
            <div className="input-field col s12">
              <input
                id="containerName"
                type="text"
                className="validate"
                name="containerName"
                value={containerName}
                onChange={handleInputChange}
              />
              <label htmlFor="containerName">{localize("CSR.container", locale)}</label>
            </div>
          </div>
          : null}
        {generateNewKey && algorithm === "RSA" ?
          <div className="row">
          <div className="valign-wrapper">
            <div className="col s4">
              <p className="label">{localize("CSR.key_length", locale)}</p>
            </div>
            <div className="col s5">
              <div id="key-length-slider"></div>
            </div>
            <div className="col s3">
              <div id="key-length-value">{keyLength}</div>
            </div>
            </div>
          </div>
          : null}

        <div className="row">
          <div className="col s12">
            <p className="label">
              {localize("CSR.key_usage", locale)}
            </p>
          </div>
          <div className="col s6">
            <div className="input-checkbox">
              <input
                name="dataEncipherment"
                type="checkbox"
                id="dataEncipherment"
                checked={keyUsage.dataEncipherment}
                onClick={handleKeyUsageChange}
              />
              <label htmlFor="dataEncipherment" className="truncate tooltipped" data-position="right" data-tooltip={localize("CSR.key_usage_dataEncipherment", locale)}>
                {localize("CSR.key_usage_dataEncipherment", locale)}
              </label>
            </div>
            <div className="input-checkbox">
              <input
                name="keyAgreement"
                type="checkbox"
                id="keyAgreement"
                checked={keyUsage.keyAgreement}
                onClick={handleKeyUsageChange}
              />
              <label htmlFor="keyAgreement" className="truncate tooltipped" data-position="right" data-tooltip={localize("CSR.key_usage_keyAgreement", locale)}>
                {localize("CSR.key_usage_keyAgreement", locale)}
              </label>
            </div>
            <div className="input-checkbox">
              <input
                name="keyCertSign"
                type="checkbox"
                id="keyCertSign"
                checked={keyUsage.keyCertSign}
                onClick={handleKeyUsageChange}
              />
              <label htmlFor="keyCertSign" className="truncate tooltipped" data-position="right" data-tooltip={localize("CSR.key_usage_keyCertSign", locale)}>
                {localize("CSR.key_usage_keyCertSign", locale)}
              </label>
            </div>
            <div className="input-checkbox">
              <input
                name="decipherOnly"
                type="checkbox"
                id="decipherOnly"
                checked={keyUsage.decipherOnly}
                onClick={handleKeyUsageChange}
              />
              <label htmlFor="decipherOnly" className="truncate tooltipped" data-position="right" data-tooltip={localize("CSR.key_usage_decipherOnly", locale)}>
                {localize("CSR.key_usage_decipherOnly", locale)}
              </label>
            </div>
          </div>
          <div className="col s6">
            <div className="input-checkbox">
              <input
                name="digitalSignature"
                type="checkbox"
                id="digitalSignature"
                checked={keyUsage.digitalSignature}
                onClick={handleKeyUsageChange}
              />
              <label htmlFor="digitalSignature" className="truncate tooltipped" data-position="right" data-tooltip={localize("CSR.key_usage_digitalSignature", locale)}>
                {localize("CSR.key_usage_digitalSignature", locale)}
              </label>
            </div>
            <div className="input-checkbox">
              <input
                name="nonRepudiation"
                type="checkbox"
                id="nonRepudiation"
                checked={keyUsage.nonRepudiation}
                onClick={handleKeyUsageChange}
              />
              <label htmlFor="nonRepudiation" className="truncate tooltipped" data-position="right" data-tooltip={localize("CSR.key_usage_nonRepudiation", locale)}>
                {localize("CSR.key_usage_nonRepudiation", locale)}
              </label>
            </div>
            <div className="input-checkbox">
              <input
                name="cRLSign"
                type="checkbox"
                id="cRLSign"
                checked={keyUsage.cRLSign}
                onClick={handleKeyUsageChange}
              />
              <label htmlFor="cRLSign" className="truncate tooltipped" data-position="right" data-tooltip={localize("CSR.key_usage_cRLSign", locale)}>
                {localize("CSR.key_usage_cRLSign", locale)}
              </label>
            </div>
            <div className="input-checkbox">
              <input
                name="keyEncipherment"
                type="checkbox"
                id="keyEncipherment"
                checked={keyUsage.keyEncipherment}
                onClick={handleKeyUsageChange}
              />
              <label htmlFor="keyEncipherment" className="truncate tooltipped" data-position="right" data-tooltip={localize("CSR.key_usage_keyEncipherment", locale)}>
                {localize("CSR.key_usage_keyEncipherment", locale)}
              </label>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col s12">
            <p className="label">
              {localize("CSR.extKeyUsage", locale)}
            </p>
          </div>
          <div className="col s12">
            <div className="input-checkbox">
              <input
                name="1.3.6.1.5.5.7.3.1"
                type="checkbox"
                id="1.3.6.1.5.5.7.3.1"
                checked={extKeyUsage["1.3.6.1.5.5.7.3.1"]}
                onClick={handleExtendedKeyUsageChange}
              />
              <label htmlFor="1.3.6.1.5.5.7.3.1" className="truncate tooltipped" data-position="right" data-tooltip="1.3.6.1.5.5.7.3.1">
                {localize("CSR.eku_serverAuth", locale)}
              </label>
            </div>
            <div className="input-checkbox">
              <input
                name="1.3.6.1.5.5.7.3.2"
                type="checkbox"
                id="1.3.6.1.5.5.7.3.2"
                checked={extKeyUsage["1.3.6.1.5.5.7.3.2"]}
                onClick={handleExtendedKeyUsageChange}
              />
              <label htmlFor="1.3.6.1.5.5.7.3.2" className="truncate tooltipped" data-position="right" data-tooltip="1.3.6.1.5.5.7.3.2">
                {localize("CSR.eku_clientAuth", locale)}
              </label>
            </div>
            <div className="input-checkbox">
              <input
                name="1.3.6.1.5.5.7.3.3"
                type="checkbox"
                id="1.3.6.1.5.5.7.3.3"
                checked={extKeyUsage["1.3.6.1.5.5.7.3.3"]}
                onClick={handleExtendedKeyUsageChange}
              />
              <label htmlFor="1.3.6.1.5.5.7.3.3" className="truncate tooltipped" data-position="right" data-tooltip="1.3.6.1.5.5.7.3.3">
                {localize("CSR.eku_codeSigning", locale)}
              </label>
            </div>
            <div className="input-checkbox">
              <input
                name="1.3.6.1.5.5.7.3.4"
                type="checkbox"
                id="1.3.6.1.5.5.7.3.4"
                checked={extKeyUsage["1.3.6.1.5.5.7.3.4"]}
                onClick={handleExtendedKeyUsageChange}
              />
              <label htmlFor="1.3.6.1.5.5.7.3.4" className="truncate tooltipped" data-position="right" data-tooltip="1.3.6.1.5.5.7.3.4">
                {localize("CSR.eku_emailProtection", locale)}
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default KeyParameters;
