import PropTypes from "prop-types";
import React from "react";
import { Element, Events, Link, scroller } from "react-scroll";

interface IExternalLinkProps {
  externalLink: string;
  externalName: string;
}
class ExternalLink extends React.Component<IExternalLinkProps, any> {
  gotoLink = (address: string) => {
    window.electron.shell.openExternal(address);
  }

  render() {
    const { externalName, externalLink } = this.props;

    return (
      <span>
        <a target="_blank" onClick={(event: any) => { this.gotoLink(externalLink); }}>
          {externalName}
        </a>
      </span>
    );
  }
}

// tslint:disable-next-line:max-classes-per-file
class HelpWindow extends React.Component {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  shouldComponentUpdate(nextContext: { locale: string }) {
    return (this.context.locale !== nextContext.locale) ? true : false;
  }

  scrollToWithContainer() {
    const goToContainer = new Promise((resolve) => {

      Events.scrollEvent.register("end", () => {
        resolve();
        Events.scrollEvent.remove("end");
      });

      scroller.scrollTo("scroll-container", {
        delay: 0,
        duration: 800,
        smooth: "easeInOutQuart",
      });
    });

    goToContainer.then(() =>
      scroller.scrollTo("scroll-container-second-element", {
        containerId: "scroll-container",
        delay: 0,
        duration: 800,
        smooth: "easeInOutQuart",
      }));
  }

