import {
  CHANGE_FILTER_DATE_FROM,
  CHANGE_FILTER_DATE_TO, CHANGE_FILTER_IN_OPERATION_OBJECT, CHANGE_FILTER_LEVEL, CHANGE_FILTER_OPERATION_TYPE,
  CHANGE_FILTER_OUT_OPERATION_OBJECT, CHANGE_FILTER_USER_NAME,
} from "../constants";

export function changeFilterUserName(userName: string) {
  return {
    payload: { userName },
    type: CHANGE_FILTER_USER_NAME,
  };
}

export function changeFilterInObject(operationObjectIn: string) {
  return {
    payload: { operationObjectIn },
    type: CHANGE_FILTER_IN_OPERATION_OBJECT,
  };
}

export function changeFilterOutObject(operationObjectOut: string) {
  return {
    payload: { operationObjectOut },
    type: CHANGE_FILTER_OUT_OPERATION_OBJECT,
  };
}

export function changeFilterDateFrom(dateFrom: Date) {
  return {
    payload: { dateFrom },
    type: CHANGE_FILTER_DATE_FROM,
  };
}

export function changeFilterDateTo(dateTo: Date) {
  return {
    payload: { dateTo },
    type: CHANGE_FILTER_DATE_TO,
  };
}

export function changeFilterOperationsType(operations: any) {
  return {
    payload: { operations },
    type: CHANGE_FILTER_OPERATION_TYPE,
  };
}

export function changeFilterLevel(level: string) {
  return {
    payload: { level },
    type: CHANGE_FILTER_LEVEL,
  };
}
