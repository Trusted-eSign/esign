import PropTypes from "prop-types";
import * as React from "react";
import HeaderWorkspaceBlock from "../HeaderWorkspaceBlock";


interface IDiagnosticModalProps {
  isOpen: boolean;
  header: string;
  onClose?: () => void;
}

class DiagnosticModal extends React.Component<IDiagnosticModalProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

 

  componentWillReceiveProps(newProps: IDiagnosticModalProps) {
    const { isOpen } = newProps;

    if (!this.props.isOpen && !isOpen) {
      return;
    }
  }

  componentDidMount() {
    const { isOpen } = this.props;

    if (isOpen) {
      $("#modal-window-diagnostic").openModal({dismissible: false});
    }
  }

  handleCloseModal = () => {
    const { onClose } = this.props;

    if (onClose) {
      onClose();
    }

    $("#modal-window-diagnostic").closeModal();
  }

  render() {
    const { localize, locale } = this.context;
    const { isOpen, header } = this.props;

    if (!isOpen) {
      return null;
    }

    return (
      <div id="modal-window-diagnostic" className="modal diagnostic-modal">
        <div className="licence-modal-main">
          <HeaderWorkspaceBlock
            text={header}
            new_class="modal-bar"
            icon="close"
            onСlickBtn={() => {
              this.handleCloseModal();
            }}
          />
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default DiagnosticModal;
