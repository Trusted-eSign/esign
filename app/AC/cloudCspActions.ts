import { CHANGE_DSS_AUTH_URL, CHANGE_DSS_REST_URL } from "../constants";

export function changeAuthURL(authURL: string) {
  return {
    payload: { authURL },
    type: CHANGE_DSS_AUTH_URL,
  };
}

export function changeRestURL(restURL: string) {
  return {
    payload: { restURL },
    type: CHANGE_DSS_REST_URL,
  };
}
