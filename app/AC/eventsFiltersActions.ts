import {
  APPLY_EVENTS_FILTERS, EVENTS_CHANGE_FILTER_DATE_FROM, EVENTS_CHANGE_FILTER_DATE_TO,
  EVENTS_CHANGE_FILTER_IN_OPERATION_OBJECT, EVENTS_CHANGE_FILTER_LEVEL, EVENTS_CHANGE_FILTER_OPERATION_TYPE,
  EVENTS_CHANGE_FILTER_OUT_OPERATION_OBJECT, EVENTS_CHANGE_FILTER_USER_NAME, RESET_EVENTS_FILTERS,
} from "../constants";

export function changeFilterUserName(userName: string) {
  return {
    payload: { userName },
    type: EVENTS_CHANGE_FILTER_USER_NAME,
  };
}

export function changeFilterInObject(operationObjectIn: string) {
  return {
    payload: { operationObjectIn },
    type: EVENTS_CHANGE_FILTER_IN_OPERATION_OBJECT,
  };
}

export function changeFilterOutObject(operationObjectOut: string) {
  return {
    payload: { operationObjectOut },
    type: EVENTS_CHANGE_FILTER_OUT_OPERATION_OBJECT,
  };
}

export function changeFilterDateFrom(dateFrom: Date | undefined) {
  return {
    payload: { dateFrom },
    type: EVENTS_CHANGE_FILTER_DATE_FROM,
  };
}

export function changeFilterDateTo(dateTo: Date | undefined) {
  return {
    payload: { dateTo },
    type: EVENTS_CHANGE_FILTER_DATE_TO,
  };
}

export function changeFilterOperationsType(type: string, value: boolean) {
  return {
    payload: { type, value },
    type: EVENTS_CHANGE_FILTER_OPERATION_TYPE,
  };
}

export function changeFilterLevel(level: string) {
  return {
    payload: { level },
    type: EVENTS_CHANGE_FILTER_LEVEL,
  };
}

export function applyEventsFilters(filters: any) {
  return {
    payload: { filters },
    type: APPLY_EVENTS_FILTERS,
  };
}

export function resetEventsFilters() {
  return {
    type: RESET_EVENTS_FILTERS,
  };
}
