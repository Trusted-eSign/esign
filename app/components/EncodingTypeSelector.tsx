import * as React from "react";
import ReactDOM from "react-dom";
import { lang } from "../module/global_app";

interface IEncodingTypeSelectorProps {
  EncodingValue: string;
  handleChange: (encoding: string) => void;
}

class EncodingTypeSelector extends React.Component<IEncodingTypeSelectorProps, any> {
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
    return <div className="row settings-item">
      <div className="col sign-set-encoding">{lang.get_resource.Settings.encoding}</div>
      <div className="col input-field">
        <select ref="select" id="encoding" defaultValue={this.props.EncodingValue} onChange={this.handleChange}>
          <option value={lang.get_resource.Settings.BASE}>{lang.get_resource.Settings.BASE}</option>
          <option value={lang.get_resource.Settings.DER}>{lang.get_resource.Settings.DER}</option>
        </select>
      </div>
    </div>;
  }
}

export default EncodingTypeSelector;