  render() {
    const { localize, locale } = this.context;

    return (
      <div className="content">
        <div className="Help">
          <div className="row nobottom">
            <div className="row nobottom">
              <div className="col s12 nopadding">
                <h4 className="help_header">{localize("Help.Header1", locale)}</h4>
                <p className="help_paragraf"></p>

                <ul>
                  <li>
                    <Link className="help_paragraf" activeClass="active" to="id1" spy={true} smooth={true} duration={250} containerId="containerElement">
                      {localize("Help.Paragraf_2_1", locale)}
                    </Link>
                  </li>
                  <li>
                    <Link className="help_paragraf" activeClass="active" to="id2" spy={true} smooth={true} duration={250} containerId="containerElement">
                      {localize("Help.Paragraf_2_2", locale)}
                    </Link>
                  </li>
                  <li>
                    <Link className="help_paragraf" activeClass="active" to="id3" spy={true} smooth={true} duration={250} containerId="containerElement">
                      {localize("Help.Paragraf_2_3", locale)}
                    </Link>
                  </li>
                  <li>
                    <Link className="help_paragraf" activeClass="active" to="id4" spy={true} smooth={true} duration={250} containerId="containerElement">
                      {localize("Help.Paragraf_2_4", locale)}
                    </Link>
                  </li>
                  <li>
                    <Link className="help_paragraf" activeClass="active" to="id5" spy={true} smooth={true} duration={250} containerId="containerElement">
                      {localize("Help.Paragraf_2_5", locale)}
                    </Link>
                  </li>
                </ul>

                <Element className="scroll_inside" name="container" id="containerElement" /*style={{
                  height: "382px",
                  overflow: "scroll",
                  position: "relative",
                }}*/>

                  <Element name="id0">
                    <div className="col s12">
                      {/* <h4 className="help_header">{localize("Help.Header1", locale)}</h4> */}
                      <div className="col s9">
                        <p className="help_paragraf">{localize("Help.Paragraf_1_1", locale)}</p>
                        <p className="help_paragraf">
                          {localize("Help.Paragraf_1_2a", locale)}
                          <ExternalLink externalLink={localize("Help.link_user_guide", locale)} externalName={localize("Help.link_user_guide_name", locale)} />
                        </p>
                        <p className="help_paragraf">
                          {localize("Help.Paragraf_1_3a", locale)}
                          <ExternalLink externalLink={localize("Help.link_shop", locale)} externalName={localize("Help.link_shop_name", locale)} />
                        </p>
                      </div>
                      <div className="col s3">
                        <div className="help_user_guide_img"></div>
                      </div>
                    </div>
                  </Element>

                  <Element name="id1">
                    <h4 className="help_header">{localize("Help.Header3", locale)}</h4>
                    <p className="help_paragraf">{localize("Help.Paragraf_3_1", locale)}</p>
                    <p className="help_paragraf">{localize("Help.Paragraf_3_2", locale)}</p>
                    <div className="row">
                      <div className="col s6">
                        <div className="help_main_window_img"></div>
                      </div>
                      <div className="col s6">
                        <div className="help_main_window_menu_img"></div>
                      </div>
                    </div>
                    <p className="help_paragraf">{localize("Help.Paragraf_3_3", locale)}</p>
                  </Element>

                  <Element name="id2">
                    <h4 className="help_header">{localize("Help.Header4", locale)}</h4>
                    <p className="help_paragraf">{localize("Help.Paragraf_4_1", locale)}</p>
                    <p className="help_paragraf">{localize("Help.Paragraf_4_2", locale)}</p>
                    <div className="row">
                      <div className="col s6">
                        <div className="help_license_window_img"></div>
                      </div>
                      <div className="col s6">
                        <div className="help_license_window_modal_img"></div>
                      </div>
                    </div>
                    <p className="help_paragraf">{localize("Help.Paragraf_4_3a", locale)}<span> {localize("Help.Paragraf_4_3b", locale)}</span></p>
                  </Element>

                  <Element name="id3">
                    <h4 className="help_header">{localize("Help.Header5", locale)}</h4>
                    <p className="help_paragraf">{localize("Help.Paragraf_5_1", locale)}</p>
                    <p className="help_paragraf">{localize("Help.Paragraf_5_2", locale)}</p>
                    <p className="help_paragraf">{localize("Help.Paragraf_5_3", locale)}</p>
                    <div className="row">
                      <div className="col s6">
                        <div className="help_sign_window_clear_img"></div>
                      </div>
                      <div className="col s6">
                        <div className="help_sign_window_choose_cert_img"></div>
                      </div>
                    </div>
                    <p className="help_paragraf">{localize("Help.Paragraf_5_4", locale)}</p>
                    <p className="help_paragraf">{localize("Help.Paragraf_5_5", locale)}</p>
                    <p className="help_paragraf">{localize("Help.Paragraf_5_6", locale)}</p>
                    <div className="row">
                      <div className="col s6">
                        <div className="help_sign_window_filling_img"></div>
                      </div>
                      <div className="col s6">
                        <div className="help_sign_window_verify_img"></div>
                      </div>
                    </div>
                  </Element>

                  <Element name="id4">
                    <h4 className="help_header">{localize("Help.Header6", locale)}</h4>
                    <p className="help_paragraf">{localize("Help.Paragraf_6_1", locale)}</p>
                    <p className="help_paragraf">{localize("Help.Paragraf_6_2", locale)}</p>
                    <p className="help_paragraf">{localize("Help.Paragraf_6_3", locale)}</p>
                    <div className="row">
                      <div className="col s6">
                        <div className="help_encrypt_window_clear_img"></div>
                      </div>
                      <div className="col s6">
                        <div className="help_encrypt_window_choose_cert_img"></div>
                      </div>
                    </div>
                    <p className="help_paragraf">{localize("Help.Paragraf_6_4", locale)}</p>
                    <p className="help_paragraf">{localize("Help.Paragraf_6_5", locale)}</p>
                    <p className="help_paragraf">{localize("Help.Paragraf_6_6", locale)}</p>
                    <p className="help_paragraf">{localize("Help.Paragraf_6_7", locale)}</p>
                    <div className="row">
                      <div className="col s6">
                        <div className="help_encrypt_window_choose_files_img"></div>
                      </div>
                      <div className="col s6">
                        <div className="help_decrypt_window_img"></div>
                      </div>
                    </div>
                  </Element>

                  <Element name="id5">
                    <h4 className="help_header">{localize("Help.Header7", locale)}</h4>
                    <p className="help_paragraf">{localize("Help.Paragraf_7_1", locale)}</p>
                    <p className="help_paragraf">{localize("Help.Paragraf_7_2", locale)}</p>
                    <p className="help_paragraf">{localize("Help.Paragraf_7_3", locale)}</p>
                    <div className="row">
                      <div className="col s6">
                        <div className="help_cert_windows_using_img"></div>
                      </div>
                      <div className="col s6">
                        <div className="help_cert_windows_chain_img"></div>
                      </div>
                    </div>
                  </Element>
                </Element>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default HelpWindow;
