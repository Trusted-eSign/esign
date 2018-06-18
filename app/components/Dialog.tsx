import PropTypes from "prop-types";
import React from "react";
import HeaderWorkspaceBlock from "./HeaderWorkspaceBlock";

interface IDialogProps {
  isOpen: boolean;
  header: string;
  body?: string;
  onYes: () => void;
  onNo: () => void;
}

interface IDialogState {
  active: boolean;
}

class Dialog extends React.Component<IDialogProps, IDialogState> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  constructor(props: IDialogProps) {
    super(props);
    this.state = {
      active: props.isOpen,
    };
  }

  componentWillReceiveProps(newProps: IDialogProps) {
    const { isOpen } = newProps;

    if (this.state.active !== isOpen) {
      this.setState({ active: isOpen });
    }
  }

  render() {
    const { localize, locale } = this.context;
    const { header, body } = this.props;
    const { active } = this.state;

    if (!active) {
      return null;
    }

    return (
      <div className={"dialog active"}>
        <div className="dialog-content">
          <HeaderWorkspaceBlock text={header} new_class="dialog-bar" />
          <div className="dialog-text">
            <div className="dialog-message">{body}</div>
          </div>
          <div className="dialog-buttons">
            <a className="waves-effect waves-light btn dialog-btn" onClick={this.handleYes}>
              {localize("Common.yes", locale)}
            </a>
            <a className="waves-effect waves-light btn dialog-btn" onClick={this.handleNo}>
              {localize("Common.no", locale)}
            </a>
          </div>
        </div>
      </div>
    );
  }

  handleYes = () => {
    this.props.onYes();
    this.setState({ active: false });
  }

  handleNo = () => {
    this.props.onNo();
    this.setState({ active: false });
  }
}

export default Dialog;
