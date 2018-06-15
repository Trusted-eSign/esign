import { createSelector } from "reselect";

export const eventsGetter = (state) => state.events.entities;
export const filtersGetter = (state) => state.filters;

export const filteredEventsSelector = createSelector(eventsGetter, filtersGetter, (events, filters) => {
  const { dateFrom, dateTo, level, operationObjectIn, operationObjectOut, userName } = filters;

  return events.filter((event: any) => {
    return event.userName.match(userName) &&
      event.operationObject.in.match(operationObjectIn) &&
      event.operationObject.out.match(operationObjectOut) &&
      (level === "all" ? true : event.level.match(level)) &&
      (dateFrom ? (new Date(event.timestamp)).getTime() >= (new Date(dateFrom)).getTime() : true) &&
      (dateTo ? (new Date(event.timestamp)).getTime() <= (new Date(dateTo)).getTime() : true);
  });
});
