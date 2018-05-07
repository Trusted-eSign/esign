import {routerReducer as router} from "react-router-redux";
import {combineReducers} from "redux";
import certificates from "./certificates";
import connections from "./connections";
import containers from "./containers";
import events from "./events";
import files from "./files";
import filters from "./filters";
import license from "./license";
import recipients from "./recipients";
import remoteFiles from "./remoteFiles";
import settings from "./settings";
import signatures from "./signatures";
import signers from "./signers";

export default combineReducers({
  router,
  certificates,
  connections,
  containers,
  events,
  files,
  filters,
  license,
  recipients,
  remoteFiles,
  settings,
  signatures,
  signers,
});
