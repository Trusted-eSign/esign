import PropTypes from "prop-types";
import * as React from "react";

interface IFeedbackFormState {
  email: {
    text: string,
    error: string,
  };
  message: {
    text: string,
    error: string,
  };
  username: {
    text: string,
    error: string,
  };
}

class FeedbackForm extends React.Component<{}, IFeedbackFormState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: {}) {
    super(props);
    this.state = ({
      email: { text: "", error: "" },
      message: { text: "", error: "" },
      username: { text: "", error: "" },
    });
  }

  cleanState = () => {
    this.setState(
      {
        email: { text: "", error: "" },
        message: { text: "", error: "" },
        username: { text: "", error: "" },
      });
  }

  send = () => {
    const { localize, locale } = this.context;
    const self = this;

    $.ajax({
      data: {
        email: this.state.email.text,
        message: this.state.message.text,
        username: this.state.username.text,
      },
      method: "POST",
      url: "https://net.trusted.ru/trustedapp/app/feedback",
      success(): void {
        self.cleanState();

        $(".toast-message_send").remove();
        Materialize.toast(localize("About.message_send", locale), 2000, "toast-message_send");
      },
      error(): void {
        $(".toast-error_message_send").remove();
        Materialize.toast(localize("About.error_message_send", locale), 2000, "toast-error_message_send");
      },
    });
  }

  setUserName = (user: string) => {
    this.setState({ username: { text: user, error: "" } });
  }

  setEmail = (email: string) => {
    this.setState({ email: { text: email, error: "" } });
  }

  setMessage = (mes: string) => {
    this.setState({ message: { text: mes, error: "" } });
  }

  validDatas = () => {
    const { localize, locale } = this.context;

    const REQULAR_EXPRESSION = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

    if (this.state.username.text.length === 0) {
      this.state.username.error = localize("Settings.field_empty", locale);
      this.setState({ username: { text: this.state.username.text, error: localize("Settings.field_empty", locale) } });
    }
    if (this.state.email.text.length === 0) {
      this.state.email.error = localize("Settings.field_empty", locale);
      this.setState({ email: { text: this.state.email.text, error: localize("Settings.field_empty", locale) } });
    } else if (REQULAR_EXPRESSION.test(this.state.email.text) === false) {
      this.state.email.error = localize("Settings.email_error", locale);
      this.setState({ email: { text: this.state.email.text, error: localize("Settings.email_error", locale) } });
    }
    if (this.state.message.text.length === 0) {
      this.state.message.error = localize("Settings.field_empty", locale);
      this.setState({ message: { text: this.state.message.text, error: localize("Settings.field_empty", locale) } });
    }
    if (this.state.email.error.length === 0 && this.state.message.error.length === 0 && this.state.username.error.length === 0) {
      this.send();
    }
  }

  render(): any {
    const { localize, locale } = this.context;
    const { email, message, username } = this.state;

    let errUser = "";
    let errEmail = "";
    let errMessage = "";

    if (this.state.username.error.length === 0) {
      errUser = "not-active";
    }
    if (this.state.email.error.length === 0) {
      errEmail = "not-active";
    }
    if (this.state.message.error.length === 0) {
      errMessage = "not-active";
    }

    return (
      <div>
        <div className="card infoapp">
          <div className="card-content gray-text">
            <span className="card-title">{localize("About.FeedBack", locale)}</span>
            <h6 className="contact-text">{localize("About.feedback_description", locale)}</h6>
            <form onSubmit={this.validDatas} className="col s12">
              <div className="row form">
                <div className="input-field col s12">
                  <input id="username" type="text" value={username.text} onChange={(evt) => this.setUserName(evt.target.value)}></input>
                  <label htmlFor="username">{localize("About.username", locale)}</label>
                </div>
                <div className={"about-error-info " + errUser}>
                  <i className="material-icons icon-error">warning</i>
                  <div className="error-text about-text">{this.state.username.error}</div>
                </div>
              </div>
              <div className="row form">
                <div className="input-field col s12">
                  <input id="email" type="email" className="validate" value={email.text} onChange={(evt) => this.setEmail(evt.target.value)}></input>
                  <label htmlFor="email" >{localize("About.email", locale)}</label>
                </div>
                <div className={"about-error-info " + errEmail}>
                  <i className="material-icons icon-error">warning</i>
                  <div className="error-text about-text">{this.state.email.error}</div>
                </div>
              </div>
              <div className="row form message">
                <div className="input-field col s12 mes-textarea">
                  <textarea id="message" className="materialize-textarea" value={message.text} onChange={(evt: any) => this.setMessage(evt.target.value)}></textarea>
                  <label htmlFor="message">{localize("About.message", locale)}</label>
                </div>
                <div className={"about-error-info " + errMessage}>
                  <i className="material-icons icon-error">warning</i>
                  <div className="error-text about-text">{this.state.message.error}</div>
                </div>
              </div>
            </form>
          </div>
          <div className="card-action">
            <a onClick={this.validDatas}>{localize("About.send", locale)}</a>
          </div>
        </div>
      </div>
    );
  }
}

export default FeedbackForm;
