import {
  CERTIFICATE_GENERATION, CERTIFICATE_IMPORT, CHANGE_FILTER_DATE_FROM, CHANGE_FILTER_DATE_TO,
  CHANGE_FILTER_IN_OPERATION_OBJECT, CHANGE_FILTER_LEVEL, CHANGE_FILTER_OPERATION_TYPE,
  CHANGE_FILTER_OUT_OPERATION_OBJECT, CHANGE_FILTER_USER_NAME, CHANGE_SEARCH_VALUE, DECRYPT, ENCRYPT,
  RESET_EVENTS_FILTERS, SIGN,
} from "../constants";

const defaultFilters = {
  dateFrom: "",
  dateTo: "",
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
      return { ...filters, userName: payload.userName };

    case CHANGE_FILTER_IN_OPERATION_OBJECT:
      return { ...filters, operationObjectIn: payload.operationObjectIn };

    case CHANGE_FILTER_OUT_OPERATION_OBJECT:
      return { ...filters, operationObjectOut: payload.operationObjectOut };

    case CHANGE_FILTER_OPERATION_TYPE:
      return {
        ...filters, operations: {
          ...filters.operations,
          [payload.type]: payload.value,
        },
      };

    case CHANGE_FILTER_DATE_FROM:
      return { ...filters, dateFrom: payload.dateFrom };

    case CHANGE_FILTER_DATE_TO:
      return { ...filters, dateTo: payload.dateTo };

    case CHANGE_FILTER_LEVEL:
      return { ...filters, level: payload.level };

    case RESET_EVENTS_FILTERS:
      return {
        ...filters,
        dateFrom: "",
        dateTo: "",
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
