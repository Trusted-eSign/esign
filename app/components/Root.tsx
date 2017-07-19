import * as React from "react";
import { Provider } from "react-redux";
import App from "./App";

class Root extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <Provider store={this.props.store}>
        <App />
      </Provider>
    );
  }
}

export default Root;
