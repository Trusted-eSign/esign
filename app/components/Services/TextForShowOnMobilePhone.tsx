import PropTypes from "prop-types";
import React from "react";

interface ITextForShowOnMobilePhoneState {
  text: string;
}

const initialState = {
  text: "",
};

interface ITextForShowOnMobilePhoneProps {
  done: (text: string) => void;
  onCancel?: () => void;
}

class TextForShowOnMobilePhone extends React.Component<ITextForShowOnMobilePhoneProps, ITextForShowOnMobilePhoneState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: ITextForShowOnMobilePhoneProps) {
    super(props);

    this.state = { ...initialState };
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

    let disabled = "";

    if (!text || !text.length) {
      disabled = "disabled";
    }

    return (
      <div style={{height: "200px"}}>
        <div className="row halftop">
          <div className="col s12">
            <div className="content-wrapper tbody border_group" style={{
              boxshadow: "0 0 0 1px rgb(227, 227, 228)",
              height: "150px",
              overflow: "auto",
            }}>
              <div className="row" />
              <div className="input-field input-field-csr col s12">
                <input
                  id="text"
                  type="text"
                  className={"validate"}
                  name="text"
                  value={text}
                  placeholder={localize("Services.write_text", locale)}
                  onChange={this.handleTextChange}
                />
                <label htmlFor="text">
                  {localize("Services.text", locale)}
                </label>
              </div>
            </div>

          </div>
        </div>

        <div className="row halfbottom" />

        <div className="row">
          <div className="col s6 offset-s6">
            <div className="col s6">
              <a className={"waves-effect waves-light btn modal-close btn_modal " + disabled} onClick={this.handleDone}>{localize("Common.apply", locale)}</a>
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

    done(Buffer.from(text, "utf8").toString("base64"));

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

export default TextForShowOnMobilePhone;
