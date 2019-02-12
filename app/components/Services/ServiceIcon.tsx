import React from "react";

interface IFileIconProps {
  type: string;
}

class ServiceIcon extends React.Component<IFileIconProps, {}> {
  render() {
    const { type } = this.props;

    return (
      <div className="row nobottom">
        <div className="valign-wrapper">
          <div className="col s12">
            <i className={`type_icon ${type}` + " icon_file_type"} />
          </div>
        </div>
      </div>
    );
  }
}

export default ServiceIcon;
