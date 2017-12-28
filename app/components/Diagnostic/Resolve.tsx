import PropTypes from "prop-types";
import * as React from "react";
import {
  ERROR_CHECK_CSP_LICENSE, ERROR_CHECK_CSP_PARAMS,
  ERROR_LOAD_TRUSTED_CRYPTO, NO_CORRECT_CRYPTOARM_LICENSE, NO_CRYPTOARM_LICENSE,
  NO_GOST_2001, NO_HAVE_CERTIFICATES_WITH_KEY, NOT_INSTALLED_CSP,
} from "../../errors";
import HeaderWorkspaceBlock from "../HeaderWorkspaceBlock";

class Resolve extends React.Component<any, any> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  gotoLink = (address: string) => {
    window.electron.shell.openExternal(address);
  }

  getResolveByType = (error: string) => {
    const { localize, locale } = this.context;

    switch (error) {
      case ERROR_LOAD_TRUSTED_CRYPTO:
        return (
          <div className="resolve-content">
            <p className="help_paragraf">{localize("Problems.resolve_1_1", locale)}</p>
            <p className="help_paragraf">{localize("Problems.resolve_1_2", locale)}</p>
            <p className="help_paragraf">{localize("Problems.resolve_1_3", locale)} <a className="hlink" onClick={(event) => this.gotoLink("https://www.cryptopro.ru/")}> www.cryptopro.ru</a></p>
            <p className="help_paragraf">{localize("Problems.resolve_1_4", locale)} <a className="hlink" onClick={(event) => this.gotoLink("https://cryptoarm.ru/upload/docs/userguide-cryptoarm-gost.pdf")}>{localize("Help.link_user_guide_name", locale)}</a></p>
          </div>
        );
      case NOT_INSTALLED_CSP:
        return (
          <div className="resolve-content">
            <p className="help_paragraf">{localize("Problems.resolve_1_1", locale)} <a className="hlink" onClick={(event) => this.gotoLink("https://www.cryptopro.ru/")}> www.cryptopro.ru</a>
            </p>
          </div>
        );
      case ERROR_CHECK_CSP_LICENSE:
        return (
          <div className="resolve-content">
            <p className="help_paragraf">{localize("Problems.resolve_2_1", locale)} <a className="hlink" onClick={(event) => this.gotoLink("https://cryptoarm.ru/")}> cryptoarm.ru</a></p>
          </div>
        );
      case NO_GOST_2001:
        return (
          <div className="resolve-content">
            <p className="help_paragraf">{localize("Csp.noProvider2001", locale)}</p>
          </div>
        );
      case ERROR_CHECK_CSP_PARAMS:
        return (
          <div className="resolve-content">
            <p className="help_paragraf">{localize("Problems.problem_4", locale)}</p>
          </div>
        );
      case NO_CRYPTOARM_LICENSE:
        return (
          <div className="resolve-content">
            <p className="help_paragraf">{localize("Problems.resolve_3_1", locale)}</p>
            <p className="help_paragraf">{localize("Problems.resolve_3_2", locale)}</p>
            <p className="help_paragraf">{localize("Problems.resolve_3_3", locale)} <a className="hlink" onClick={(event) => this.gotoLink("https://cryptoarm.ru/")}> cryptoarm.ru</a></p>
            <p className="help_paragraf">{localize("Problems.resolve_3_4", locale)}</p>
          </div>
        );
      case NO_CORRECT_CRYPTOARM_LICENSE:
        return (
          <div className="resolve-content">
            <p className="help_paragraf">{localize("Problems.resolve_3_1", locale)}</p>
            <p className="help_paragraf">{localize("Problems.resolve_3_2", locale)}</p>
            <p className="help_paragraf">{localize("Problems.resolve_3_3", locale)} <a className="hlink" onClick={(event) => this.gotoLink("https://cryptoarm.ru/")}> cryptoarm.ru</a></p>
            <p className="help_paragraf">{localize("Problems.resolve_3_4", locale)}</p>
          </div>
        );

      case NO_HAVE_CERTIFICATES_WITH_KEY:
        return (
          <div className="resolve-content">
            <p className="help_paragraf">{localize("Problems.resolve_5", locale)}</p>
          </div>
        );

      default:
        return (
          <div className="resolve-content">
            <p className="help_paragraf">{localize("Problems.resolve_1_1", locale)} <a className="hlink" onClick={(event) => this.gotoLink("https://cryptoarm.ru/")}> cryptoarm.ru</a></p>
          </div>
        );
    }
  }

  getResolve() {
    const { activeError } = this.props;
    const { localize, locale } = this.context;

    return (
      <div className="content-wrapper z-depth-1">
        <HeaderWorkspaceBlock text={localize("Diagnostic.resolve_header", locale)} />
        <div className="row">
          <span className="card-infos sub">
            {this.getResolveByType(activeError)}
          </span>
        </div>
      </div>
    );
  }

  render() {
    const { certificate, handleBackView } = this.props;
    const { localize, locale } = this.context;

    return (
      <div className="problem-contaner">
        {this.getResolve()}
      </div>
    );
  }
}

export default Resolve;
