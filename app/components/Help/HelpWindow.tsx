import PropTypes from "prop-types";
import * as React from "react";
import { Link } from 'react-router-dom'

interface IExternalLinkProps {
      externalLink: string;
      externalName: string;
}
class ExternalLink extends React.Component<IExternalLinkProps, any> {
      constructor(props: IExternalLinkProps) {
          super(props);
     }
     toLinkSoc(address: string) {
         var shell = require('electron').shell;
         shell.openExternal(address);
     }
    render() {
         let self = this;
          return <span className="">
              <a className="" target="_blank" onClick={function (event: any) { self.toLinkSoc(self.props.externalLink) } }>
              {self.props.externalName}</a>
          </span>;
      }
}

class HelpWindow extends React.PureComponent {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  shouldComponentUpdate(nextProps: {}, nextState: {}, nextContext: {locale: string}) {
    return (this.context.locale !== nextContext.locale) ? true : false;
  }

  render() {
    const { localize, locale } = this.context;
 
    return (
      <div>
        <div className="main">
          <div className="content">
          <div className="Help">
            <div className="row">
              <h4 className="help_header">{localize("Help.Header1", locale)}</h4>
              <div className="col s8">
                <p className="help_paragraf">{localize("Help.Paragraf_1_1", locale)}</p>
                <p className="help_paragraf">{localize("Help.Paragraf_1_2a", locale)} <ExternalLink externalLink={localize("Help.link_user_guide", locale)} externalName={localize("Help.link_user_guide_name", locale)} /><span>.</span></p>
                <p className="help_paragraf">{localize("Help.Paragraf_1_3a", locale)} <ExternalLink externalLink={localize("Help.link_shop", locale)} externalName={localize("Help.link_shop_name", locale)} /><span>.</span></p>
              </div>
              <div className="col s3">
                  <div className="help_user_guide_img"></div>
              </div>
            </div>
            <div className="row">
              
              <h4 className="help_header">{localize("Help.Header2", locale)}</h4>
              <p className="help_paragraf"></p>
              <div><a href="#id1" className="help_paragraf">{localize("Help.Paragraf_2_1", locale)}</a></div>                      
              <div><a href="#id2" className="help_paragraf">{localize("Help.Paragraf_2_2", locale)}</a></div> 
              <div><a href="#id3" className="help_paragraf">{localize("Help.Paragraf_2_3", locale)}</a></div> 
              <div><a href="#id4" className="help_paragraf">{localize("Help.Paragraf_2_4", locale)}</a></div> 
              <div><a href="#id5" className="help_paragraf">{localize("Help.Paragraf_2_5", locale)}</a></div> 

              <h4 id="id1" className="help_header">{localize("Help.Header3", locale)}</h4>
    
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

              <h4 id="id2" className="help_header">{localize("Help.Header4", locale)}</h4>
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

              <h4 id="id3" className="help_header">{localize("Help.Header5", locale)}</h4>
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

              <h4 id="id4" className="help_header">{localize("Help.Header6", locale)}</h4>
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

              <h4 id="id5" className="help_header">{localize("Help.Header7", locale)}</h4>
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
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }
}

export default HelpWindow;
