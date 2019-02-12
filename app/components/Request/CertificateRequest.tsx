import fs from "fs";
import noUiSlider from "nouislider";
import * as path from "path";
import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { loadAllCertificates, removeAllCertificates } from "../../AC";
import {
  ALG_RSA,
  DEFAULT_CSR_PATH, HOME_DIR, KEY_USAGE_ENCIPHERMENT, KEY_USAGE_SIGN, KEY_USAGE_SIGN_AND_ENCIPHERMENT, MY,
  PROVIDER_CRYPTOPRO, PROVIDER_MICROSOFT, PROVIDER_SYSTEM, REQUEST, REQUEST_TEMPLATE_ADDITIONAL,
  REQUEST_TEMPLATE_DEFAULT, REQUEST_TEMPLATE_KEP_FIZ, REQUEST_TEMPLATE_KEP_IP, ROOT, USER_NAME,
} from "../../constants";
import { formatDate, randomSerial, uuid, validateInn, validateOgrnip, validateSnils } from "../../utils";
import logger from "../../winstonLogger";
import HeaderTabs from "./HeaderTabs";
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
  activeSubjectNameInfoTab: boolean;
  algorithm: string;
  cn: string;
  containerName: string;
  country: string;
  email: string;
  exportableKey: boolean;
  extKeyUsage: IExtendedKeyUsage;
  formVerified: boolean;
  inn?: string;
  keyLength: number;
  keyUsage: IKeyUsage;
  keyUsageGroup: string;
  locality: string;
  ogrnip?: string;
  organization: string;
  organizationUnitName?: string;
  province: string;
  selfSigned: boolean;
  snils?: string;
  template: string;
  title?: string;
}

interface ICertificateRequestProps {
  certificateTemplate: any;
  onCancel?: () => void;
  certificateLoading: boolean;
  lic_error: number;
  licenseStatus: boolean;
  loadAllCertificates: () => void;
  removeAllCertificates: () => void;
}

class CertificateRequest extends React.Component<ICertificateRequestProps, ICertificateRequestState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: any) {
    super(props);

    const template = getTemplateByCertificate(props.certificateTemplate);

