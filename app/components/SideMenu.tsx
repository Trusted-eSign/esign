import * as React from "react";
import { Link } from "react-router";

const MenuStyle = {
  textDecoration: "none",
};

class SideMenu extends React.Component<any, any> {
  static contextTypes = {
    locale: React.PropTypes.string,
    localize: React.PropTypes.func,
  };

  constructor(props: any) {
    super(props);
    this.state = { open: false };
  }
  handleToggle() {
    this.setState({ open: !this.state.open });
  }
  handleClose() {
    this.setState({ open: false });
  }
  render() {
    const { localize, locale } = this.context;
    const settings = {
      draggable: false,
    };

    return (
      <div>
        <nav className="menu-logo">
          <div className="center">
            <Link to="/" className="menuheaderlink" href="/" {...settings}>
              <i className="logo-trusted"></i><div className="logo-text">{localize("About.product_NAME", locale)}</div>
            </Link>
          </div>
        </nav>
        <Link to="/sign" {...settings} style={MenuStyle}>{localize("Sign.Sign", locale)}<i className="material-icons left sign">mode_edit</i></Link>
        <Link to="/encrypt" {...settings} style={MenuStyle}>{localize("Encrypt.Encrypt", locale)}<i className="material-icons left encrypt">enhanced_encryption</i></Link>
        <Link to="/certificate" {...settings} style={MenuStyle}>{localize("Certificate.Certificate", locale)}<i className="material-icons left cert">library_books</i></Link>
        <div className="menu-elements">
          <Link className={"bordered--top"} {...settings} to="/about" style={MenuStyle}>{localize("About.About", locale)}<i className="material-icons left about">about</i></Link>
          <Link to="/help" {...settings} style={MenuStyle}>{localize("Help.Help", locale)}<i className="material-icons left help">help</i></Link>
        </div>
      </div>
    );
  }
}

export default SideMenu;
