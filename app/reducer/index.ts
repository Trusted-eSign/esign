import {combineReducers} from "redux";
import certificates from "./certificates";
import files from "./files";
import filters from "./filters";
import license from "./license";
import recipients from "./recipients";
import settings from "./settings";
import signatures from "./signatures";
import signers from "./signers";

export default combineReducers({
  certificates,
  files,
  filters,
  license,
  recipients,
  settings,
  signatures,
  signers,
});
