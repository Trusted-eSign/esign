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
  dataEncipherment: boolean;
  digitalSignature: boolean;
  keyAgreement: boolean;
  nonRepudiation: boolean;
}

interface IKeyParametersProps {
  algorithm: string;
  containerName: string;
  generateNewKey: boolean;
  keyLength: number;
  keyUsage: IKeyUsage;
  handleAlgorithmChange: (ev: any) => void;
  handleGenerateNewKeyChange: (ev: any) => void;
  handleInputChange: (ev: any) => void;
  handleKeyUsageChange: (ev: any) => void;
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

    $(document).ready(function(){
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
    const { algorithm, containerName, generateNewKey, keyLength, keyUsage,
      handleAlgorithmChange, handleGenerateNewKeyChange, handleInputChange, handleKeyUsageChange } = this.props;

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
            <div className="col s12">
              <p className="label">{localize("CSR.key_length", locale)}</p>
            </div>
            <div className="col s9">
              <div id="key-length-slider"></div>
            </div>
            <div className="col s3">
              <div id="key-length-value">{keyLength}</div>
            </div>
          </div>
          : null}

        <div className="row">
          <div className="col s12">
            <p className="label">Использование ключа</p>
          </div>
          <div className="col s6">
            <div className="input-field">
              <input
                name="dataEncipherment"
                type="checkbox"
                id="dataEncipherment"
                checked={keyUsage.dataEncipherment}
                onClick={handleKeyUsageChange}
              />
              <label htmlFor="dataEncipherment">Шифрование</label>
            </div>
            <div className="input-field">
              <input
                name="keyAgreement"
                type="checkbox"
                id="keyAgreement"
                checked={keyUsage.keyAgreement}
                onClick={handleKeyUsageChange}
              />
              <label htmlFor="keyAgreement">Согласование</label>
            </div>
          </div>
          <div className="col s6">
            <div className="input-field">
              <input
                name="digitalSignature"
                type="checkbox"
                id="digitalSignature"
                checked={keyUsage.digitalSignature}
                onClick={handleKeyUsageChange}
              />
              <label htmlFor="digitalSignature">Подпись</label>
            </div>
            <div className="input-field">
              <input
                name="nonRepudiation"
                type="checkbox"
                id="nonRepudiation"
                checked={keyUsage.nonRepudiation}
                onClick={handleKeyUsageChange}
              />
              <label htmlFor="nonRepudiation" className="label tooltipped" data-position="right" data-tooltip="Неотрекаемость">
                Неотрекаемость
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default KeyParameters;
