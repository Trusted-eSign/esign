import { OrderedMap, Record } from "immutable";
import { ADD_SERVICE, CHANGE_SERVICE_SETTINGS, DELETE_SERVICE } from "../constants";

const ServiceModel = Record({
  id: null,
  name: null,
  settings: OrderedMap({}),
  type: null,
});

const SettingsModel = Record({
  mobileNumber: null,
});

const DefaultReducerState = Record({
  entities: OrderedMap({}),
});

export default (services = new DefaultReducerState(), action) => {
  const { type, payload } = action;

  switch (type) {
    case ADD_SERVICE:
      return services.setIn(["entities", payload.service.id], new ServiceModel(payload.service));

    case DELETE_SERVICE:
      return services
        .deleteIn(["entities", payload.id]);

    case CHANGE_SERVICE_SETTINGS:
      return services.setIn(["entities", payload.id, "settings"], new SettingsModel(payload.settings));
  }

  return services;
};
