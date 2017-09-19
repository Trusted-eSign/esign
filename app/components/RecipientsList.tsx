import * as React from "react";
import { connect } from "react-redux";
import { mapToArr } from "../utils";

const rectangleValidStyle = {
  background: "#4caf50",
};

const rectangleUnvalidStyle = {
  background: "#bf3817",
};

class RecipientsList extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    const { certificates, recipients, onActive, dialogType } = this.props;

    if (!recipients || !recipients.length) {
      return null;
    }

    return (
      <div className="cert-view-main choose-certs-view">
        <div className={"add-cert-collection collection "}>
          {recipients.map((element) => {
            let curStatusStyle;
            let curKeyStyle;
            let rectangleStyle;
            if (element.status) {
                (dialogType === "modal") ? curStatusStyle = "cert_status_ok short": curStatusStyle = "cert_status_ok long";
                rectangleStyle = rectangleValidStyle;
            } else {
                (dialogType === "modal") ? curStatusStyle = "cert_status_error short": curStatusStyle = "cert_status_error long";
                rectangleStyle = rectangleUnvalidStyle;
            }

            if (element.key.length > 0) {
              (dialogType === "modal") ? curKeyStyle = "key short" : curKeyStyle = "key long";
            } else {
              curKeyStyle = "";
            }

            return <div className="collection-item avatar certs-collection" key={element.id + 1} onClick={() => onActive(element)}>
              <div className="r-iconbox-link">
                <div className={"rectangle"} style={rectangleStyle}></div>
                <div className="collection-title">{element.subjectFriendlyName}</div>
                <div className="collection-info cert-info ">{element.issuerFriendlyName}
                  <div className={curKeyStyle}></div>
                  <div className={curStatusStyle}></div>
                </div>
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
