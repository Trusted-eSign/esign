import { Map } from "immutable";
import { FAIL, START, SUCCESS } from "../constants";
import { GET_SIGN_STATUS, MULTIPLY_SIGN, SIGN_DOCUMENT, SIGN_TEXT, VERIFY } from "../service/megafon/constants";

const DefaultReducerState = Map({
  cms: null,
  error: null,
  isDone: false,
  isStarted: false,
  signStatusList: Map({}),
  status: null,
  transactionId: null,
});

export default (megafonState = DefaultReducerState, action) => {
  const { type, payload } = action;

  switch (type) {
    case GET_SIGN_STATUS + START:
    case MULTIPLY_SIGN + START:
    case SIGN_TEXT + START:
    case SIGN_DOCUMENT + START:
    case VERIFY + START:
      return megafonState
        .set("isDone", false)
        .set("isStarted", true)
        .set("error", null)
        .set("status", null)
        .set("transactionId", null)
        .set("cms", null);

    case SIGN_TEXT + SUCCESS:
    case SIGN_DOCUMENT + SUCCESS:
    case MULTIPLY_SIGN + SUCCESS:
      return megafonState
        .set("isStarted", false)
        .set("isDone", true)
        .set("transactionId", payload && payload.transactionId ? payload.transactionId : null);

    case GET_SIGN_STATUS + SUCCESS:
      return megafonState
        .set("isStarted", false)
        .set("isDone", true)
        .set("cms", payload && payload.cms ? payload.cms : null)
        .set("signStatusList", payload && payload.signStatusList ? Map(payload.signStatusList) : Map({}));

    case SIGN_DOCUMENT + FAIL:
    case SIGN_TEXT + FAIL:
    case MULTIPLY_SIGN + FAIL:
    case GET_SIGN_STATUS + FAIL:
    case VERIFY + FAIL:
      return megafonState
        .set("isStarted", false)
        .set("isDone", true)
        .set("status", payload && payload.status ? payload.status : null)
        .set("error", payload && payload.error ? payload.error : null);
  }

  return megafonState;
};
