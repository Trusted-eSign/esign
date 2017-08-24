import * as React from "react";

interface ICheckBoxWithLabelProps {
  onClickCheckBox: (event: any) => void;
  isChecked: boolean;
  elementId: string;
  title: string;
}

class CheckBoxWithLabel extends React.Component<ICheckBoxWithLabelProps, any> {
  constructor(props: ICheckBoxWithLabelProps) {
    super(props);
  }

  render() {
    const { onClickCheckBox, isChecked, elementId, title } = this.props;

    return <div className="row settings-item">
      <div className="col settins-check-title">{title}</div>
      <div className="col settings-check">
        <input type="checkbox" id={elementId} className="filled-in" onClick={onClickCheckBox} defaultChecked={isChecked} />
        <label htmlFor={elementId}></label>
      </div>
    </div>;
  }
}

export default CheckBoxWithLabel;
