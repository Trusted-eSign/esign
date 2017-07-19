import {combineReducers} from "redux";
import certificates from "./certificates";
import filters from "./filters";

export default combineReducers({
  certificates,
  filters,
});
