import PropTypes from "prop-types";
import React from "react";

interface IPinCodeForDssContainerState {
  text: string;
}

interface IPinCodeForDssContainerProps {
  done: (text: string) => void;
  onCancel?: () => void;
  text?: string;
}

class PinCodeForDssContainer extends React.Component<IPinCodeForDssContainerProps, IPinCodeForDssContainerState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: IPinCodeForDssContainerProps) {
    super(props);

    this.state = { text: props.text ? props.text : "" };
  }

  componentDidMount() {
    Materialize.updateTextFields();
  }

  componentDidUpdate() {
    Materialize.updateTextFields();
  }

  componentWillUnmount() {
    this.handelCancel();
  }

  render() {
    const { localize, locale } = this.context;
    const { text } = this.state;

    return (
      <div style={{ height: "200px" }}>
        <div className="row halftop">
          <div className="col s12">
            <div className="content-wrapper tbody border_group" style={{
              boxshadow: "0 0 0 1px rgb(227, 227, 228)",
              height: "150px",
              overflow: "auto",
            }}>
              <div className="col s12">
                <span className="card-infos sub">
                  {localize("Services.write_pin", locale)}:
                </span>
              </div>
              <div className="input-field input-field-csr col s12">
                <input
                  id="text"
                  type="password"
                  className={"validate"}
                  name="text"
                  value={text}
                  onChange={this.handleTextChange}
                />
              </div>
            </div>

          </div>
        </div>

        <div className="row halfbottom" />

        <div className="row">
          <div className="col s6 offset-s6">
            <div className="col s6">
              <a className={"waves-effect waves-light btn modal-close btn_modal "} onClick={this.handleDone}>{localize("Common.apply", locale)}</a>
            </div>
            <div className="col s6">
              <a className={"waves-effect waves-light btn modal-close btn_modal"} onClick={this.handelCancel}>{localize("Common.close", locale)}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  handleTextChange = (ev: any) => {
    this.setState({ text: ev.target.value });
  }

  handleDone = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { done } = this.props;
    const { text } = this.state;

    done(text);

    this.handelCancel();
  }

  handelCancel = () => {
    const { onCancel } = this.props;

    if (onCancel) {
      onCancel();
    }
  }

  handleReset = () => {
    this.handelCancel();
  }
}

export default PinCodeForDssContainer;
