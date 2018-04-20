import noUiSlider from "nouislider";
import PropTypes from "prop-types";
import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import { loadAllCertificates, removeAllCertificates } from "../../AC";
import {
  ALG_GOST12_256, ALG_GOST12_512, ALG_GOST2001, ALG_RSA,
  KEY_USAGE_ENCIPHERMENT, KEY_USAGE_SIGN, KEY_USAGE_SIGN_AND_ENCIPHERMENT, MY,
  PROVIDER_CRYPTOPRO, PROVIDER_MICROSOFT, PROVIDER_SYSTEM, ROOT,
} from "../../constants";
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
  keyUsageGroup: string;
  locality: string;
  ogrnip?: string;
  organization: string;
  organizationUnitName?: string;
  outputDirectory: string;
  province: string;
  snils?: string;
  template: string;
  title?: string;
}

interface ICertificateRequestProps {
  onCancel?: () => void;
  certificateLoading: boolean;
  loadAllCertificates: () => void;
  removeAllCertificates: () => void;
  selfSigned?: boolean;
}

class CertificateRequest extends React.Component<ICertificateRequestProps, ICertificateRequestState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: any) {
    super(props);

    this.state = {
      algorithm: ALG_GOST12_256,
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
        keyCertSign: true,
        keyEncipherment: false,
        nonRepudiation: true,
      },
      keyUsageGroup: KEY_USAGE_SIGN_AND_ENCIPHERMENT,
      locality: "",
      ogrnip: "",
      organization: "",
      organizationUnitName: "",
      outputDirectory: window.HOME_DIR,
      province: "",
      snils: "",
      template: "default",
      title: "",
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

  componentDidUpdate() {
    const self = this;
    const slider = document.getElementById("key-length-slider");

    if (slider && !slider.noUiSlider) {
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
        start: self.state.keyLength,
      });

