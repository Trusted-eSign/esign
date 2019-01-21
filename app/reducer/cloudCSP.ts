import { FAIL, GET_CERTIFICATES_FROM_DSS, RESET_CLOUD_CSP, START, SUCCESS } from "../constants";

const DefaultReducerState = {
  certificates: [],
  error: null,
  loaded: false,
  loading: false,
  statusCode: null,
};

export default (clouCSPState = DefaultReducerState, action) => {
  const { type, payload } = action;

  switch (type) {
    case GET_CERTIFICATES_FROM_DSS + START:
      return clouCSPState = { ...clouCSPState, ...DefaultReducerState, loading: true };

    case GET_CERTIFICATES_FROM_DSS + SUCCESS:
      return clouCSPState = {
        ...clouCSPState,
        certificates: payload.certificates,
        loaded: true,
        loading: false,
        statusCode: payload.statusCode,
      };

    case GET_CERTIFICATES_FROM_DSS + FAIL:
      return clouCSPState = {
        ...clouCSPState,
        error: payload ? payload.error : "",
        loaded: true,
        loading: false,
        statusCode: payload.statusCode,
      };

    case RESET_CLOUD_CSP:
      return clouCSPState = {
        ...clouCSPState, ...DefaultReducerState,
      };
  }

  return clouCSPState;
};
