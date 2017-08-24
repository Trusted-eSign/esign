import * as React from "react";
import { Link } from "react-router";
import { lang } from "../module/global_app";

const MenuStyle = {
  textDecoration: "none",
};

class SideMenu extends React.Component<any, any> {
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
    const settings = {
      draggable: false,
    };
    return (
      <div>
        <nav className="menu-logo">
          <div className="center">
            <Link to="/" className="menuheaderlink" href="/" {...settings}>
              <i className="logo-trusted"><img src="trusted-esign.png" {...settings} /></i><div className="logo-text">{lang.get_resource.About.product_NAME}</div>
            </Link>
          </div>
        </nav>
        <Link to="/sign" {...settings} style={MenuStyle}>{lang.get_resource.Sign.Sign}<i className="material-icons left sign">mode_edit</i></Link>
        <Link to="/encrypt" {...settings} style={MenuStyle}>{lang.get_resource.Encrypt.Encrypt}<i className="material-icons left encrypt">enhanced_encryption</i></Link>
        <Link to="/certificate" {...settings} style={MenuStyle}>{lang.get_resource.Certificate.Certificate}<i className="material-icons left cert">library_books</i></Link>
        <div className="menu-elements">
          <Link className={"bordered--top"} {...settings} to="/about" style={MenuStyle}>{lang.get_resource.About.About}<i className="material-icons left about">about</i></Link>
          <Link to="/help" {...settings} style={MenuStyle}>{lang.get_resource.Help.Help}<i className="material-icons left help">help</i></Link>
        </div>
      </div>
    );
  }
}

export default SideMenu;
