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


  Resolvers = {
    problem_1: function() {
      //Решение проблемы отсутствия КриптоПро CSP
      const { localize, locale } = this.context;
      return (
        <div>

        </div>
      );
    },

    problem_2: function() {
      //Решение проблемы отсутствия лицензии на КриптоПро CSP
      const { localize, locale } = this.context;
      return (
        <div>

        </div>
      );
    },

    problem_3: function() {
      //Решение проблемы отсутствия лицензии на приложение
      const { localize, locale } = this.context;
      return (
        <div>

        </div>
      );
    },

    problem_4: function() {
      //Решение проблемы отсутствия сертификатов
      const { localize, locale } = this.context;
      return (
        <div>

        </div>
      );
    }
  }

  getResolve() {
    const { certForInfo } = this.state;
    const { localize, locale } = this.context;

    return (
      <div className="content-wrapper z-depth-1">
        <HeaderWorkspaceBlock text={localize("Diagnostic.resolve_header", locale)} />
        <div className="add-problems">
          <div className="add-problems-item">
            {this.Resolvers[0]}
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
