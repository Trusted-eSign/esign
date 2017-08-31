import * as React from "react";
import ReactDOM from "react-dom";

interface IEncodingTypeSelectorProps {
  EncodingValue: string;
  handleChange: (encoding: string) => void;
}

class EncodingTypeSelector extends React.Component<IEncodingTypeSelectorProps, any> {
  static contextTypes = {
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

  constructor(props: IEncodingTypeSelectorProps) {
    super(props);
  }

  /**
   * https://github.com/facebook/react/issues/3667
   */
  componentDidMount() {
    $(document).ready(() => {
      $("select").material_select();
    });
    $(ReactDOM.findDOMNode(this.refs.select)).on("change", this.handleChange);
  }

  handleChange = (event) => {
    event.preventDefault();
    this.props.handleChange(event.target.value);
  }

  render() {
    const { localize, locale } = this.context;

    return <div className="row settings-item">
      <div className="col sign-set-encoding">{localize("Settings.encoding", locale)}</div>
      <div className="col input-field">
        <select ref="select" id="encoding" defaultValue={this.props.EncodingValue} onChange={this.handleChange}>
          <option value={localize("Settings.BASE", locale)}>{localize("Settings.BASE", locale)}</option>
          <option value={localize("Settings.DER", locale)}>{localize("Settings.DER", locale)}</option>
        </select>
      </div>
    </div>;
  }
}

export default EncodingTypeSelector;