      slider.noUiSlider.on("update", (values, handle) => {
        self.setState({ keyLength: values[handle] });
      });
    }
  }

  componentWillUnmount() {
    this.handelCancel();
  }

  render() {
    const { localize, locale } = this.context;
    const { selfSigned } = this.props;
    const { algorithm, cn, containerName, country, email, exportableKey, extKeyUsage, inn, keyLength,
      keyUsage, keyUsageGroup, locality, ogrnip, organization, organizationUnitName, province, snils, template, title } = this.state;

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
                  keyUsageGroup={keyUsageGroup}
                  handleAlgorithmChange={this.handleAlgorithmChange}
                  handleInputChange={this.handleInputChange}
                  handleKeyUsageChange={this.handleKeyUsageChange}
                  handleKeyUsageGroupChange={this.handleKeyUsageGroupChange}
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
                  organizationUnitName={organizationUnitName}
                  locality={locality}
                  province={province}
                  country={country}
                  inn={inn}
                  ogrnip={ogrnip}
                  snils={snils}
                  title={title}
                  handleCountryChange={this.handleCountryChange}
                  handleTemplateChange={this.handleTemplateChange}
                  handleInputChange={this.handleInputChange}
                />
              </div>
            </div>
          </div>
          {
            !selfSigned ?
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
              : null
          }
          <div className="row">
            <div className="col s2 offset-s7">
              <a className={"waves-effect waves-light btn modal-close"} onClick={this.handelCancel}>{localize("Common.cancel", locale)}</a>
            </div>
            <div className="col s2">
              <a className={"waves-effect waves-light btn modal-close"} onClick={this.handelReady}>{localize("Common.ready", locale)}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  handelReady = () => {
    const { localize, locale } = this.context;
    const { selfSigned } = this.props;
    const { algorithm, cn, country, containerName, email, exportableKey, extKeyUsage, inn, keyLength,
      keyUsage, locality, ogrnip, organization, organizationUnitName, outputDirectory, province, snils, title } = this.state;

    const key = new trusted.pki.Key();
    const exts = new trusted.pki.ExtensionCollection();
    const pkeyopt: string[] = [];
    let keyUsageStr = "critical";
    let extendedKeyUsageStr = "";
    let keyPair;
    let oid;
    let ext;

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
      oid = new trusted.pki.Oid("keyUsage");
      ext = new trusted.pki.Extension(oid, keyUsageStr);
      exts.push(ext);
    }

    if (extKeyUsage["1.3.6.1.5.5.7.3.1"]) {
      extendedKeyUsageStr.length ? extendedKeyUsageStr += ",1.3.6.1.5.5.7.3.1" : extendedKeyUsageStr += "1.3.6.1.5.5.7.3.1";
    }

    if (extKeyUsage["1.3.6.1.5.5.7.3.2"]) {
      extendedKeyUsageStr.length ? extendedKeyUsageStr += ",1.3.6.1.5.5.7.3.2" : extendedKeyUsageStr += "1.3.6.1.5.5.7.3.2";
    }

    if (extKeyUsage["1.3.6.1.5.5.7.3.3"]) {
      extendedKeyUsageStr.length ? extendedKeyUsageStr += ",1.3.6.1.5.5.7.3.3" : extendedKeyUsageStr += "1.3.6.1.5.5.7.3.3";
    }

    if (extKeyUsage["1.3.6.1.5.5.7.3.4"]) {
      extendedKeyUsageStr.length ? extendedKeyUsageStr += ",1.3.6.1.5.5.7.3.4" : extendedKeyUsageStr += "1.3.6.1.5.5.7.3.4";
    }

    if (extendedKeyUsageStr.length) {
      oid = new trusted.pki.Oid("extendedKeyUsage");
      ext = new trusted.pki.Extension(oid, extendedKeyUsageStr);
      exts.push(ext);
    }

    if (email.length) {
      oid = new trusted.pki.Oid("subjectAltName");
      ext = new trusted.pki.Extension(oid, `email:${email}`);
      exts.push(ext);
    }

    oid = new trusted.pki.Oid("basicConstraints");
    ext = new trusted.pki.Extension(oid, "critical,CA:false");
    exts.push(ext);

    switch (algorithm) {
      case ALG_RSA:
        pkeyopt.push(`rsa_keygen_bits:${keyLength}`);
        keyPair = key.generate(algorithm, pkeyopt);
        break;
      case ALG_GOST2001:
      case ALG_GOST12_256:
      case ALG_GOST12_512:
        pkeyopt.push(`container:${containerName}`);
        keyPair = key.generate(algorithm, pkeyopt);
        break;
      default:
        return;
    }

    const certReq = new trusted.pki.CertificationRequest();

    const atrs = [
      { type: "C", value: country },
      { type: "CN", value: cn },
      { type: "emailAddress", value: email },
      { type: "localityName", value: locality },
      { type: "stateOrProvinceName", value: province },
      { type: "O", value: organization },
      { type: "OU", value: organizationUnitName },
      { type: "title", value: title },
      { type: "1.2.643.100.3", value: snils },
      { type: "1.2.643.3.131.1.1", value: inn },
      { type: "1.2.643.100.5", value: ogrnip },
    ];

    certReq.subject = atrs;
    certReq.version = 2;
    certReq.publicKey = keyPair;
    certReq.extensions = exts;
    certReq.sign(keyPair);
    certReq.save(outputDirectory + "/generated.req", trusted.DataFormat.PEM);

    if (!selfSigned && algorithm === ALG_RSA) {
      keyPair.writePrivateKey(outputDirectory + "/generated.key", trusted.DataFormat.PEM, "");
    }

    if (selfSigned) {
      const cert = new trusted.pki.Certificate(certReq);
      cert.notAfter = 60 * 60 * 24 * 180; // 180 days in sec
      cert.sign(keyPair);

      try {
        this.handleCertificateImport(cert);

        if (algorithm !== ALG_RSA) {
          const cont = trusted.utils.Csp.getContainerNameByCertificate(cert);
          trusted.utils.Csp.installCertifiacteToContainer(cert, cont, 75);
          trusted.utils.Csp.installCertifiacteFromContainer(cont, 75, "Crypto-Pro GOST R 34.10-2001 Cryptographic Service Provider");
        } else {
          window.PKISTORE.addKeyToStore(keyPair);
        }

        this.handleReloadCertificates();

        Materialize.toast(localize("Certificate.cert_import_ok", locale), 2000, "toast-cert_imported");
      } catch (e) {
        Materialize.toast(localize("Certificate.cert_import_failed", locale), 2000, "toast-cert_import_error");
      }
    } else {
      Materialize.toast(localize("CSR.create_request_created", locale), 2000, "toast-csr_created");
    }

    this.handelCancel();
  }

  handleCertificateImport = (certificate: trusted.pki.Certificate) => {
    const { localize, locale } = this.context;
    const { algorithm } = this.state;
    const OS_TYPE = os.type();

    let providerType: string = PROVIDER_SYSTEM;

    if (algorithm !== ALG_RSA) {
      if (OS_TYPE === "Windows_NT") {
        providerType = PROVIDER_MICROSOFT;
      } else {
        providerType = PROVIDER_CRYPTOPRO;
      }
    }

    window.PKISTORE.importCertificate(certificate, providerType, (err: Error) => {
      if (err) {
        Materialize.toast(localize("Certificate.cert_import_failed", locale), 2000, "toast-cert_import_error");
      }
    }, MY);

    try {
      if (OS_TYPE === "Windows_NT") {
        window.PKISTORE.importCertificate(certificate, PROVIDER_MICROSOFT, (err: Error) => {
          if (err) {
            Materialize.toast(localize("Certificate.cert_import_failed", locale), 2000, "toast-cert_import_error");
          }
        }, ROOT);
      }
    } catch (e) {
      // e
    }
  }

  handleReloadCertificates = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { certificateLoading, loadAllCertificates, removeAllCertificates } = this.props;

    removeAllCertificates();

    if (!certificateLoading) {
      loadAllCertificates();
    }
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

  handleKeyUsageGroupChange = (ev: any) => {
    const group = ev.target.value;
    this.setState({ keyUsageGroup: group });

    switch (group) {
      case KEY_USAGE_SIGN:
        this.setState({
          keyUsage: {
            cRLSign: false,
            dataEncipherment: false,
            decipherOnly: false,
            digitalSignature: true,
            encipherOnly: false,
            keyAgreement: false,
            keyCertSign: true,
            keyEncipherment: false,
            nonRepudiation: true,
          },
        });
        break;

      case KEY_USAGE_ENCIPHERMENT:
        this.setState({
          keyUsage: {
            cRLSign: false,
            dataEncipherment: true,
            decipherOnly: false,
            digitalSignature: false,
            encipherOnly: false,
            keyAgreement: true,
            keyCertSign: true,
            keyEncipherment: false,
            nonRepudiation: false,
          },
        });
        break;

      case KEY_USAGE_SIGN_AND_ENCIPHERMENT:
        this.setState({
          keyUsage: {
            cRLSign: false,
            dataEncipherment: true,
            decipherOnly: false,
            digitalSignature: true,
            encipherOnly: false,
            keyAgreement: true,
            keyCertSign: true,
            keyEncipherment: false,
            nonRepudiation: true,
          },
        });
        break;

      default:
        return;
    }
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

export default connect((state) => {
  return {
    certificateLoading: state.certificates.loading,
  };
}, { loadAllCertificates, removeAllCertificates })(CertificateRequest);
