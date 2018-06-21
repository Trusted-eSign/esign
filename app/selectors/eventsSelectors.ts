import { createSelector } from "reselect";
import { CERTIFICATE_GENERATION, CERTIFICATE_IMPORT, DECRYPT,
  DELETE_CERTIFICATE, DELETE_CONTAINER, ENCRYPT, SIGN } from "../constants";

export const eventsGetter = (state) => state.events.entities;
export const filtersGetter = (state) => state.filters;

export const filteredEventsSelector = createSelector(eventsGetter, filtersGetter, (events, filters) => {
  const { dateFrom, dateTo, level, operations, operationObjectIn, operationObjectOut, userName } = filters;

  return events.filter((event: any) => {
    return event.userName.match(userName) &&
      event.operationObject.in.match(operationObjectIn) &&
      event.operationObject.out.match(operationObjectOut) &&
      (level === "all" ? true : event.level.match(level)) &&
      (dateFrom ? (new Date(event.timestamp)).getTime() >= (new Date(dateFrom)).getTime() : true) &&
      (dateTo ? (new Date(event.timestamp)).getTime() <= (new Date(dateTo.setHours(23, 59, 59, 999))).getTime() : true) &&
      (
        operations[SIGN] && event.operation === "Подпись" ||
        operations[ENCRYPT] && event.operation === "Шифрование" ||
        operations[DECRYPT] && event.operation === "Расшифрование" ||
        operations[DELETE_CERTIFICATE] && event.operation === "Удаление сертификата" ||
        operations[DELETE_CONTAINER] && event.operation === "Удаление контейнера" ||
        operations[CERTIFICATE_GENERATION] && event.operation === "Генерация сертификата" ||
        operations[CERTIFICATE_IMPORT] && event.operation === "Импорт сертификата"
      );
  });
});
