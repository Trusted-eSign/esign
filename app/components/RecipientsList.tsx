import * as React from "react";

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

  constructor(props: any) {
    super(props);
  }

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
    const { recipients, onActive, handleRemoveRecipient, dialogType } = this.props;

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
              (dialogType === "modal") ? curKeyStyle = "key short" : curKeyStyle = "key long";
            } else {
              curKeyStyle = "";
            }

            return <div className="collection-item avatar certs-collection" key={element.id + 1}
             onClick={() => this.handleClick(element)}
             onDoubleClick={() => this.handleDoubleClick(element)}>
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

export default RecipientsList;
