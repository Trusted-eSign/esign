import React from "react";
import { CRYPTOPRO_DSS } from "../constants";
import { MEGAFON } from "../service/megafon/constants";

const rectangleValidStyle = {
  background: "#4caf50",
};

const rectangleUnvalidStyle = {
  background: "#bf3817",
};

class RecipientsList extends React.Component<any, any> {
  timer: number | NodeJS.Timer = 0;
  delay = 200;
  prevent: boolean = false;

  handleClick = (element) => {
    const { onActive } = this.props;

    this.timer = setTimeout(() => {
      if (!this.prevent) {
        onActive(element);
      }
      this.prevent = false;
    }, this.delay);
  }

  handleDoubleClick = (element) => {
    const { handleRemoveRecipient } = this.props;

    clearTimeout(this.timer);
    this.prevent = true;
    handleRemoveRecipient(element);
  }

  render() {
    const { recipients, dialogType } = this.props;

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
              (dialogType === "modal") ? curStatusStyle = "cert_status_ok short" : curStatusStyle = "cert_status_ok long";
              rectangleStyle = rectangleValidStyle;
            } else {
              (dialogType === "modal") ? curStatusStyle = "cert_status_error short" : curStatusStyle = "cert_status_error long";
              rectangleStyle = rectangleUnvalidStyle;
            }

            if (element.key.length > 0) {
              (dialogType === "modal") ? curKeyStyle = "key short " : curKeyStyle = "key long ";
              if (curKeyStyle) {
                if (element.service) {
                  if (element.service === MEGAFON) {
                    curKeyStyle += "megafonkey";
                  } else if (element.service === CRYPTOPRO_DSS) {
                    curKeyStyle += "dsskey";
                  }
                } else {
                  curKeyStyle += "localkey";
                }
              }
            } else {
              curKeyStyle = "";
            }

            return <div className="collection-item avatar certs-collection" key={element.id + 1}
             onClick={() => this.handleClick(element)}
             onDoubleClick={() => this.handleDoubleClick(element)}>
              <div className="r-iconbox-link">
                <div className={"rectangle"} style={rectangleStyle}></div>
                <div className="collection-title pad-cert">{element.subjectFriendlyName}</div>
                <div className="collection-info cert-info pad-cert">{element.issuerFriendlyName}
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

export default RecipientsList;
