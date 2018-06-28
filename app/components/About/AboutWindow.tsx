import React from "react";
import FeedbackForm from "./FeedbackForm";
import ProductInformation from "./ProductInformation";

class AboutWindow extends React.PureComponent {

  render() {
    return (
      <div>
        <div className="main">
          <div className="about">
            <div className="row card">
              <div className="col s6">
                <ProductInformation />
              </div>
              <div className="col s6">
                <FeedbackForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AboutWindow;
