import noUiSlider from "nouislider";
import PropTypes from "prop-types";
import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import { ALG_GOST12_256, ALG_GOST12_512, ALG_GOST2001, ALG_RSA } from "../../constants";
import { uuid } from "../../utils";
import SelectFolder from "../SelectFolder";
import KeyParameters from "./KeyParameters";
import SubjectNameInfo from "./SubjectNameInfo";

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

interface ICertificateRequestState {
  algorithm: string;
  cn: string;
  containerName: string;
  country: string;
  email: string;
  exportableKey: boolean;
  extKeyUsage: IExtendedKeyUsage;
  inn?: string;
  keyLength: number;
  keyUsage: IKeyUsage;
  locality: string;
  organization: string;
  outputDirectory: string;
  province: string;
  snils?: string;
  template: string;
}

interface ICertificateRequestProps {
  onCancel?: () => void;
}

class CertificateRequest extends React.Component<ICertificateRequestProps, ICertificateRequestState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: any) {
    super(props);

    this.state = {
      algorithm: "RSA",
      cn: "",
      containerName: uuid(),
      country: "RU",
      email: "",
      exportableKey: false,
      extKeyUsage: {
        "1.3.6.1.5.5.7.3.1": false,
        "1.3.6.1.5.5.7.3.2": true,
        "1.3.6.1.5.5.7.3.3": false,
        "1.3.6.1.5.5.7.3.4": true,
      },
      inn: "",
      keyLength: 1024,
      keyUsage: {
        cRLSign: false,
        dataEncipherment: true,
        decipherOnly: false,
        digitalSignature: true,
        encipherOnly: false,
        keyAgreement: true,
        keyCertSign: false,
        keyEncipherment: false,
        nonRepudiation: true,
      },
      locality: "",
      organization: "",
      outputDirectory: window.HOME_DIR,
      province: "",
      snils: "",
      template: "default",
    };
  }

  componentDidMount() {
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
        start: 1024,
      });

      slider.noUiSlider.on("update", (values, handle) => {
        self.setState({ keyLength: values[handle] });
      });
    }
  }

  render() {
    const { localize, locale } = this.context;
    const { algorithm, cn, containerName, country, email, exportableKey, extKeyUsage, inn, keyLength,
      keyUsage, locality, organization, province, snils, template } = this.state;

    return (
      <div>
        <div className="modal-body overflow">
          <div className="row" />
          <div className="row">
            <div className="col s6 m6 l6 content-item-height">
              <div className="content-wrapper z-depth-1">
                <KeyParameters
                  algorithm={algorithm}
                  containerName={containerName}
                  exportableKey={exportableKey}
                  extKeyUsage={extKeyUsage}
                  keyLength={keyLength}
                  keyUsage={keyUsage}
                  handleAlgorithmChange={this.handleAlgorithmChange}
                  handleInputChange={this.handleInputChange}
                  handleKeyUsageChange={this.handleKeyUsageChange}
                  handleExtendedKeyUsageChange={this.handleExtendedKeyUsageChange}
                  toggleExportableKey={this.toggleExportableKey}
                />
              </div>
            </div>
            <div className="col s6 m6 l6 content-item-height">
              <div className="content-wrapper z-depth-1">
                <SubjectNameInfo
                  template={template}
                  cn={cn}
                  email={email}
                  organization={organization}
                  locality={locality}
                  province={province}
                  country={country}
                  inn={inn}
                  snils={snils}
                  handleCountryChange={this.handleCountryChange}
                  handleTemplateChange={this.handleTemplateChange}
                  handleInputChange={this.handleInputChange}
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col s12">
              <p className="label">
                {localize("Settings.directory_file_save", locale)}:
              </p>
            </div>
            <SelectFolder
              directory={this.state.outputDirectory}
              viewDirect={this.handleOutDirectoryChange}
              openDirect={this.addDirect} />
          </div>
          <div className="row">
            <div className="col s2 offset-s7">
              <a className={"waves-effect waves-light btn modal-close"} onClick={this.handelCancel}>{localize("Common.cancel", locale)}</a>
            </div>
            <div className="col s2">
              <a className={"waves-effect waves-light btn"} onClick={this.handelReady}>{localize("Common.ready", locale)}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  handelReady = () => {
    const { algorithm, cn, country, containerName, exportableKey, extKeyUsage, inn, keyLength,
      keyUsage, locality, organization, outputDirectory, province, snils } = this.state;

    const key = new trusted.pki.Key();
    const exts = new trusted.pki.ExtensionCollection();
    const pkeyopt: string[] = [];
    let keyUsageStr = "critical";
    let extendedKeyUsageStr = "";
    let keyPair;

    if (exportableKey) {
      pkeyopt.push("exportable:true");
    }

    if (keyUsage.cRLSign) {
      keyUsageStr += ",cRLSign";
    }

    if (keyUsage.dataEncipherment) {
      keyUsageStr += ",dataEncipherment";
    }

    if (keyUsage.decipherOnly) {
      keyUsageStr += ",decipherOnly";
    }

    if (keyUsage.digitalSignature) {
      keyUsageStr += ",digitalSignature";
    }

    if (keyUsage.encipherOnly) {
      keyUsageStr += ",encipherOnly";
    }

    if (keyUsage.keyAgreement) {
      keyUsageStr += ",keyAgreement";
    }

    if (keyUsage.keyCertSign) {
      keyUsageStr += ",keyCertSign";
    }

    if (keyUsage.keyEncipherment) {
      keyUsageStr += ",keyEncipherment";
    }

    if (keyUsage.nonRepudiation) {
      keyUsageStr += ",nonRepudiation";
    }

    if (keyUsageStr.length > "critical".length) {
      const oid = new trusted.pki.Oid("keyUsage");
      const ext = new trusted.pki.Extension(oid, keyUsageStr);
      exts.push(ext);
    }

    if (extKeyUsage["1.3.6.1.5.5.7.3.1"]) {
      extendedKeyUsageStr.length ? extendedKeyUsageStr += ",1.3.6.1.5.5.7.3.1" :  extendedKeyUsageStr += "1.3.6.1.5.5.7.3.1";
    }

    if (extKeyUsage["1.3.6.1.5.5.7.3.2"]) {
      extendedKeyUsageStr.length ? extendedKeyUsageStr += ",1.3.6.1.5.5.7.3.2" :  extendedKeyUsageStr += "1.3.6.1.5.5.7.3.2";
    }

    if (extKeyUsage["1.3.6.1.5.5.7.3.3"]) {
      extendedKeyUsageStr.length ? extendedKeyUsageStr += ",1.3.6.1.5.5.7.3.3" :  extendedKeyUsageStr += "1.3.6.1.5.5.7.3.3";
    }

    if (extKeyUsage["1.3.6.1.5.5.7.3.4"]) {
      extendedKeyUsageStr.length ? extendedKeyUsageStr += ",1.3.6.1.5.5.7.3.4" :  extendedKeyUsageStr += "1.3.6.1.5.5.7.3.4";
    }

    if (extendedKeyUsageStr.length) {
      const oid = new trusted.pki.Oid("extendedKeyUsage");
      const ext = new trusted.pki.Extension(oid, extendedKeyUsageStr);
      exts.push(ext);
    }

    switch (algorithm) {
      case ALG_RSA:
        keyPair = key.generate(algorithm, [`rsa_keygen_bits:${keyLength}`]);
        break;
      case ALG_GOST2001:
      case ALG_GOST12_256:
      case ALG_GOST12_512:
        keyPair = key.generate(algorithm, [`container:${containerName}`]);
        break;
      default:
        return;
    }

    keyPair.writePrivateKey(outputDirectory + "/privkey_s.key", trusted.DataFormat.PEM, "");
    keyPair.writePublicKey(outputDirectory + "/pubkey_s.key", trusted.DataFormat.PEM);

    const publickey = trusted.pki.Key.readPublicKey(outputDirectory + "/pubkey_s.key", trusted.DataFormat.PEM);

    const certReq = new trusted.pki.CertificationRequest();

    const atrs = [
      { type: "C", value: country },
      { type: "CN", value: cn },
      { type: "localityName", value: locality },
      { type: "stateOrProvinceName", value: province },
      { type: "O", value: organization },
      { type: "1.2.643.100.3", value: snils },
      { type: "1.2.643.3.131.1.1", value: inn },
    ];

    certReq.subject = atrs;
    certReq.version = 2;
    certReq.publicKey = publickey;
    certReq.extensions = exts;
    certReq.sign(keyPair);
    certReq.save(outputDirectory + "/generated.req", trusted.DataFormat.PEM);

    const cert = new trusted.pki.Certificate(certReq);
    cert.notAfter = 60 * 60 * 24 * 180; // 180 days in sec
    cert.sign(keyPair);

    cert.save(outputDirectory + "/generated.cer", trusted.DataFormat.PEM);
  }

  addDirect = () => {
    const dialog = window.electron.remote.dialog;
    const directory = dialog.showOpenDialog({ properties: ["openDirectory"] });

    if (directory) {
      this.setState({ outputDirectory: (directory[0]) });
    }
  }

  handleOutDirectoryChange = (ev: any) => {
    ev.preventDefault();
    this.setState({ outputDirectory: ev.target.value });
  }

  handelCancel = () => {
    const { onCancel } = this.props;

    if (onCancel) {
      onCancel();
    }
  }

  toggleExportableKey = () => {
    this.setState({ exportableKey: !this.state.exportableKey });
  }

  handleTemplateChange = (ev: any) => {
    this.setState({ template: ev.target.value });
  }

  handleAlgorithmChange = (ev: any) => {
    this.setState({ algorithm: ev.target.value });
  }

  handleInputChange = (ev: any) => {
    const target = ev.target;
    const name = target.name;

    this.setState({ [name]: ev.target.value });
  }

  handleCountryChange = (ev: any) => {
    ev.preventDefault();
    this.setState({ country: ev.target.value });
  }

  handleKeyUsageChange = (ev: any) => {
    const target = ev.target;
    const name = target.name;

    this.setState({
      keyUsage: {
        ...this.state.keyUsage,
        [name]: !this.state.keyUsage[name],
      },
    });
  }

  handleExtendedKeyUsageChange = (ev: any) => {
    const target = ev.target;
    const name = target.name;

    this.setState({
      extKeyUsage: {
        ...this.state.extKeyUsage,
        [name]: !this.state.extKeyUsage[name],
      },
    });
  }
}

export default CertificateRequest;
