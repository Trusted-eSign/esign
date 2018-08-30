import { createSelector } from "reselect";
import {
  CERTIFICATE_GENERATION, CERTIFICATE_IMPORT, DECRYPT, DELETE_CERTIFICATE,
  DELETE_CONTAINER, ENCRYPT, PKCS12_IMPORT, SIGN, UNSIGN, 
} from "../constants";
import  localize  from "../i18n/localize";

export const eventsGetter = (state) => state.events.entities;
export const filtersGetter = (state) => state.filters;

export const filteredEventsSelector = createSelector(eventsGetter, filtersGetter, (events, filters) => {
  const { dateFrom, dateTo, level, operations, operationObjectIn, operationObjectOut, userName } = filters.events;
  return events.filter((event: any) => {
    
    return event.userName.match(userName) &&
      event.operationObject.in.match(operationObjectIn) &&
      event.operationObject.out.match(operationObjectOut) &&
      (level === "all" ? true : event.level.match(level)) &&
      (dateFrom ? (new Date(event.timestamp)).getTime() >= (new Date(dateFrom)).getTime() : true) &&
      (dateTo ? (new Date(event.timestamp)).getTime() <= (new Date(dateTo.setHours(23, 59, 59, 999))).getTime() : true) &&
      (
        operations[SIGN] && event.operation === localize("Events.sign",  window.locale)  ||
        operations[UNSIGN] && event.operation === localize("Events.remove_sign",  window.locale) ||
        operations[ENCRYPT] && event.operation === localize("Events.encrypt",  window.locale) ||
        operations[DECRYPT] && event.operation === localize("Events.decrypt",  window.locale) ||
        operations[DELETE_CERTIFICATE] && event.operation === localize("Events.cert_delete",  window.locale) ||
        operations[DELETE_CONTAINER] && event.operation === localize("Events.container_delete",  window.locale) ||
        operations[CERTIFICATE_GENERATION] && event.operation === localize("Events.cert_generation",  window.locale) ||
        operations[CERTIFICATE_IMPORT] && event.operation === localize("Events.cert_import",  window.locale) ||
        operations[PKCS12_IMPORT] && event.operation === localize("Events.PKCS12_import",  window.locale) ||
        (
          !operations[SIGN] && !operations[UNSIGN] && !operations[ENCRYPT] &&
          !operations[DECRYPT] && !operations[DELETE_CERTIFICATE] && !operations[DELETE_CONTAINER] &&
          !operations[CERTIFICATE_GENERATION] && !operations[CERTIFICATE_IMPORT] && !operations[PKCS12_IMPORT]
        )
      );
  });
});
