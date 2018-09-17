import PropTypes from "prop-types";
import React from "react";
import ReactDOM from "react-dom";

interface IEncodingTypeSelectorProps {
  EncodingValue: string;
  handleChange: (encoding: string) => void;
}

class EncodingTypeSelector extends React.Component<IEncodingTypeSelectorProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  /**
   * https://github.com/facebook/react/issues/3667
   */
  componentDidMount() {
    const self = this;
    $(document).ready(() => {
      $("select").material_select();
      $("select").on("change", function() {
        self.changeEncoding($(this)[0].value);
      });
    });
    $(ReactDOM.findDOMNode(this.refs.select)).on("change", this.handleChange);
  }

  changeEncoding = (encoding: string) => {
    this.props.handleChange(encoding);
  }

  render() {
    const { localize, locale } = this.context;

    return (
      <div className="row settings-item nobottom">
        <div className="col sign-set-encoding">{localize("Settings.encoding", locale)}</div>
        <div className="col input-field">
          <select id="encoding" defaultValue={this.props.EncodingValue}>
            <option value={localize("Settings.BASE", locale)}>{localize("Settings.BASE", locale)}</option>
            <option value={localize("Settings.DER", locale)}>{localize("Settings.DER", locale)}</option>
          </select>
        </div>
      </div>
    );
  }
}

export default EncodingTypeSelector;
