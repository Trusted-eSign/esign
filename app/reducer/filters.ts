import {
  CERTIFICATE_GENERATION, CERTIFICATE_IMPORT, CHANGE_FILTER_DATE_FROM, CHANGE_FILTER_DATE_TO,
  CHANGE_FILTER_IN_OPERATION_OBJECT, CHANGE_FILTER_LEVEL, CHANGE_FILTER_OPERATION_TYPE,
  CHANGE_FILTER_OUT_OPERATION_OBJECT, CHANGE_FILTER_USER_NAME, CHANGE_SEARCH_VALUE, DECRYPT, ENCRYPT,
  RESET_EVENTS_FILTERS, SIGN,
} from "../constants";

const defaultFilters = {
  dateFrom: "",
  dateTo: "",
  isDefaultFilters: true,
  level: "",
  operationObjectIn: "",
  operationObjectOut: "",
  operations: {
    CERTIFICATE_GENERATION: true,
    CERTIFICATE_IMPORT: true,
    DECRYPT: true,
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
      return { ...filters, userName: payload.userName, isDefaultFilters: false };

    case CHANGE_FILTER_IN_OPERATION_OBJECT:
      return { ...filters, operationObjectIn: payload.operationObjectIn, isDefaultFilters: false };

    case CHANGE_FILTER_OUT_OPERATION_OBJECT:
      return { ...filters, operationObjectOut: payload.operationObjectOut, isDefaultFilters: false };

    case CHANGE_FILTER_OPERATION_TYPE:
      return {
        ...filters,
        isDefaultFilters: false,
        operations: {
          ...filters.operations,
          [payload.type]: payload.value,
        },
      };

    case CHANGE_FILTER_DATE_FROM:
      return { ...filters, dateFrom: payload.dateFrom, isDefaultFilters: false };

    case CHANGE_FILTER_DATE_TO:
      return { ...filters, dateTo: payload.dateTo, isDefaultFilters: false };

    case CHANGE_FILTER_LEVEL:
      return { ...filters, level: payload.level, isDefaultFilters: false };

    case RESET_EVENTS_FILTERS:
      return {
        ...filters,
        dateFrom: "",
        dateTo: "",
        isDefaultFilters: true,
        level: "all",
        operationObjectIn: "",
        operationObjectOut: "",
        operations: {
          CERTIFICATE_GENERATION: true,
          CERTIFICATE_IMPORT: true,
          DECRYPT: true,
          ENCRYPT: true,
          SIGN: true,
        },
        userName: "",
      };
  }

  return filters;
};
