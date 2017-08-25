import * as React from "react";
import { connect } from "react-redux";
import { mapToArr } from "../utils";

class RecipientsList extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    const { recipients, onActive } = this.props;

    if (recipients && recipients.length > 0) {
      return (
        <div className="cert-view-main choose-certs-view">
          <div className={"add-cert-collection collection "}>
            {recipients.map((recipient) => {
              let status: string;
              if (recipient.status) {
                status = "status_cert_ok_icon";
              } else {
                status = "status_cert_fail_icon";
              }
              return <div className="collection-item avatar certs-collection" key={recipient.id + 1} onClick={onActive}>
                <div className="r-iconbox-link">
                  <div className="r-iconbox-cert-icon"><i className={status} id="cert-status"></i></div>
                  <p className="collection-title">{recipient.subjectFriendlyName}</p>
                  <p className="collection-info cert-info">{recipient.issuerFriendlyName}</p>
                </div>
              </div>;
            })}
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}

export default connect((state) => {
  return {
    recipients: state.recipients.forEach((recipient) => state.certificates.getIn(["entities", recipient.certId])),
  };
})(RecipientsList);
