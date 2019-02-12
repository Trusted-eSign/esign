import PropTypes from "prop-types";
import React from "react";
import { connect } from "react-redux";
import { deleteService } from "../../AC/servicesActions";

interface IDeleteServiceProps {
  deleteService: (id: string) => void;
  service: any;
  onCancel?: () => void;
}

class DeleteService extends React.Component<IDeleteServiceProps, {}> {
  static contextTypes = {
    locale: PropTypes.string,
    localize: PropTypes.func,
  };

  componentWillUnmount() {
    this.handelCancel();
  }

  render() {
    const { localize, locale } = this.context;

    return (
      <React.Fragment>
        <div className="row">
          <div className="col s12">
            <span className="card-infos sub">
              {localize("Services.realy_delete_service", locale)}
            </span>
          </div>
        </div>
        <div className="row">
          <div className="col s5 offset-s7">
            <div className="row nobottom">
              <div className="col s6">
                <a className={"waves-effect waves-light btn modal-close"} onClick={this.handelCancel}>
                  {localize("Common.cancel", locale)}
                </a>
              </div>
              <div className="col s6">
                <a className="waves-effect waves-light btn modal-close" onClick={this.handleDeleteService}>
                  {localize("Common.delete", locale)}
                </a>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  handelCancel = () => {
    const { onCancel } = this.props;

    if (onCancel) {
      onCancel();
    }
  }

  handleDeleteService = () => {
    // tslint:disable-next-line:no-shadowed-variable
    const { deleteService, service } = this.props;
    const { localize, locale } = this.context;

    if (!service) {
      return;
    }

    deleteService(service.id);

    $(".toast-service_delete_ok").remove();
    Materialize.toast(localize("Services.service_delete_ok", locale), 2000, "toast-service_delete_ok");

    this.handelCancel();
  }
}

export default connect(() => ({}), { deleteService })(DeleteService);
