import { ADD_SERVICE, CHANGE_SERVICE_SETTINGS, DELETE_SERVICE } from "../constants";
import { uuid } from "../utils";

export function addService(name: string, type: string) {
  const id = uuid();

  return {
    payload: {
      service: {
        id,
        name,
        type,
      },
    },
    type: ADD_SERVICE,
  };
}

export function deleteService(id: string) {
  return {
    payload: {
      id,
    },
    type: DELETE_SERVICE,
  };
}
