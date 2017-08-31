import * as React from "react";
import { connect } from "react-redux";
import { activeFilesSelector } from "../selectors";
import { mapToArr } from "../utils";
import HeaderWorkspaceBlock from "./HeaderWorkspaceBlock";
import SignatureStatus from "./SignatureStatus";

class SignatureInfoBlock extends React.Component<any, any> {
  static contextTypes = {
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

  constructor(props: any) {
    super(props);
  }

  render() {
    const { files, signatures } = this.props;
    const { localize, locale } = this.context;

    let elements = null;
    let file = null;

    if (files.length === 1 && signatures.length ) {
      file = files[0];

      const signs = signatures.filter((signature) => {
        return signature.fileId === file.id;
      });

      if (!signs.length) {
        return null;
      }

      elements = signs.map((signature) => {
        return <SignatureStatus key={signature.id} signed_data={signature} />;
      });
    } else {
      return null;
    }

    return (
      <div className={"col s6 m6 l6 sign-info content-item-height "}>
        <div className="file-content-height">
          <div className="content-wrapper z-depth-1">
            <HeaderWorkspaceBlock icon="arrow_back" text={localize("Sign.sign_info", locale)} second_text={file.filename} />
            <div className="sign-info-content">
              <div className={"add-cert-collection collection "}>
                {elements}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect((state) => {
  return {
    files: activeFilesSelector(state, { active: true }),
    signatures: mapToArr(state.signatures.entities),
  };
})(SignatureInfoBlock);
