import {routerReducer as router} from "react-router-redux";
import {combineReducers} from "redux";
import certificates from "./certificates";
import connections from "./connections";
import containers from "./containers";
import files from "./files";
import filters from "./filters";
import license from "./license";
import recipients from "./recipients";
import settings from "./settings";
import signatures from "./signatures";
import signers from "./signers";

export default combineReducers({
  router,
  certificates,
  connections,
  containers,
  files,
  filters,
  license,
  recipients,
  settings,
  signatures,
  signers,
});
