import * as React from "react";

export class AboutWindow extends React.Component<any, any> {
  static contextTypes = {
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

  constructor(props: any) {
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
      <div className="main">
        <div className="about">
          <div className="row">
            <div className="content"></div>
          </div>
          <div className="feedback">
            <div className="formfeedback">
              <div className="row">
                <div className="col s12 m6">
                  <div className="card contact">
                    <div className="card-content white-text">
                      <div className="row">
                        <span className="card-title">{localize("About.product_NAME", locale)}</span>
                        <span className="card-infos">
                          <p>{localize("About.version", locale)}</p>
                        </span>
                      </div>
                      <div className="row">
                        <span className="card-title">{localize("About.Info", locale)}</span>
                      </div>
                      <div className="row">
                        <div className="contact-icon"></div>
                        <h6 className="contact-text">{localize("About.about_programm", locale)}</h6>
                      </div>
                      <div className="row">
                        <div className="contact-icon"><i className="mail_contact_icon"></i></div>
                        <h6 className="contact-title">{localize("About.info", locale)}</h6>
                      </div>
                    </div>
                    <div className="card-action">
                      <a href="#">This is a link</a>
                    </div>
                  </div>
                </div>
                <div className="col s12 m6">
                  <div className="card infoapp">
                    <div className="card-content gray-text">
                      <span className="card-title">{localize("About.FeedBack", locale)}</span>
                      <h6 className="contact-text">{localize("About.feedback_description", locale)}</h6>
                      <form onSubmit={this.validDatas} className="col s12">
                        <div className="row form">
                          <div className="input-field col s12">
                            <input ref="username" id="username" type="text" value={username.text} onChange={(evt) => this.setUserName(evt.target.value)}></input>
                            <label htmlFor="username">{localize("About.username", locale)}</label>
                          </div>
                          <div className={"about-error-info " + errUser}>
                            <i className="material-icons icon-error">warning</i>
                            <div className="error-text about-text">{this.state.username.error}</div>
                          </div>
                        </div>
                        <div className="row form">
                          <div className="input-field col s12">
                            <input ref="email" id="email" type="email" className="validate" value={email.text} onChange={(evt) => this.setEmail(evt.target.value)}></input>
                            <label htmlFor="email" >{localize("About.email", locale)}</label>
                          </div>
                          <div className={"about-error-info " + errEmail}>
                            <i className="material-icons icon-error">warning</i>
                            <div className="error-text about-text">{this.state.email.error}</div>
                          </div>
                        </div>
                        <div className="row form message">
                          <div className="input-field col s12 mes-textarea">
                            <textarea ref="message" id="message" className="materialize-textarea" value={message.text} onChange={(evt: any) => this.setMessage(evt.target.value)}></textarea>
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

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
