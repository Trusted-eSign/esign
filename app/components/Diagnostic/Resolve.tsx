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

  getResolveMessageByType = (error: string): string => {
    switch (error) {
      case ERROR_LOAD_TRUSTED_CRYPTO:
        return "Problems.problem_1";
      case NOT_INSTALLED_CSP:
        return "Problems.problem_1";
      case ERROR_CHECK_CSP_LICENSE:
        return "Problems.problem_2";
      case NO_GOST_2001:
        return "Csp.noProvider2001";
      case ERROR_CHECK_CSP_PARAMS:
        return "Csp.cspErr";
      case NO_CRYPTOARM_LICENSE:
        return "Problems.problem_3";
      case NO_CORRECT_CRYPTOARM_LICENSE:
        return "Problems.problem_3";

      default:
        return "License.jwtErrorCode";
    }
  }

  getResolve() {
    const { activeError } = this.props;
    const { localize, locale } = this.context;

    if (!activeError) {
      return null;
    }

    return (
      <div className="content-wrapper z-depth-1">
        <HeaderWorkspaceBlock text={localize("Diagnostic.resolve_header", locale)} />
        <div className="row">
          <span className="card-infos sub">
            <p>{localize(this.getResolveMessageByType(activeError), locale)}</p>
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
