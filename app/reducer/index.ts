import {combineReducers} from "redux";
import certificates from "./certificates";
import filters from "./filters";
import signers from "./signers";

export default combineReducers({
  certificates,
  filters,
  signers,
});
