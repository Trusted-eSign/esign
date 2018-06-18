import React from "react";
import { connect } from "react-redux";
import { changeSearchValue } from "../AC/searchActions";

interface ISearchElementState {
  open: boolean;
}

interface ISearchElementProps {
  changeSearchValue: (ev: any) => void;
  searchValue: string;
}

class SearchElement extends React.Component<ISearchElementProps, ISearchElementState> {
  constructor(props: ISearchElementProps) {
    super(props);

    this.state = ({
      open: false,
    });
  }

  handleOpen() {
    this.setState({
      open: true,
    });
  }

  handleClose() {
    // tslint:disable-next-line:no-shadowed-variable
    const { changeSearchValue } = this.props;

    changeSearchValue("");

    this.setState({
      open: false,
    });
  }

  handleValueChange = (ev: any) => {
    // tslint:disable-next-line:no-shadowed-variable
    const { changeSearchValue } = this.props;
    changeSearchValue(ev.target.value);
  }

  render() {
    const { searchValue } = this.props;

    let mainClassName: string;

    this.state.open || searchValue.length ? mainClassName = "active" :  mainClassName = "";

    return (
      <div className={"search right " + mainClassName}>
        <a className="trigger waves-effect" onClick={this.handleOpen.bind(this)}>
          <i className="material-icons search-icon">search</i>
        </a>
        <div className={"search-wrapper " + mainClassName}>
          <input type="text" id="search-input" value={searchValue} onChange={this.handleValueChange} />
          <a className="closer waves-effect waves-light" onClick={this.handleClose.bind(this)}>
            <i className="material-icons search-icon">close</i>
          </a>
        </div>
      </div>
    );
  }
}

export default connect((state) => ({
    searchValue: state.filters.searchValue,
}), { changeSearchValue })(SearchElement);
