import * as React from "react";

interface ICheckBoxWithLabelProps {
  disabled?: boolean;
  onClickCheckBox: (event: any) => void;
  isChecked: boolean;
  elementId: string;
  title: string;
}

class CheckBoxWithLabel extends React.Component<ICheckBoxWithLabelProps, any> {
  render() {
    const { disabled, onClickCheckBox, isChecked, elementId, title } = this.props;

    const classDisabled = disabled ? "disabled" : "";

    return <div className="row settings-item" >
      <div className={"col settins-check-title " + classDisabled}>{title}</div>
      <div className="col settings-check">
        <input type="checkbox" id={elementId} className="filled-in" onClick={onClickCheckBox} defaultChecked={isChecked} disabled={disabled} />
        <label htmlFor={elementId}></label>
      </div>
    </div>;
  }
}

export default CheckBoxWithLabel;
