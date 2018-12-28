import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { loadAllCertificates } from "../../AC";
import { loadLicense } from "../../AC/licenseActions";
import {
  BUG, ERROR_CHECK_CSP_LICENSE, ERROR_CHECK_CSP_PARAMS,
  ERROR_LOAD_TRUSTED_CRYPTO,  NO_CORRECT_CRYPTOARM_LICENSE, NO_CRYPTOARM_LICENSE,
  NO_GOST_2001, NO_HAVE_CERTIFICATES_WITH_KEY, NOT_INSTALLED_CSP, WARNING,
} from "../../errors";
import { filteredCertificatesSelector } from "../../selectors";
import DiagnosticModal from "../Diagnostic/DiagnosticModal";
import Problems from "../Diagnostic/Problems";
import Resolve from "../Diagnostic/Resolve";

interface IError {
  important?: string;
  type: string;
}

interface IDiagnosticState {
  activeError: string;
  criticalError: boolean;
  errors: IError[];
}

const remote = window.electron.remote;

class Diagnostic extends React.Component<any, IDiagnosticState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: any) {
    super(props);
    this.state = ({
      activeError: "",
      criticalError: false,
      errors: [],
    });
  }

  checkCPCSP = () => {
    const { localize, locale } = this.context;

    try {
      if (!trusted.utils.Csp.isGost2001CSPAvailable()) {
        $(".toast-noProvider2001").remove();
        Materialize.toast(localize("Csp.noProvider2001", locale), 5000, "toast-noProvider2001");

        this.setState({
          errors: [...this.state.errors, {
            important: WARNING,
            type: NO_GOST_2001,
          }],
        });
        this.setState({ criticalError: false });
        return false;
      }

      if (!trusted.utils.Csp.checkCPCSPLicense()) {
        $(".toast-noCPLicense").remove();
        Materialize.toast(localize("Csp.noCPLicense", locale), 5000, "toast-noCPLicense");

        this.setState({
          errors: [...this.state.errors, {
            important: WARNING,
            type: ERROR_CHECK_CSP_LICENSE,
          }],
        });

        return false;
      }
    } catch (e) {
      $(".toast-cspErr").remove();
      Materialize.toast(localize("Csp.cspErr", locale), 2000, "toast-cspErr");

      this.setState({
        errors: [...this.state.errors, {
          type: ERROR_CHECK_CSP_PARAMS,
        }],
      });

      this.setState({ criticalError: false });

      return false;
    }

    return true;
  }

  checkTrustedCryptoLoadedErr = () => {
    if (window.tcerr) {
      if (window.tcerr.message) {
        if (~window.tcerr.message.indexOf("libcapi")) {
          this.setState({
            errors: [...this.state.errors, {
              important: BUG,
              type: NOT_INSTALLED_CSP,
            }],
          });

          this.setState({ criticalError: false });

          return false;
        }
      }

      this.setState({
        errors: [...this.state.errors, {
          important: BUG,
          type: ERROR_LOAD_TRUSTED_CRYPTO,
        }],
      });

      this.setState({ criticalError: false });

      return false;
    }

    return true;
  }

  componentWillReceiveProps(nextProps: any) {
    const { certificatesLoaded, loadingLicense } = this.props;

    if (nextProps.statusLicense === false && nextProps.lic_format === "NONE" && nextProps.verifiedLicense == true && loadingLicense === false) {
      this.setState({
        errors: [...this.state.errors, {
          important: WARNING,
          type: NO_CRYPTOARM_LICENSE,
        }],
      });
    }
    if (nextProps.lic_format === "MTX" && nextProps.statusLicense === false && nextProps.verifiedLicense == true && loadingLicense === false) {
      this.setState({
        errors: [...this.state.errors, {
          important: WARNING,
          type: NO_CORRECT_CRYPTOARM_LICENSE,
        }],
      });
    }
    if (nextProps.lic_format === "JWT" && nextProps.statusLicense === false && nextProps.verifiedLicense == true && loadingLicense === false) {
      this.setState({
        errors: [...this.state.errors, {
          important: WARNING,
          type: NO_CORRECT_CRYPTOARM_LICENSE,
        }],
      });
    }

    if (certificatesLoaded === false && nextProps.certificatesLoaded && (nextProps.certificates.length === 0)) {
      this.setState({
        errors: [...this.state.errors, {
          important: WARNING,
          type: NO_HAVE_CERTIFICATES_WITH_KEY,
        }],
      });
    }
  }

  componentDidMount() {
    const { certificatesLoading } = this.props;
    // tslint:disable-next-line:no-shadowed-variable
    const { loadAllCertificates, loadLicense } = this.props;

    if (this.checkTrustedCryptoLoadedErr()) {
      this.checkCPCSP();
    }

    loadLicense();

    if (!certificatesLoading) {
      loadAllCertificates();
    }
  }

  getCloseButton() {
    const { localize, locale } = this.context;
    const { activeError, criticalError } = this.state;

    if (!criticalError && activeError === NO_CORRECT_CRYPTOARM_LICENSE || activeError === NO_CRYPTOARM_LICENSE || activeError === ERROR_CHECK_CSP_LICENSE) {
      return (
        <Link to={"/license"} onClick={() => $("#modal-window-diagnostic").closeModal()}>
          <a className="waves-effect waves-light btn modal-close">{localize("Common.goOver", locale)}</a>
        </Link>
      );
    } else {
      return (
        <a className="waves-effect waves-light btn modal-close" onClick={this.handleMaybeCloseApp}>{localize("Diagnostic.close", locale)}</a>
      );
    }
  }

  showModalWithError = () => {
    const { localize, locale } = this.context;
    const { errors } = this.state;

    if (!errors || !errors.length) {
      return null;
    }

    const cspErrors: IError[] = [];

    for (const error of errors) {
      if (error.type === NO_GOST_2001 ||
        error.type === ERROR_CHECK_CSP_PARAMS) {
        cspErrors.push(error);
      }
    }

    if (cspErrors.length) {
      if (!this.state.activeError) {
        this.setState({ activeError: cspErrors[0].type });
      }
    } else {
      if (!this.state.activeError) {
        this.setState({ activeError: errors[0].type });
      }
    }

    return (
      <DiagnosticModal
        isOpen={true}
        header={localize("Diagnostic.header", locale)}
        onClose={this.handleMaybeCloseApp}>
        <div className="main">
          <div className="row">
            <div className={"diagnostic-content-item"}>
              <div className="col s6 m5 l6 problem-contaner">
                <Problems errors={cspErrors.length ? cspErrors : errors} activeError={this.state.activeError} onClick={this.handleClickOnError} />
              </div>
              <div className="col s6 m7 l6 problem-contaner">
                <Resolve activeError={this.state.activeError} />
              </div>

            </div>
            <div className="row">
              <div className="row halfbottom" />
              <div className="col s3 offset-s9">
                {this.getCloseButton()}
              </div>
            </div>
          </div>
        </div>
      </DiagnosticModal>
    );
  }

  handleClickOnError = (error: string) => {
    this.setState({ activeError: error });
  }

  handleMaybeCloseApp = () => {
    const { criticalError } = this.state;

    if (criticalError) {
      remote.getGlobal("sharedObject").isQuiting = true;
      remote.getCurrentWindow().close();
    }

    $("#modal-window-diagnostic").closeModal();
  }

  render() {
    return (
      <React.Fragment>
        {this.showModalWithError()}
      </React.Fragment>
    );
  }
}

export default connect((state) => {
  return {
    certificates: filteredCertificatesSelector(state, { operation: "sign" }),
    certificatesLoaded: state.certificates.loaded,
    certificatesLoading: state.certificates.loading,
    dataLicense: state.license.data,
    lic_error: state.license.lic_error,
    lic_format: state.license.lic_format,
    loadedLicense: state.license.loaded,
    loadingLicense: state.license.loading,
    statusLicense: state.license.status,
    verifiedLicense: state.license.verified,
  };
}, { loadAllCertificates, loadLicense })(Diagnostic);
