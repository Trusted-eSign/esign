import * as React from "react";

interface ISocialServicesProps {
  socialLink: string;
  social: string;
}

class SocialServices extends React.Component<ISocialServicesProps, {}> {
  toLinkSoc(address: string) {
    window.electron.shell.openExternal(address);
  }

  render() {
    const { socialLink, social } = this.props;

    return (
      <div className="r-socials-item">
        <a className="w-socials-item-link" target="_blank" onClick={(event: any) => this.toLinkSoc(socialLink)}>
          <i className={social} />
        </a>
      </div>
    );
  }
}

export default SocialServices;
