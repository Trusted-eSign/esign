import * as React from "react";
import FeedbackForm from "./FeedbackForm";
import ProductInformation from "./ProductInformation";

class AboutWindow extends React.PureComponent {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className="main">
          <div className="about">
            <div className="row">
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
