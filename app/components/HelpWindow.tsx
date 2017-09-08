import * as React from "react";

const webviewStyle = { width: 100 + "%" };

class HelpWindow extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {

    return (
      <div className="tmain">
        <div className="content">
          <webview src="help/help.html" style={webviewStyle}></webview>
        </div>
      </div>
    );
  }
}

export default HelpWindow;
