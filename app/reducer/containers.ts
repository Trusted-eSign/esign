import { OrderedMap, Record } from "immutable";
import { ACTIVE_CONTAINER, GET_CERTIFICATE_FROM_CONTAINER,
   LOAD_ALL_CONTAINERS, REMOVE_ALL_CONTAINERS, START, SUCCESS } from "../constants";
import { arrayToMap } from "../utils";

const ContainerModel = Record({
  certificate: null,
  certificateItem: null,
  certificateLoaded: false,
  certificateLoading: false,
  friendlyName: null,
  id: null,
  name: null,
  reader: null,
});

const DefaultReducerState = Record({
  active: null,
  entities: OrderedMap({}),
  loaded: false,
  loading: false,
});

export default (sContainers = new DefaultReducerState(), action) => {
  const { type, containers, payload } = action;
  switch (type) {
    case ACTIVE_CONTAINER:
      return sContainers.set("active", payload.container);

    case LOAD_ALL_CONTAINERS + START:
      return sContainers.set("loading", true);

    case LOAD_ALL_CONTAINERS + SUCCESS:
      return sContainers
        .set("entities", arrayToMap(containers, ContainerModel))
        .set("loading", false)
        .set("loaded", true);

    case GET_CERTIFICATE_FROM_CONTAINER + START:
      return sContainers.setIn(["entities", payload.container, "certificateLoading"], true);

    case GET_CERTIFICATE_FROM_CONTAINER + SUCCESS:
      return sContainers
        .setIn(["entities", payload.container, "certificate"], payload.certificate)
        .setIn(["entities", payload.container, "certificateItem"], payload.certificateItem)
        .setIn(["entities", payload.container, "certificateLoading"], false)
        .setIn(["entities", payload.container, "certificateLoaded"], true);

    case REMOVE_ALL_CONTAINERS:
      return sContainers = new DefaultReducerState();
  }

  return sContainers;
};
