import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { verifySignature } from "../../AC/documentsActions";
import { mapToArr } from "../../utils";

interface IDocumentSignatureStatusProps {
  documentId: number;
  signatures: any;
}

class DocumentSignatureStatus extends React.Component<IDocumentSignatureStatusProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  componentDidMount() {
    const { documentId, signatures } = this.props;

    $(".tooltipped").tooltip("remove");
    $(".tooltipped").tooltip({ delay: 50 });

    const signs = signatures.getIn(["entities", documentId]);

    if (!signs) {
      this.props.verifySignature(documentId);
      return;
    }
  }

  componentDidUpdate() {
    $(".tooltipped").tooltip("remove");
    $(".tooltipped").tooltip({ delay: 50 });
  }

  componentWillUnmount() {
    $(".tooltipped").tooltip("remove");
  }

  getCircleBody() {
    const { localize, locale } = this.context;
    const { documentId, signatures } = this.props;

    let statusIcon = "status_default";
    let toolTipText = "";
    let res = true;

    const signs = signatures.getIn(["entities", documentId]);

    if (signs) {
      const arrSigns = mapToArr(signs);

      for (const element of arrSigns) {
        if (!element.status_verify) {
          res = false;
          break;
        }
      }
    } else {
      return null;
    }

    res ? statusIcon = "status_ok" : statusIcon = "status_error";

    const classStatus = statusIcon + " tooltipped";

    if (statusIcon === "status_ok") {
      toolTipText = localize("Sign.sign_ok", locale);
    } else {
      toolTipText = localize("Sign.sign_error", locale);
    }

    return (
      <a className={classStatus} data-position="left" data-delay="50"
        data-tooltip={toolTipText} style={{right: "120px"}}>
      </a>
    );
  }

  render() {
    return (
      <div>

      </div>
    );
  }
}

export default connect((state) => {
  return {
    signatures: state.signatures,
  };
}, { verifySignature })(DocumentSignatureStatus);