    this.state = {
      activeSubjectNameInfoTab: true,
      algorithm: ALG_RSA,
      cn: template.CN,
      containerName: uuid(),
      country: template.C,
      email: template.emailAddress,
      exportableKey: false,
      extKeyUsage: {
        "1.3.6.1.5.5.7.3.1": false,
        "1.3.6.1.5.5.7.3.2": true,
        "1.3.6.1.5.5.7.3.3": false,
        "1.3.6.1.5.5.7.3.4": true,
      },
      formVerified: false,
      inn: template.inn,
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
      locality: template.localityName,
      ogrnip: template.ogrnip,
      organization: template.O,
      organizationUnitName: template.OU,
      province: template.stateOrProvinceName,
      selfSigned: false,
      snils: template.snils,
      template: template.snils || template.ogrnip || template.inn
        || template.OU || template.title ? REQUEST_TEMPLATE_ADDITIONAL : REQUEST_TEMPLATE_DEFAULT,
      title: template.title,
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
    const { activeSubjectNameInfoTab, algorithm, cn, containerName, country, formVerified, email, exportableKey, extKeyUsage, inn, keyLength,
      keyUsage, keyUsageGroup, locality, ogrnip, organization, organizationUnitName, province, selfSigned, snils, template, title } = this.state;

    return (
      <React.Fragment>
        <div className="modal-body">
          <div className="row nobottom">
            <div className="col s12">
              <HeaderTabs activeSubjectNameInfoTab={this.handleChangeActiveTab} />
            </div>

            {activeSubjectNameInfoTab ?
              <div className="col s12 ">
                <div className="content-wrapper z-depth-1 tbody">
                  <div className="content-item-relative">
                    <div className="row halfbottom" />
                    <SubjectNameInfo
                      template={template}
                      cn={cn}
                      email={email}
                      organization={organization}
                      organizationUnitName={organizationUnitName}
                      locality={locality}
                      formVerified={formVerified}
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
              </div> :
              <div className="col s12">
                <div className="content-wrapper z-depth-1 tbody">
                  <div className="content-item-relative">
                    <div className="row halfbottom" />
                    <KeyParameters
                      algorithm={algorithm}
                      containerName={containerName}
                      exportableKey={exportableKey}
                      extKeyUsage={extKeyUsage}
                      formVerified={formVerified}
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
              </div>
            }

            <div className="row halfbottom" />

            <div className="row">
              <div className="col s7">
                <input
                  name="selfSigned"
                  className="filled-in"
                  type="checkbox"
                  id="selfSigned"
                  checked={selfSigned}
                  onChange={this.toggleSelfSigned}
                />
                <label htmlFor="selfSigned">
                  {localize("CSR.create_selfSigned", locale)}
                </label>
              </div>

              <div className="col s5">
                <div className="row">
                  <div className="col s6">
                    <a className={"waves-effect waves-light btn modal-close"} onClick={this.handelCancel}>{localize("Common.cancel", locale)}</a>
                  </div>
                  <div className="col s6">
                    <a className={"waves-effect waves-light btn"} onClick={this.handelReady}>{localize("Common.ready", locale)}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  verifyFields = () => {
    const { algorithm, cn, containerName, email, inn, locality, ogrnip, province, snils, template } = this.state;
    const REQULAR_EXPRESSION = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

    if (cn.length > 0) {
      if (template === REQUEST_TEMPLATE_KEP_FIZ) {
        if (!snils || !snils.length || !validateSnils(snils) || !province.length || !locality.length) {
          return false;
        }
      }

      if (template === REQUEST_TEMPLATE_KEP_IP) {
        if (!snils || !snils.length || !ogrnip || !ogrnip.length || !validateOgrnip(ogrnip) || !province.length || !locality.length) {
          return false;
        }
      }

      if (algorithm === ALG_RSA) {
        if (!containerName.length) {
          return false;
        }
      }

      if (template !== REQUEST_TEMPLATE_DEFAULT) {
        if (inn && inn.length && !validateInn(inn)) {
          return false;
        }
      }

      if (template === REQUEST_TEMPLATE_ADDITIONAL) {
        if (snils && snils.length && !validateSnils(snils) ||
          ogrnip && ogrnip.length && !validateOgrnip(ogrnip)
        ) {
          return false;
        }
      }

      if (email && email.length && !REQULAR_EXPRESSION.test(email)) {
        return false;
      }

      return true;
    }

    return false;
  }

  handleChangeActiveTab = (activeSubjectNameInfoTab: boolean) => {
    this.setState({ activeSubjectNameInfoTab });
  }

  handelReady = () => {
    const { localize, locale } = this.context;
    const { algorithm, cn, country, containerName, email, exportableKey, extKeyUsage, inn, keyLength,
      keyUsage, locality, ogrnip, organization, organizationUnitName, province, selfSigned, snils, title } = this.state;

    const key = new trusted.pki.Key();
    const exts = new trusted.pki.ExtensionCollection();
    const pkeyopt: string[] = [];
    const OS_TYPE = os.type();
    let providerType: string = PROVIDER_SYSTEM;
    let keyUsageStr = "critical";
    let extendedKeyUsageStr = "";
    let keyPair;
    let oid;
    let ext;

    if (!this.verifyFields()) {
      $(".toast-required_fields").remove();
      Materialize.toast(localize("CSR.fill_required_fields", locale), 2000, "toast-required_fields");

      if (!this.state.formVerified) {
        this.setState({ formVerified: true });
      }

      return;
    }

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

    try {
      switch (algorithm) {
        case ALG_RSA:
          pkeyopt.push(`rsa_keygen_bits:${keyLength}`);
          keyPair = key.generate(algorithm, pkeyopt);
          break;
        default:
          return;
      }
    } catch (e) {
      $(".toast-key_generation_error").remove();
      Materialize.toast(localize("CSR.key_generation_error", locale), 3000, "toast-key_generation_error");
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
    ];

    if (template !== REQUEST_TEMPLATE_DEFAULT ) {
      atrs.push(
        { type: "1.2.643.3.131.1.1", value: inn },
        { type: "1.2.643.100.3", value: snils },
      );
    }

    if (template === REQUEST_TEMPLATE_KEP_IP || template === REQUEST_TEMPLATE_ADDITIONAL) {
      atrs.push(
        { type: "1.2.643.100.5", value: ogrnip },
      );
    }

    certReq.subject = atrs;
    certReq.version = 0;
    certReq.publicKey = keyPair;
    certReq.extensions = exts;
    certReq.sign(keyPair);

    if (!fs.existsSync(path.join(HOME_DIR, ".Trusted", "Trusted eSign", "CSR"))) {
      fs.mkdirSync(path.join(HOME_DIR, ".Trusted", "Trusted eSign", "CSR"), { mode: 0o700 });
    }

    try {
      certReq.save(path.join(DEFAULT_CSR_PATH, `${cn}_${algorithm}_${formatDate(new Date())}.req`), trusted.DataFormat.PEM);
    } catch (e) {
      //
    }

    if (!selfSigned && algorithm === ALG_RSA) {
      keyPair.writePrivateKey(path.join(DEFAULT_CSR_PATH, `${cn}_${algorithm}_${formatDate(new Date())}.key`), trusted.DataFormat.PEM, "");
    }

    if (algorithm !== ALG_RSA) {
      if (OS_TYPE === "Windows_NT") {
        providerType = PROVIDER_MICROSOFT;
      } else {
        providerType = PROVIDER_CRYPTOPRO;
      }
    }

    if (selfSigned) {
      const cert = new trusted.pki.Certificate(certReq);
      cert.serialNumber = randomSerial();
      cert.notAfter = 60 * 60 * 24 * 365; // 365 days in sec
      cert.sign(keyPair);

      logger.log({
        certificate: cert.subjectName,
        level: "info",
        message: "",
        operation: localize("Events.cert_generation", locale),
        operationObject: {
          in: "CN=" + cert.subjectFriendlyName,
          out: "Null",
        },
        userName: USER_NAME,
      });

      if (algorithm !== ALG_RSA) {
        if (OS_TYPE === "Windows_NT") {
          providerType = PROVIDER_MICROSOFT;
        }
      }

      try {
        if (OS_TYPE === "Windows_NT") {
          window.PKISTORE.importCertificate(cert, PROVIDER_MICROSOFT, (err: Error) => {
            if (err) {
              Materialize.toast(localize("Certificate.cert_import_failed", locale), 2000, "toast-cert_import_error");
            }
          }, ROOT);

          logger.log({
            certificate: cert.subjectName,
            level: "info",
            message: "",
            operation: localize("Events.cert_import", locale),
            operationObject: {
              in: "CN=" + cert.subjectFriendlyName,
              out: "Null",
            },
            userName: USER_NAME,
          });
        }
      } catch (err) {
        logger.log({
          certificate: cert.subjectName,
          level: "error",
          message: err.message ? err.message : err,
          operation: localize("Events.cert_import", locale),
          operationObject: {
            in: "CN=" + cert.subjectFriendlyName,
            out: "Null",
          },
          userName: USER_NAME,
        });
      }

      try {
          window.PKISTORE.importCertificate(cert, PROVIDER_SYSTEM, (err: Error) => {
            if (err) {
              Materialize.toast(localize("Certificate.cert_import_failed", locale), 2000, "toast-cert_import_error");
            }
          }, MY);

          window.PKISTORE.addKeyToStore(keyPair);

        this.handleReloadCertificates();

        Materialize.toast(localize("Certificate.cert_import_ok", locale), 2000, "toast-cert_imported");

        logger.log({
          certificate: cert.subjectName,
          level: "info",
          message: "",
          operation: localize("Events.cert_import", locale),
          operationObject: {
            in: "CN=" + cert.subjectFriendlyName,
            out: "Null",
          },
          userName: USER_NAME,
        });
      } catch (err) {
        Materialize.toast(localize("Certificate.cert_import_failed", locale), 2000, "toast-cert_import_error");

        logger.log({
          certificate: cert.subjectName,
          level: "error",
          message: err.message ? err.message : err,
          operation: localize("Events.cert_import", locale),
          operationObject: {
            in: "CN=" + cert.subjectFriendlyName,
            out: "Null",
          },
          userName: USER_NAME,
        });
      }
    } else {
      const cert = new trusted.pki.Certificate(certReq);
      cert.serialNumber = randomSerial();
      cert.notAfter = 60; // 60 sec
      cert.sign(keyPair);

      window.PKISTORE.importCertificate(cert, providerType, (err: Error) => {
        if (err) {
          Materialize.toast(localize("Certificate.cert_import_failed", locale), 2000, "toast-cert_import_error");
        }
      }, REQUEST, containerName);

      logger.log({
        certificate: certReq.subject,
        level: "info",
        message: "",
        operation: "Генерация запроса на сертификат",
        operationObject: {
          in: "CN=" + cn,
          out: "Null",
        },
        userName: USER_NAME,
      });

      this.handleReloadCertificates();

      Materialize.toast(localize("CSR.create_request_created", locale), 2000, "toast-csr_created");
    }

    this.handelCancel();
  }

  handleImportCertificationRequest = (csr: trusted.pki.CertificationRequest, contName: string) => {
    const { localize, locale } = this.context;
    const { algorithm } = this.state;
    const OS_TYPE = os.type();

    let providerType: string = PROVIDER_SYSTEM;

    if (algorithm !== ALG_RSA) {
      if (OS_TYPE === "Windows_NT") {
        providerType = PROVIDER_MICROSOFT;
      }
    }

    window.PKISTORE.importCertificationRequest(csr, providerType, contName, (err: Error) => {
      if (err) {
        Materialize.toast(localize("Certificate.cert_import_failed", locale), 2000, "toast-cert_import_error");
      }
    });
  }

  handleReloadCertificates = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { certificateLoading, loadAllCertificates, removeAllCertificates } = this.props;

    removeAllCertificates();

    if (!certificateLoading) {
      loadAllCertificates();
    }
  }

  handelCancel = () => {
    const { onCancel } = this.props;

    if (onCancel) {
      onCancel();
    }
  }

  toggleSelfSigned = () => {
    this.setState({ selfSigned: !this.state.selfSigned });
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
    const { localize, locale } = this.context;
    const pattern = /^[0-9a-z-.\\\s]+$/i;

    const target = ev.target;
    const name = target.name;
    const value = ev.target.value;

    if (name === "containerName") {
      if (pattern.test(value || !value)) {
        this.setState({[name]: value});
      } else {
        $(".toast-invalid_character").remove();
        Materialize.toast(localize("Containers.invalid_character", locale), 2000, "toast-invalid_character");
      }

      return;
    }

    this.setState({[name]: value});
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

const oidsName = [
  "C",
  "CN",
  "emailAddress",
  "localityName",
  "stateOrProvinceName",
  "O",
  "OU",
  "title",
  "snils",
  "inn",
  "ogrn",
  "ogrnip",
];

const oidValues: { [index: string]: string } = {
  CN: "2.5.4.3",
  SN: "2.5.4.4",
  serialNumber: "2.5.4.5",
  // tslint:disable-next-line:object-literal-sort-keys
  C: "2.5.4.6",
  localityName: "2.5.4.7",
  stateOrProvinceName: "2.5.4.8",
  streetAddress: "2.5.4.9",
  O: "2.5.4.10",
  OU: "2.5.4.11",
  title: "2.5.4.12",
  postalCode: "2.5.4.17",
  GN: "2.5.4.42",
  initials: "2.5.4.43",
  emailAddress: "1.2.840.113549.1.9.1",
  snils: "1.2.643.100.3",
  inn: "1.2.643.3.131.1.1",
  ogrn: "1.2.643.100.1",
  ogrnip: "1.2.643.100.5",
};

const getTemplateByCertificate = (certificate: any) => {
  const template: {
    [index: string]: string,
    C: string,
    CN: string,
    emailAddress: string,
    localityName: string,
    stateOrProvinceName: string,
    O: string,
    OU: string,
    title: string,
    snils: string,
    inn: string,
    ogrn: string,
    ogrnip: string,
  } = {
    C: "",
    CN: "",
    emailAddress: "",
    localityName: "",
    stateOrProvinceName: "",
    // tslint:disable-next-line:object-literal-sort-keys
    O: "",
    OU: "",
    title: "",
    snils: "",
    inn: "",
    ogrn: "",
    ogrnip: "",
  };

  if (certificate) {
    const subjectName = certificate.subjectName + "/";

    oidsName.map((oidName: string) => {
      const oidValue = subjectName.match(`/${oidValues[oidName]}=([^\/]*)/`);
      if (oidValue) {
        template[oidName] = oidValue[1];
      }
    });
  }

  return template;
};

export default connect((state) => {
  return {
    certificateLoading: state.certificates.loading,
  };
}, { loadAllCertificates, removeAllCertificates })(CertificateRequest);
