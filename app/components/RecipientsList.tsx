import * as React from "react";
import { connect } from "react-redux";
import { mapToArr } from "../utils";

class RecipientsList extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    const { certificates, recipients, onActive } = this.props;

    if (!recipients || !recipients.length) {
      return null;
    }

    return (
      <div className="cert-view-main choose-certs-view">
        <div className={"add-cert-collection collection "}>
          {recipients.map((element) => {
            let status: string;
            if (element.status) {
              status = "status_cert_ok_icon";
            } else {
              status = "status_cert_fail_icon";
            }
            return <div className="collection-item avatar certs-collection" key={element.id + 1} onClick={() => onActive(element)}>
              <div className="r-iconbox-link">
                <div className="r-iconbox-cert-icon"><i className={status} id="cert-status"></i></div>
                <p className="collection-title">{element.subjectFriendlyName}</p>
                <p className="collection-info cert-info">{element.issuerFriendlyName}</p>
              </div>
            </div>;
          })}
        </div>
      </div>
    );
  }
}

export default connect((state) => {
  return {
    certificates: state.certificates,
    recipients: mapToArr(state.recipients.entities).map((recipient) => state.certificates.getIn(["entities", recipient.certId])),
  };
})(RecipientsList);
