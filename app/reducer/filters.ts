import {
  CERTIFICATE_GENERATION, CERTIFICATE_IMPORT, CHANGE_FILTER_DATE_FROM, CHANGE_FILTER_DATE_TO,
  CHANGE_FILTER_IN_OPERATION_OBJECT, CHANGE_FILTER_LEVEL, CHANGE_FILTER_OPERATION_TYPE,
  CHANGE_FILTER_OUT_OPERATION_OBJECT, CHANGE_FILTER_USER_NAME, CHANGE_SEARCH_VALUE, DECRYPT,
  DELETE_CERTIFICATE, DELETE_CONTAINER, ENCRYPT, RESET_EVENTS_FILTERS, SIGN,
} from "../constants";

const defaultFilters = {
  dateFrom: undefined,
  dateTo: undefined,
  isDefaultFilters: true,
  level: "all",
  operationObjectIn: "",
  operationObjectOut: "",
  operations: {
    CERTIFICATE_GENERATION: true,
    CERTIFICATE_IMPORT: true,
    DECRYPT: true,
    DELETE_CERTIFICATE: true,
    DELETE_CONTAINER: true,
    ENCRYPT: true,
    SIGN: true,
  },
  searchValue: "",
  userName: "",
};

export default (filters = defaultFilters, action) => {
  const { type, payload } = action;

  switch (type) {
    case CHANGE_SEARCH_VALUE:
      return { ...filters, searchValue: payload.searchValue };

    case CHANGE_FILTER_USER_NAME:
      return { ...filters, userName: payload.userName, isDefaultFilters: checkDefaultFilters({ ...filters, userName: payload.userName }) };

    case CHANGE_FILTER_IN_OPERATION_OBJECT:
      return { ...filters, operationObjectIn: payload.operationObjectIn, isDefaultFilters: checkDefaultFilters({ ...filters, operationObjectIn: payload.operationObjectIn }) };

    case CHANGE_FILTER_OUT_OPERATION_OBJECT:
      return { ...filters, operationObjectOut: payload.operationObjectOut, isDefaultFilters: checkDefaultFilters({ ...filters, operationObjectOut: payload.operationObjectOut }) };

    case CHANGE_FILTER_OPERATION_TYPE:
      return {
        ...filters,
        isDefaultFilters: checkDefaultFilters({ ...filters, operations: { ...filters.operations, [payload.type]: payload.value } }),
        operations: {
          ...filters.operations,
          [payload.type]: payload.value,
        },
      };

    case CHANGE_FILTER_DATE_FROM:
      return { ...filters, dateFrom: payload.dateFrom, isDefaultFilters: checkDefaultFilters({ ...filters, dateFrom: payload.dateFrom }) };

    case CHANGE_FILTER_DATE_TO:
      return { ...filters, dateTo: payload.dateTo, isDefaultFilters: checkDefaultFilters({ ...filters, dateTo: payload.dateTo }) };

    case CHANGE_FILTER_LEVEL:
      return { ...filters, level: payload.level, isDefaultFilters: checkDefaultFilters({ ...filters, level: payload.level }) };

    case RESET_EVENTS_FILTERS:
      return {
        ...filters,
        dateFrom: undefined,
        dateTo: undefined,
        isDefaultFilters: true,
        level: "all",
        operationObjectIn: "",
        operationObjectOut: "",
        operations: {
          CERTIFICATE_GENERATION: true,
          CERTIFICATE_IMPORT: true,
          DECRYPT: true,
          DELETE_CERTIFICATE: true,
          DELETE_CONTAINER: true,
          ENCRYPT: true,
          SIGN: true,
        },
        userName: "",
      };
  }

  return filters;
};

const checkDefaultFilters = (filters: any) => {
  if (
    defaultFilters.dateFrom === filters.dateFrom &&
    defaultFilters.dateTo === filters.dateTo &&
    defaultFilters.level === filters.level &&
    defaultFilters.operationObjectIn === filters.operationObjectIn &&
    defaultFilters.operationObjectOut === filters.operationObjectOut &&
    defaultFilters.operations.CERTIFICATE_GENERATION === filters.operations.CERTIFICATE_GENERATION &&
    defaultFilters.operations.CERTIFICATE_IMPORT === filters.operations.CERTIFICATE_IMPORT &&
    defaultFilters.operations.DECRYPT === filters.operations.DECRYPT &&
    defaultFilters.operations.DELETE_CERTIFICATE === filters.operations.DELETE_CERTIFICATE &&
    defaultFilters.operations.DELETE_CONTAINER === filters.operations.DELETE_CONTAINER &&
    defaultFilters.operations.SIGN === filters.operations.SIGN &&
    defaultFilters.userName === filters.userName
  ) {
    return true;
  }

  return false;
};
