import PropTypes from "prop-types";
import * as React from "react";
import HeaderWorkspaceBlock from "../HeaderWorkspaceBlock";

class Resolve extends React.Component<any, any> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: any) {
    super(props);
    this.state = ({
      certForInfo: props.certificate,
    });
  }

  handleClick = (certificate: any) => {
    this.setState({ certForInfo: certificate });
  }

  getResolve() {
    const { certForInfo } = this.state;
    const { localize, locale } = this.context;

    return (
      <div className="content-wrapper z-depth-1">
        <HeaderWorkspaceBlock text={localize("Diagnostic.resolve_header", locale)} />
        <div className="add-problems">
          <div className="add-problems-item">
            {/* <CertificateInfo certificate={certForInfo} /> */}
          </div>
        </div>;
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
