import { OrderedMap, Record } from "immutable";
import { LOAD_ALL_EVENTS, REMOVE_ALL_EVENTS, START, SUCCESS } from "../constants";
import { arrayToMap } from "../utils";

const EventModel = Record({
  certificate: null,
  operationObject: null,
  id: null,
  level: null,
  message: null,
  operation: null,
  timestamp: null,
  userName: null,
});

const DefaultReducerState = Record({
  dateFrom: null,
  dateTo: null,
  entities: OrderedMap({}),
  isArchive: false,
  loaded: false,
  loading: false,
});

export default (events = new DefaultReducerState(), action) => {
  const { type, payload } = action;

  switch (type) {
    case LOAD_ALL_EVENTS + START:
      return events.set("loading", true);

    case LOAD_ALL_EVENTS + SUCCESS:
      return events
        .update("entities", (entities) => arrayToMap(payload.events, EventModel).merge(entities))
        .set("loading", false)
        .set("loaded", true)
        .set("dateFrom", payload.events && payload.events[0] ? payload.events[0].timestamp : null)
        .set("dateTo", payload.events && payload.events[payload.events.length - 1] ? payload.events[payload.events.length - 1].timestamp : null)
        .set("isArchive", payload.isArchive);

    case REMOVE_ALL_EVENTS:
      return events = new DefaultReducerState();
  }

  return events;
};
