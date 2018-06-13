import {
  CHANGE_FILTER_DATE_FROM,
  CHANGE_FILTER_DATE_TO, CHANGE_FILTER_IN_OPERATION_OBJECT, CHANGE_FILTER_OPERATION_TYPE,
  CHANGE_FILTER_OUT_OPERATION_OBJECT, CHANGE_FILTER_USER_NAME,
} from "../constants";

export function changeFilterUserName(userName: string) {
  return {
    payload: { userName },
    type: CHANGE_FILTER_USER_NAME,
  };
}

export function changeFilterInObject(inObject: string) {
  return {
    payload: { inObject },
    type: CHANGE_FILTER_IN_OPERATION_OBJECT,
  };
}

export function changeFilterOutObject(outObject: string) {
  return {
    payload: { outObject },
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
