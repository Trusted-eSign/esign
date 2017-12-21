import PropTypes from "prop-types";
import * as React from "react";
import {
  ERROR_CHECK_CSP_LICENSE, ERROR_CHECK_CSP_PARAMS,
  ERROR_LOAD_TRUSTED_CRYPTO, NO_CORRECT_CRYPTOARM_LICENSE, NO_CRYPTOARM_LICENSE, NO_GOST_2001, NOT_INSTALLED_CSP
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
          <div>
            {localize("Problems.resolve_1_1", locale)}
            <a className="card-infos" onClick={(event) => this.gotoLink("https://www.cryptopro.ru/")}> www.cryptopro.ru</a>
          </div>
        );
      case NOT_INSTALLED_CSP:
        return (
          <div>
            {localize("Problems.resolve_1_1", locale)}
            <a className="card-infos" onClick={(event) => this.gotoLink("https://www.cryptopro.ru/")}> www.cryptopro.ru</a>
          </div>
        );
      case ERROR_CHECK_CSP_LICENSE:
        return (
          <div>
            {localize("Problems.problem_2", locale)}
            <a className="card-infos" onClick={(event) => this.gotoLink("https://cryptoarm.ru/")}> cryptoarm.ru</a>
          </div>
        );
      case NO_GOST_2001:
        return (
          <div>
            {localize("Csp.noProvider2001", locale)}
          </div>
        );
      case ERROR_CHECK_CSP_PARAMS:
        return (
          <div>
            {localize("Problems.problem_4", locale)}
          </div>
        );
      case NO_CRYPTOARM_LICENSE:
        return (
          <div>
            {localize("Problems.problem_3", locale)}
            <a className="card-infos" onClick={(event) => this.gotoLink("https://cryptoarm.ru/")}> cryptoarm.ru</a>
          </div>
        );
      case NO_CORRECT_CRYPTOARM_LICENSE:
        return (
          <div>
            {localize("Problems.problem_3", locale)}
            <a className="card-infos" onClick={(event) => this.gotoLink("https://cryptoarm.ru/")}> cryptoarm.ru</a>
          </div>
        );

      default:
        return (
          <div>
            {localize("Problems.resolve_1_1", locale)}
            <a className="card-infos" onClick={(event) => this.gotoLink("https://cryptoarm.ru/")}> cryptoarm.ru</a>
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
      <div>
        {this.getResolve()}
      </div>
    );
  }
}

export default Resolve;
